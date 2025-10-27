// import { isLerpable, isEquatable } from '../types/type-guards';
// import { SettingsProperty } from './SettingsProperty';

// /**
//  * A property that smoothly converges to its target value each frame.
//  * Instead of a fixed duration, it uses a speed factor for continuous,
//  * frame-rate independent interpolation.
//  * 
//  * Formula: currentValue += (targetValue - currentValue) * speedFactor
//  */
// export class ConvergentProperty<T> extends SettingsProperty<T> {
//     private _currentValue: T | null;
//     private _targetValue: T | null;
//     public speedFactor: number;
//     private _startValue: T | null;
//     private _startTime: number;

//     constructor(name: string, initialValue: T | null, speedFactor: number = 0.1, groupName?: string, parent?: SettingsProperty<T>) {
//         super(name, null, groupName);
        
//         this.speedFactor = speedFactor;
        
//         if (parent) {
//             this.addParent(parent);
//         }

//         // The effective value could come from the parent.
//         const effectiveInitialValue = this.value;
//         this._currentValue = effectiveInitialValue;
//         this._targetValue = effectiveInitialValue;
//         this._startValue = effectiveInitialValue;
//         this._startTime = performance.now();
//     }

//     // 🚀 HIERARCHICAL IMPLEMENTATION - implement abstract methods
//     protected duGetValue(): T | null {
//         // The "current" value is the actively interpolating value.
//         // It's managed internally by the update loop.
//         return this._currentValue;
//     }

//     protected doSetValue(newValue: T | null): void {
//         const oldValue = this.duGetValue();

//         // If the new value is the same as the current target, do nothing.
//         if (this.isEqual(newValue, this._targetValue)) {
//             return;
//         }

//         // If we are already converging, just update the target and restart the clock
//         // from the current position. This creates a smooth, responsive feel.
//         if (this.isConverging) {
//             this._targetValue = newValue;
//             if (oldValue !== null) {
//                 this._startValue = oldValue;
//             }
//             this._startTime = performance.now();
//             return;
//         }

//         this._targetValue = newValue;

//         // If there was no previous value, snap directly to the new value.
//         if (this._currentValue === null && newValue !== null) {
//             this._currentValue = newValue;
//         }
//     }

//     /**
//      * The core update logic, to be called once per frame from the main loop.
//      * @param deltaTime The time elapsed since the last frame.
//      */
//     public update(deltaTime: number): void {
//         if (this._currentValue === null || this._targetValue === null) {
//             // Nothing to interpolate from or to.
//             return;
//         }

//         if (this.isEqual(this._currentValue, this._targetValue)) {
//             // Already at the target.
//             return;
//         }
        
//         // Adjust the speed factor for frame-rate independence.
//         const adjustedSpeed = 1 - Math.exp(-this.speedFactor * deltaTime * 60);

//         this._currentValue = this.interpolate(this._currentValue, this._targetValue, adjustedSpeed);

//         // Fire a change event so the UI and other systems can react to the new value.
//         // We pass the target value as the 'new' value for event consistency.
//         this.fireChangeEvent(this._currentValue, null); // oldValue is tricky here, null is a safe bet
//     }

//     /**
//      * The final value that the property is converging towards.
//      */
//     get targetValue(): T | null {
//         return this._targetValue;
//     }

//     // Type-specific interpolation
//     private interpolate(start: T, end: T, t: number): T {
//         // Use lerp method if available (for Vector3, Color, etc.)
//         if (isLerpable(start) && isLerpable(end)) {
//             return start.lerp(end, t);
//         }

//         // Handle numbers
//         if (typeof start === 'number' && typeof end === 'number') {
//             // This is your formula: start + (end - start) * t
//             return (start + (end - start) * t) as T;
//         }

//         // Default: just snap for non-lerpable types
//         return end;
//     }

//     // Set value immediately without interpolation
//     setImmediate(value: T | null): void {
//         const wasChanged = !this.isEqual(value, this._currentValue);
        
//         if (wasChanged) {
//             const oldValue = this._currentValue;
//             this._targetValue = value;
//             this._currentValue = value;
//             this.fireChangeEvent(value, oldValue);
//         }
//     }

//     // Override parent's isEqual with specific logic
//     protected isEqual(a: T | null, b: T | null): boolean {
//         if (a === null || b === null) {
//             return a === b;
//         }

//         // Use equals method if available
//         if (isEquatable(a) && isEquatable(b)) {
//             return a.equals(b);
//         }

//         if (typeof a === 'number' && typeof b === 'number') {
//             // For convergent properties, we consider them "equal" if they are very close.
//             // This prevents the update loop from running forever on tiny floating point differences.
//             return Math.abs(a - b) < 0.0001;
//         }
        
//         // Fallback to strict equality for other types
//         return a === b;
//     }

//     get isConverging(): boolean {
//         const now = performance.now();
//         const elapsed = now - this._startTime;
//         return elapsed < 1000; // Assuming 1 second as the convergence duration
//     }
// } 