import { EasingFunction } from '../types/easing';
import { SettingsProperty, SettingsChangeHandler } from './SettingsProperty';
export type PropertyChangeHandler<T> = SettingsChangeHandler<T>;
/**
 * A property that interpolates between values over time.
 * @template T The type of the property value.
 */
export declare class InterpolatedProperty<T> extends SettingsProperty<T> {
    private _targetValue;
    private _animationStartTime;
    private _startValue;
    private _duration;
    private _easing;
    showCurrentValueInUI: boolean;
    private _sinEnabled;
    private _sinAmplitude;
    private _sinFrequencyHz;
    private _sinPhaseRad;
    private _sinStartTimeMs;
    constructor(name: string, initialValue: T | null, defaultValue: T | null, defaultDuration?: number, groupName?: string, parent?: SettingsProperty<T>);
    protected duGetValue(): T | null;
    protected doSetValue(newValue: T | null): void;
    setImmediate(value: T | null): void;
    setDuration(duration: number): this;
    setEasing(easing: EasingFunction): this;
    get isInterpolating(): boolean;
    get duration(): number;
    get targetValue(): T | null;
    set targetValue(newValue: T | null);
    get progress(): number;
    private interpolate;
    protected isEqual(a: T | null, b: T | null): boolean;
    static create<T>(name: string, initialValue: T | null, defaultValue: T | null, duration?: number, groupName?: string, parent?: SettingsProperty<T>): InterpolatedProperty<T>;
    withEasing(easing: EasingFunction): this;
    withDuration(duration: number): this;
    withCurrentValueInUI(show?: boolean): this;
    clone(): SettingsProperty<T>;
    /**
     * Enable sinusoidal animation around the target value (numeric-only).
     * While active, normal interpolation is disabled and the property returns target + A*sin(2πft + phase).
     */
    enableSinAnimation(params?: {
        amplitude?: number;
        frequencyHz?: number;
        phaseRad?: number;
    }): this;
    /** Disable sinusoidal animation and restore normal interpolation behavior. */
    disableSinAnimation(): this;
    /** Update sine parameters without toggling the enabled state. */
    setSinParameters(amplitude: number, frequencyHz: number, phaseRad?: number): this;
    private clampToBounds;
}
