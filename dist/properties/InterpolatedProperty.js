import { Easing } from '../types/easing';
import { isLerpable, isEquatable, isSlerpable } from '../types/type-guards';
import { SettingsProperty } from './SettingsProperty';
/**
 * A property that interpolates between values over time.
 * @template T The type of the property value.
 */
export class InterpolatedProperty extends SettingsProperty {
    constructor(name, initialValue, defaultValue, defaultDuration = 0.5, groupName, parent) {
        super(name, defaultValue, groupName);
        this._targetValue = null;
        this._animationStartTime = null;
        this._startValue = null;
        this._duration = 0.5;
        this._easing = Easing.exponentialOut;
        this.showCurrentValueInUI = false;
        // === Sin animation mode (numeric-only) ===
        this._sinEnabled = false;
        this._sinAmplitude = 0;
        this._sinFrequencyHz = 1;
        this._sinPhaseRad = 0;
        this._sinStartTimeMs = 0;
        this._targetValue = initialValue;
        this._duration = defaultDuration;
        if (parent) {
            this.addParent(parent);
        }
        const effectiveInitialValue = this.value;
        if (effectiveInitialValue !== null) {
            this._startValue = effectiveInitialValue;
        }
        else {
            this._startValue = {};
        }
        this._animationStartTime = 0;
    }
    duGetValue() {
        // When sine animation is enabled, we oscillate around the target (or parent target) value
        // and ignore normal interpolation. This only applies to numeric properties.
        if (this._sinEnabled) {
            const base = this.targetValue; // use hierarchical target value as the center
            if (base === null || base === undefined) {
                return null;
            }
            if (typeof base === 'number') {
                const nowMs = performance.now();
                const tSec = (nowMs - this._sinStartTimeMs) / 1000;
                const value = base + this._sinAmplitude * Math.sin(2 * Math.PI * this._sinFrequencyHz * tSec + this._sinPhaseRad);
                return this.clampToBounds(value);
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
        const elapsed = (now - this._animationStartTime) / 1000;
        if (elapsed >= this._duration) {
            return this._targetValue;
        }
        const t = Math.min(elapsed / this._duration, 1);
        const easedT = this._easing(t);
        return this.interpolate(this._startValue, this._targetValue, easedT);
    }
    doSetValue(newValue) {
        const oldValue = this.duGetValue(); // Use getCurrentValue to avoid re-triggering animation logic
        if (this.isEqual(newValue, this._targetValue)) {
            return;
        }
        // While sine mode is active, we do not run the normal interpolation curve.
        if (this._sinEnabled) {
            this._targetValue = newValue;
            this._startValue = newValue; // not used in sine mode
            this._animationStartTime = 0;
            return;
        }
        if (this.isInterpolating) {
            this._targetValue = newValue;
            this._startValue = oldValue; // Re-capture the start value for the new curve
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
        }
        else {
            this._startValue = oldValue;
            this._animationStartTime = performance.now();
        }
    }
    setImmediate(value) {
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
    setDuration(duration) {
        this._duration = duration;
        return this;
    }
    setEasing(easing) {
        this._easing = easing;
        return this;
    }
    get isInterpolating() {
        if (this._sinEnabled)
            return false; // sine mode overrides normal interpolation
        if (this._animationStartTime === 0 || this._targetValue === null)
            return false;
        const now = performance.now();
        const elapsed = (now - this._animationStartTime) / 1000;
        return elapsed < this._duration;
    }
    get duration() {
        return this._duration;
    }
    get targetValue() {
        // 1. Check for a local target value first.
        if (this._targetValue !== null) {
            return this._targetValue;
        }
        // 2. If no local value, traverse the parent chain recursively.
        for (const parent of this.getParents()) {
            if ('targetValue' in parent && parent.targetValue !== null) {
                return parent.targetValue;
            }
            // Fallback for simple properties where value is the target
            if (parent.value !== null) {
                return parent.value;
            }
        }
        // 3. If no target found anywhere, return the default value.
        return this._defaultValue;
    }
    set targetValue(newValue) {
        this.value = newValue;
    }
    get progress() {
        if (this._animationStartTime === 0)
            return 1;
        const now = performance.now();
        const elapsed = (now - this._animationStartTime) / 1000;
        return Math.min(elapsed / this._duration, 1);
    }
    interpolate(start, end, t) {
        if (isSlerpable(start) && isSlerpable(end)) {
            return start.slerp(end, t);
        }
        if (isLerpable(start) && isLerpable(end)) {
            return start.lerp(end, t);
        }
        if (typeof start === 'number' && typeof end === 'number') {
            return (start + (end - start) * t);
        }
        return t < 0.5 ? start : end;
    }
    isEqual(a, b) {
        if (a === null || a === undefined)
            return a === b;
        if (b === null || b === undefined)
            return false;
        if (isEquatable(a)) {
            return a.equals(b);
        }
        if (typeof a === 'number' && typeof b === 'number') {
            return Math.abs(a - b) < 0.000001;
        }
        return a === b;
    }
    static create(name, initialValue, defaultValue, duration = 0.5, groupName, parent) {
        return new InterpolatedProperty(name, initialValue, defaultValue, duration, groupName, parent);
    }
    withEasing(easing) {
        this._easing = easing;
        return this;
    }
    withDuration(duration) {
        this._duration = duration;
        return this;
    }
    withCurrentValueInUI(show = true) {
        this.showCurrentValueInUI = show;
        return this;
    }
    clone() {
        const cloned = new InterpolatedProperty(this.name, this.targetValue, this._defaultValue, this._duration, this.groupName);
        cloned.setEasing(this._easing);
        cloned.withCurrentValueInUI(this.showCurrentValueInUI);
        cloned.setBounds(this.boundsMin, this.boundsMax, this.boundsStep);
        this.getParents().forEach(p => cloned.addParent(p));
        // Copy sine animation state
        cloned._sinEnabled = this._sinEnabled;
        cloned._sinAmplitude = this._sinAmplitude;
        cloned._sinFrequencyHz = this._sinFrequencyHz;
        cloned._sinPhaseRad = this._sinPhaseRad;
        cloned._sinStartTimeMs = performance.now();
        return cloned;
    }
    // === Public API: Sine animation ===
    /**
     * Enable sinusoidal animation around the target value (numeric-only).
     * While active, normal interpolation is disabled and the property returns target + A*sin(2πft + phase).
     */
    enableSinAnimation(params) {
        if (params) {
            if (typeof params.amplitude === 'number')
                this._sinAmplitude = params.amplitude;
            if (typeof params.frequencyHz === 'number')
                this._sinFrequencyHz = params.frequencyHz;
            if (typeof params.phaseRad === 'number')
                this._sinPhaseRad = params.phaseRad;
        }
        this._sinStartTimeMs = performance.now();
        this._sinEnabled = true;
        // Stop any ongoing interpolation
        this._animationStartTime = 0;
        return this;
    }
    /** Disable sinusoidal animation and restore normal interpolation behavior. */
    disableSinAnimation() {
        this._sinEnabled = false;
        return this;
    }
    /** Update sine parameters without toggling the enabled state. */
    setSinParameters(amplitude, frequencyHz, phaseRad = 0) {
        this._sinAmplitude = amplitude;
        this._sinFrequencyHz = frequencyHz;
        this._sinPhaseRad = phaseRad;
        return this;
    }
    // Clamp helper for numeric bounds
    clampToBounds(value) {
        let v = value;
        if (typeof this.boundsMin === 'number' && v < this.boundsMin)
            v = this.boundsMin;
        if (typeof this.boundsMax === 'number' && v > this.boundsMax)
            v = this.boundsMax;
        return v;
    }
}
