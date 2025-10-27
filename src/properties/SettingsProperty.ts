import { UUID } from "../types/UUID";
import { Logger } from '../core/Logger';

// import { v4 as uuidv4 } from 'uuid'; // Reverted due to dependency issues

// Event handler type for SettingsProperty changes
export type SettingsChangeHandler<T> = (newValue: T | null, oldValue: T | null, property: SettingsProperty<T>) => void;

// Visibility condition types
export type VisibilityCondition = {
    dependsOn: string; // Property name to watch
    when: any; // Value that makes this property visible
    operator?: 'equals' | 'not-equals' | 'includes' | 'not-includes'; // Defaults to 'equals'
};

/**
 * Base class for all settings values with event system and optional grouping
 * Used by Arkturian UI Framework for automatic UI generation and grouping
 */
export abstract class SettingsProperty<T> {
    public readonly id: UUID;
    public readonly name: string;
    public readonly expectedType: string; // 🎯 Explicit type information for runtime
    public group: string;
    public renderInUI: boolean = true;
    public isReadOnly: boolean = false;
    protected _logChanges: boolean = false;
    protected _multiline: boolean = false;
    protected _groupName?: string;
    protected _defaultValue: T | null;
    
    // HIERARCHICAL SYSTEM - Parent-Child Relationships
    private _parents: SettingsProperty<T>[] = [];
    private _cachedValue: T | null = null;
    
    // UI Bounds for numeric properties
    protected _boundsMin?: number;
    protected _boundsMax?: number;
    protected _boundsStep?: number;
    
    // Event system - multiple listeners like C# events
    private _changeHandlers: SettingsChangeHandler<T>[] = [];
    
    // Legacy callback for backwards compatibility
    public onChange?: () => void;

    // Visibility conditions
    public readonly visibilityConditions: VisibilityCondition[] = [];
    
    constructor(name: string, defaultValue: T | null = null, group: string = 'General', expectedType: string = 'unknown') {
        this.id = crypto.randomUUID();
        this.name = name;
        this.expectedType = expectedType;
        this.group = group;
        this._defaultValue = defaultValue;
        // The value is not cached at construction. It will be cached on the first access
        // or when the hierarchy changes.
    }

    /**
     * Recursively searches for the first *instance* value in the hierarchy (self or parents).
     * This method deliberately ignores default values.
     * @returns The found instance value, or null if no instance value exists in the hierarchy.
     */
    protected getHierarchicalValue(): T | null {
        // 1. Check for a local (instance) value on this property first.
        const localValue = this.duGetValue();
        if (localValue !== null && localValue !== undefined) {
            return localValue;
        }

        // 2. If no local value, traverse the parent chain recursively.
        for (const parent of this._parents) {
            // We need to cast the parent to `any` to access the protected method.
            // This is a controlled way to break encapsulation for the hierarchical system.
            const parentHierarchicalValue = (parent as any).getHierarchicalValue();
            if (parentHierarchicalValue !== null && parentHierarchicalValue !== undefined) {
                return parentHierarchicalValue; // Return the first valid value found.
            }
        }
        
        // 3. If no instance value is found anywhere in the chain, return null.
        return null;
    }

    /**
     * Recursively searches for the first *default* value in the hierarchy (self or parents).
     * @returns The found default value, or null if no default value exists in the hierarchy.
     */
    protected getHierarchicalDefaultValue(): T | null {
        // 1. Check for a local default value on this property first.
        if (this._defaultValue !== null && this._defaultValue !== undefined) {
            return this._defaultValue;
        }

        // 2. If no local default, traverse the parent chain for their hierarchical default.
        for (const parent of this._parents) {
            const parentDefaultValue = (parent as any).getHierarchicalDefaultValue();
            if (parentDefaultValue !== null && parentDefaultValue !== undefined) {
                return parentDefaultValue;
            }
        }
        
        // 3. If no default value is found anywhere in the chain, return null.
        return null;
    }

    // 🚀 HIERARCHICAL VALUE ACCESS - with parent fallback
    get value(): T | null {
        // 1. Try to get an instance value from the hierarchy (self or parents).
        const hierarchicalValue = this.getHierarchicalValue();

        // 2. If an instance value was found, return it immediately.
        if (hierarchicalValue !== null && hierarchicalValue !== undefined) {
            return hierarchicalValue;
        }

        // 3. If no instance value exists anywhere, fall back to the hierarchical default value.
        return this.getHierarchicalDefaultValue();
    }
    
    // 🔍 VALUE SOURCE PROPERTIES - to distinguish where the value comes from
    
    /**
     * Returns true if the current value is the default value (no instance value exists in hierarchy)
     */
    get isDefaultValue(): boolean {
        const hierarchicalValue = this.getHierarchicalValue();
        return hierarchicalValue === null || hierarchicalValue === undefined;
    }
    
    /**
     * Returns true if the current value comes from a parent (not own value, not default)
     */
    get isParentValue(): boolean {
        const ownValue = this.duGetValue();
        const hierarchicalValue = this.getHierarchicalValue();
        
        // Value comes from parent if:
        // 1. We have a hierarchical value (not default)
        // 2. But our own value is null/undefined
        return (hierarchicalValue !== null && hierarchicalValue !== undefined) && 
               (ownValue === null || ownValue === undefined);
    }
    
    /**
     * Returns true if the current value is our own value (not from parent, not default)
     */
    get isOwnValue(): boolean {
        const ownValue = this.duGetValue();
        return ownValue !== null && ownValue !== undefined;
    }
    
    set value(newValue: T | null) {
        const oldValue = this.value;
        this.doSetValue(newValue);
        
        // Fire change event if value actually changed
        if (!this.isEqual(newValue, oldValue)) {
            if (this._logChanges) {
                //Logger.Instance.Debug(`Property '${this.name}' changed: ${newValue}`);
            }
            this.fireChangeEvent(newValue, oldValue);
        } else {
            // Cache even if the value is the same, in case the underlying state changed
            this.cacheValue();
        }
    }
    
    // Abstract methods for subclasses to implement actual value storage/retrieval
    protected abstract duGetValue(): T | null;
    protected abstract doSetValue(newValue: T | null): void;
    public abstract clone(): SettingsProperty<T>;

    // Group name for UI framework grouping
    get groupName(): string | undefined {
        return this.group;
    }

    set groupName(groupName: string | undefined) {
        this.group = groupName || 'General';
    }

    // Bounds properties for UI generation
    get boundsMin(): number | undefined {
        return this._boundsMin;
    }

    set boundsMin(min: number | undefined) {
        this._boundsMin = min;
    }

    get boundsMax(): number | undefined {
        return this._boundsMax;
    }

    set boundsMax(max: number | undefined) {
        this._boundsMax = max;
    }

    get boundsStep(): number | undefined {
        return this._boundsStep;
    }

    set boundsStep(step: number | undefined) {
        this._boundsStep = step;
    }

    // Fluent API for setting bounds
    setBounds(min?: number, max?: number, step?: number): this {
        this._boundsMin = min;
        this._boundsMax = max;
        this._boundsStep = step;
        return this;
    }

    /**
     * Fluent API for setting bounds, identical to setBounds but for chaining.
     * @returns The instance of the property for chaining.
     */
    withBounds(min?: number, max?: number, step?: number): this {
        this.setBounds(min, max, step);
        return this;
    }

    public withName(newName: string): this {
        (this as any).name = newName;
        return this;
    }

    public withLog(enabled: boolean = true): this {
        this._logChanges = enabled;
        return this;
    }

    // 🚀 HIERARCHICAL PARENT MANAGEMENT
    
    /**
     * Adds a parent to the end of the fallback chain.
     * This parent will be checked if no local value and no earlier parents have a value.
     */
    addParent(parent: SettingsProperty<T>): void {
        if (!this._parents.includes(parent)) {
            const oldValue = this.value;
            this._parents.push(parent);
            parent.on(this.onParentValueChanged);
            const newValue = this.value;
            if (!this.isEqual(newValue, oldValue)) {
                this.fireChangeEvent(newValue, oldValue);
            } else {
                this.cacheValue();
            }
        }
    }
    
    /**
     * Adds a parent to the beginning of the fallback chain (highest priority).
     * This parent will be checked first after the local value.
     */
    prependParent(parent: SettingsProperty<T>): void {
        if (!this._parents.includes(parent)) {
            const oldValue = this.value;
            this._parents.unshift(parent);
            parent.on(this.onParentValueChanged);
            const newValue = this.value;
            if (!this.isEqual(newValue, oldValue)) {
                this.fireChangeEvent(newValue, oldValue);
            } else {
                this.cacheValue();
            }
        }
    }
    
    /**
     * Removes a specific parent from the chain.
     */
    removeParent(parent: SettingsProperty<T>): void {
        const oldValue = this.value;
        const index = this._parents.indexOf(parent);
        if (index > -1) {
            this._parents.splice(index, 1);
            parent.off(this.onParentValueChanged);
            const newValue = this.value;
            if (!this.isEqual(newValue, oldValue)) {
                this.fireChangeEvent(newValue, oldValue);
            } else {
                this.cacheValue();
            }
        }
    }
    
    /**
     * Checks if a specific property is already in the parent chain.
     */
    hasParent(parent: SettingsProperty<T>): boolean {
        return this._parents.includes(parent);
    }

    /**
     * Get current parent properties
     */
    getParents(): SettingsProperty<T>[] {
        return [...this._parents];
    }

    // 🚀 VISIBILITY CONDITION MANAGEMENT
    
    /**
     * Add visibility condition for conditional rendering in UI
     */
    addVisibilityCondition(condition: VisibilityCondition): this {
        this.visibilityConditions.push(condition);
        return this;
    }

    /**
     * Check if property should be visible based on conditions
     */
    isVisible(allProperties: Map<string, SettingsProperty<any>>): boolean {
        if (this.visibilityConditions.length === 0) {
            return true; // No conditions = always visible
        }

        // All conditions must be met (AND logic)
        return this.visibilityConditions.every(condition => {
            const dependentProperty = allProperties.get(condition.dependsOn);
            if (!dependentProperty) {
                return false; // Dependent property not found = not visible
            }

            const currentValue = dependentProperty.value;
            const targetValue = condition.when;
            const operator = condition.operator || 'equals';

            switch (operator) {
                case 'equals':
                    return currentValue === targetValue;
                case 'not-equals':
                    return currentValue !== targetValue;
                case 'includes':
                    return Array.isArray(currentValue) && currentValue.includes(targetValue);
                case 'not-includes':
                    return Array.isArray(currentValue) && !currentValue.includes(targetValue);
                default:
                    return currentValue === targetValue;
            }
        });
    }

    /**
     * Fluent API for adding visibility conditions
     */
    visibleWhen(dependsOn: string, when: any, operator: 'equals' | 'not-equals' | 'includes' | 'not-includes' = 'equals'): this {
        return this.addVisibilityCondition({ dependsOn, when, operator });
    }
    
    /**
     * Set value immediately without animation (for subclasses that animate)
     */
    setImmediate(value: T | null): void {
        this.value = value;
    }

    // Type information for UI framework
    get valueType(): string {
        const currentValue = this.value;
        
        if (currentValue === null) return 'null';
        if (currentValue === undefined) return 'undefined';
        
        const basicType = typeof currentValue;
        
        if (Array.isArray(currentValue)) {
            if (currentValue.length === 0) return 'array';
            const firstElementType = typeof currentValue[0];
            return `array<${firstElementType}>`;
        }
        
        if (basicType === 'object' && currentValue !== null) {
            const constructorName = currentValue.constructor?.name;
            if (constructorName && constructorName !== 'Object') {
                return constructorName;
            }
            return 'object';
        }
        
        if (basicType === 'string') {
            const stringValue = currentValue as string;
            if (stringValue.startsWith('#') && (stringValue.length === 4 || stringValue.length === 7)) {
                return 'color';
            }
        }
        
        return basicType;
    }

    get typeInfo(): { 
        type: string; 
        subtype?: string; 
        isArray: boolean; 
        isAnimatable: boolean;
        bounds?: { min?: number; max?: number; step?: number };
        options?: any[];
        multiline?: boolean;
    } {
        const value = this.value;
        const isAnimatable = 'isInterpolating' in this && typeof (this as any).setDuration === 'function';
        
        const infoBase = {
            isArray: false,
            isAnimatable: isAnimatable,
            bounds: this.getBoundsObject(),
            options: this.getOptionsArray(),
            multiline: this._multiline
        };

        if (value === null) return { ...infoBase, type: 'null' };
        if (value === undefined) return { ...infoBase, type: 'undefined' };

        if (typeof value === 'object') {
            const constructorName = (value as object).constructor?.name;
            let subtype = (constructorName && constructorName !== 'Object') ? constructorName : undefined;
            let type = 'object';

            // Special case for Color objects, which are handled by a string/color control
            if (constructorName === 'Color') {
                type = 'string';
                subtype = 'color';
            }
            
            return { ...infoBase, type, subtype, isArray: Array.isArray(value) };
        }
        
        if (typeof value === 'string') {
            let subtype: string | undefined = undefined;
            if (value.startsWith('#') && (value.length === 4 || value.length === 7)) {
                subtype = 'color';
            }
            return { ...infoBase, type: 'string', subtype };
        }
        
        // Fallback for number, boolean, etc.
        return { ...infoBase, type: typeof value };
    }

    // Event subscription methods (like C# += operator)
    public addChangeHandler(handler: SettingsChangeHandler<T>): void {
        if (!this._changeHandlers.includes(handler)) {
            this._changeHandlers.push(handler);
        }
    }

    // Event unsubscription (like C# -= operator)  
    public removeChangeHandler(handler: SettingsChangeHandler<T>): void {
        const index = this._changeHandlers.indexOf(handler);
        if (index > -1) {
            this._changeHandlers.splice(index, 1);
        }
    }

    // Convenience methods with shorter names
    public on(handler: SettingsChangeHandler<T>): void {
        this.addChangeHandler(handler);
    }

    public off(handler: SettingsChangeHandler<T>): void {
        this.removeChangeHandler(handler);
    }

    // Fire all event handlers - to be called by subclasses
    protected fireChangeEvent(newValue: T | null, oldValue: T | null): void {
        // Fire modern event handlers
        for (const handler of this._changeHandlers) {
            handler(newValue, oldValue, this);
        }
        // Fire legacy callback
        if (this.onChange) {
            this.onChange();
        }
        this.cacheValue();
    }

    private onParentValueChanged = () => {
        // A parent's value has changed, which might affect our effective value.
        const oldValue = this._cachedValue;
        const newValue = this.value;

        if (!this.isEqual(newValue, oldValue)) {
            this.fireChangeEvent(newValue, oldValue);
        }
    };

    /**
     * Compares two values for equality. Subclasses can override for complex types.
     * @param a The first value.
     * @param b The second value.
     * @returns True if the values are considered equal.
     */
    protected isEqual(a: T | null, b: T | null): boolean {
        // Handle null/undefined cases
        if (a === null && b === null) return true;
        if (a === null || b === null) return false;
        if (a === undefined && b === undefined) return true;
        if (a === undefined || b === undefined) return false;
        
        // If the objects have an 'equals' method, use it for comparison.
        // This is common for Vector3, Quaternion, Color, etc.
        if (typeof (a as any).equals === 'function') {
            return (a as any).equals(b);
        }
        
        // Default implementation for primitive types
        return a === b;
    }

    /**
     * Caches the current effective value. Called after any change.
     */
    protected cacheValue(): void {
        this._cachedValue = this.value;
    }

    /**
     * Destroys the property, cleaning up all parent listeners.
     */
    destroy(): void {
        const parentsToUnsubscribe = [...this._parents];
        for (const parent of parentsToUnsubscribe) {
            this.removeParent(parent);
        }
    }

    // Helper to get bounds as an object
    private getBoundsObject() {
        return {
            min: this._boundsMin,
            max: this._boundsMax,
            step: this._boundsStep
        };
    }

    // Helper to get options as an array
    private getOptionsArray(): any[] {
        return [];
    }

    // --- Fluent API for chaining settings ---
    setReadOnly(value: boolean): this {
        this.isReadOnly = value;
        return this;
    }

    hideFromUI(): this {
        this.renderInUI = false;
        return this;
    }

    get multiline(): boolean {
        return this._multiline;
    }

    set multiline(value: boolean) {
        this._multiline = value;
    }

    setMultiline(value: boolean = true): this {
        this._multiline = value;
        return this;
    }
} 