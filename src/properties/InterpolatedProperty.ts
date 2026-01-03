import { EasingFunction, Easing } from '../types/easing';
import { Lerpable, Equatable } from '../types/Lerpable';
import { Slerpable } from '../types/Slerpable';
import { isLerpable, isEquatable, isSlerpable } from '../types/type-guards';
import { SettingsProperty, SettingsChangeHandler } from './SettingsProperty';
import { Logger } from '../core/Logger';

export type PropertyChangeHandler<T> = SettingsChangeHandler<T>;

/**
 * A property that interpolates between values over time.
 * @template T The type of the property value.
 */
export class InterpolatedProperty<T> extends SettingsProperty<T> {
    private _targetValue: T | null = null;
    private _animationStartTime: number | null = null;
    private _startValue: T | null = null;
    private _duration: number = 0.5;
    private _easing: EasingFunction = Easing.exponentialOut;
    public showCurrentValueInUI: boolean = false;

    // === Sin animation mode (numeric-only) ===
    private _sinEnabled: boolean = false;
    private _sinAmplitude: number = 0;
    private _sinFrequencyHz: number = 1;
    private _sinPhaseRad: number = 0;
    private _sinStartTimeMs: number = 0;

    constructor(
        name: string, 
        initialValue: T | null, 
        defaultValue: T | null, 
        defaultDuration: number = 0.5, 
        groupName?: string, 
        parent?: SettingsProperty<T>
    ) {
        super(name, defaultValue, groupName);
        this._targetValue = initialValue;
        this._duration = defaultDuration;
        
        if (parent) {
            this.addParent(parent);
        }
        
        const effectiveInitialValue = this.value;
        
        if (effectiveInitialValue !== null) {
            this._startValue = effectiveInitialValue;
        } else {
            this._startValue = {} as T; 
        }
        
        this._animationStartTime = 0;
    }


    protected duGetValue(): T | null {
        // When sine animation is enabled, we oscillate around the target (or parent target) value
        // and ignore normal interpolation. This only applies to numeric properties.
        if (this._sinEnabled) {
            const base = this.targetValue as any; // use hierarchical target value as the center
            if (base === null || base === undefined) {
                return null;
            }
            if (typeof base === 'number') {
                const nowMs = performance.now();
                const tSec = (nowMs - this._sinStartTimeMs) / 1000;
                const value = base + this._sinAmplitude * Math.sin(2 * Math.PI * this._sinFrequencyHz * tSec + this._sinPhaseRad);
                return this.clampToBounds(value) as any as T;
            }
            // Non-numeric types are not supported for sine mode; fall back to normal behavior
        }

        if (this._targetValue === null || this._targetValue === undefined) {
            return null;
        }

        if (!this.isInterpolating) {
            return this._targetValue;
        }

        const now = performance.now();
        const elapsed = (now - this._animationStartTime!) / 1000;
        
        if (elapsed >= this._duration) {
            return this._targetValue;
        }

        const t = Math.min(elapsed / this._duration, 1);
        const easedT = this._easing(t);

        return this.interpolate(this._startValue!, this._targetValue, easedT);
    }

    protected doSetValue(newValue: T | null): void {
        const oldValue = this.duGetValue(); // Use getCurrentValue to avoid re-triggering animation logic

        if (this.isEqual(newValue, this._targetValue)) {
            return;
        }

        // While sine mode is active, we do not run the normal interpolation curve.
        if (this._sinEnabled) {
            this._targetValue = newValue;
            this._startValue = newValue as any; // not used in sine mode
            this._animationStartTime = 0;
            return;
        }

        if (this.isInterpolating) {
            this._targetValue = newValue;
            this._startValue = oldValue!; // Re-capture the start value for the new curve
            this._animationStartTime = performance.now(); // Reset time to start the new curve
            return;
        }

        this._targetValue = newValue;

        if (newValue === null) {
            this._animationStartTime = 0;
            return;
        }

        if (oldValue === null) {
            this._startValue = newValue;
            this._animationStartTime = 0;
        } else {
            this._startValue = oldValue;
            this._animationStartTime = performance.now();
        }
    }

    setImmediate(value: T | null): void {
        const oldValue = this.value;
        const wasChanged = !this.isEqual(value, oldValue);

        // ALWAYS stop any running animation and set value immediately
        // This is critical for physics systems where position must be enforced
        // even if the target value hasn't changed (e.g., RIGID constraints)
        this._targetValue = value;

        if (value !== null) {
            this._startValue = value;
        }
        this._animationStartTime = 0; // ALWAYS stop animation

        // Only fire change event if value actually changed
        if (wasChanged) {
            this.fireChangeEvent(value, oldValue);
        }
    }

    setDuration(duration: number): this {
        this._duration = duration;
        return this;
    }

    setEasing(easing: EasingFunction): this {
        this._easing = easing;
        return this;
    }

    get isInterpolating(): boolean {
        if (this._sinEnabled) return false; // sine mode overrides normal interpolation
        if (this._animationStartTime === 0 || this._targetValue === null) return false;
        
        const now = performance.now();
        const elapsed = (now - this._animationStartTime!) / 1000;
        
        return elapsed < this._duration;
    }

    get duration(): number {
        return this._duration;
    }

    get targetValue(): T | null {
        // 1. Check for a local target value first.
        if (this._targetValue !== null) {
            return this._targetValue;
        }

        // 2. If no local value, traverse the parent chain recursively.
        for (const parent of this.getParents()) {
            if ('targetValue' in parent && parent.targetValue !== null) {
                return parent.targetValue as T | null;
            }
            // Fallback for simple properties where value is the target
            if (parent.value !== null) {
                return parent.value;
            }
        }
        
        // 3. If no target found anywhere, return the default value.
        return this._defaultValue;
    }

    set targetValue(newValue: T | null) {
        this.value = newValue;
    }

    get progress(): number {
        if (this._animationStartTime === 0) return 1;
        
        const now = performance.now();
        const elapsed = (now - this._animationStartTime!) / 1000;
        return Math.min(elapsed / this._duration, 1);
    }

    private interpolate(start: T, end: T, t: number): T {
        if (isSlerpable(start) && isSlerpable(end)) {
            return (start as Slerpable<T>).slerp(end, t);
        }

        if (isLerpable(start) && isLerpable(end)) {
            return (start as Lerpable<T>).lerp(end, t);
        }

        if (typeof start === 'number' && typeof end === 'number') {
            return (start + (end - start) * t) as T;
        }

        return t < 0.5 ? start : end;
    }

    protected isEqual(a: T | null, b: T | null): boolean {
        if (a === null || a === undefined) return a === b;
        if (b === null || b === undefined) return false;

        if (isEquatable(a)) {
            return (a as Equatable<T>).equals(b as T);
        }

        if (typeof a === 'number' && typeof b === 'number') {
            return Math.abs(a - b) < 0.000001;
        }
        
        return a === b;
    }

    static create<T>(
        name: string, 
        initialValue: T | null, 
        defaultValue: T | null, 
        duration: number = 0.5, 
        groupName?: string, 
        parent?: SettingsProperty<T>
    ): InterpolatedProperty<T> {
        return new InterpolatedProperty(name, initialValue, defaultValue, duration, groupName, parent);
    }

    withEasing(easing: EasingFunction): this {
        this._easing = easing;
        return this;
    }

    withDuration(duration: number): this {
        this._duration = duration;
        return this;
    }

    withCurrentValueInUI(show: boolean = true): this {
        this.showCurrentValueInUI = show;
        return this;
    }

    public clone(): SettingsProperty<T> {
        const cloned = new InterpolatedProperty<T>(
            this.name,
            this.targetValue,
            this._defaultValue,
            this._duration,
            this.groupName
        );
        cloned.setEasing(this._easing);
        cloned.withCurrentValueInUI(this.showCurrentValueInUI);
        cloned.setBounds(this.boundsMin, this.boundsMax, this.boundsStep);
        this.getParents().forEach(p => cloned.addParent(p));
        // Copy sine animation state
        (cloned as any)._sinEnabled = this._sinEnabled;
        (cloned as any)._sinAmplitude = this._sinAmplitude;
        (cloned as any)._sinFrequencyHz = this._sinFrequencyHz;
        (cloned as any)._sinPhaseRad = this._sinPhaseRad;
        (cloned as any)._sinStartTimeMs = performance.now();
        return cloned;
    }

    // === Public API: Sine animation ===
    /**
     * Enable sinusoidal animation around the target value (numeric-only).
     * While active, normal interpolation is disabled and the property returns target + A*sin(2πft + phase).
     */
    public enableSinAnimation(params?: { amplitude?: number; frequencyHz?: number; phaseRad?: number }): this {
        if (params) {
            if (typeof params.amplitude === 'number') this._sinAmplitude = params.amplitude;
            if (typeof params.frequencyHz === 'number') this._sinFrequencyHz = params.frequencyHz;
            if (typeof params.phaseRad === 'number') this._sinPhaseRad = params.phaseRad;
        }
        this._sinStartTimeMs = performance.now();
        this._sinEnabled = true;
        // Stop any ongoing interpolation
        this._animationStartTime = 0;
        return this;
    }

    /** Disable sinusoidal animation and restore normal interpolation behavior. */
    public disableSinAnimation(): this {
        this._sinEnabled = false;
        return this;
    }

    /** Update sine parameters without toggling the enabled state. */
    public setSinParameters(amplitude: number, frequencyHz: number, phaseRad: number = 0): this {
        this._sinAmplitude = amplitude;
        this._sinFrequencyHz = frequencyHz;
        this._sinPhaseRad = phaseRad;
        return this;
    }

    // Clamp helper for numeric bounds
    private clampToBounds(value: number): number {
        let v = value;
        if (typeof this.boundsMin === 'number' && v < this.boundsMin) v = this.boundsMin;
        if (typeof this.boundsMax === 'number' && v > this.boundsMax) v = this.boundsMax;
        return v;
    }
}