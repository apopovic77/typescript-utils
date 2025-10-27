import { UUID } from "../types/UUID";
export type SettingsChangeHandler<T> = (newValue: T | null, oldValue: T | null, property: SettingsProperty<T>) => void;
export type VisibilityCondition = {
    dependsOn: string;
    when: any;
    operator?: 'equals' | 'not-equals' | 'includes' | 'not-includes';
};
/**
 * Base class for all settings values with event system and optional grouping
 * Used by Arkturian UI Framework for automatic UI generation and grouping
 */
export declare abstract class SettingsProperty<T> {
    readonly id: UUID;
    readonly name: string;
    readonly expectedType: string;
    group: string;
    renderInUI: boolean;
    isReadOnly: boolean;
    protected _logChanges: boolean;
    protected _multiline: boolean;
    protected _groupName?: string;
    protected _defaultValue: T | null;
    private _parents;
    private _cachedValue;
    protected _boundsMin?: number;
    protected _boundsMax?: number;
    protected _boundsStep?: number;
    private _changeHandlers;
    onChange?: () => void;
    readonly visibilityConditions: VisibilityCondition[];
    constructor(name: string, defaultValue?: T | null, group?: string, expectedType?: string);
    /**
     * Recursively searches for the first *instance* value in the hierarchy (self or parents).
     * This method deliberately ignores default values.
     * @returns The found instance value, or null if no instance value exists in the hierarchy.
     */
    protected getHierarchicalValue(): T | null;
    /**
     * Recursively searches for the first *default* value in the hierarchy (self or parents).
     * @returns The found default value, or null if no default value exists in the hierarchy.
     */
    protected getHierarchicalDefaultValue(): T | null;
    get value(): T | null;
    /**
     * Returns true if the current value is the default value (no instance value exists in hierarchy)
     */
    get isDefaultValue(): boolean;
    /**
     * Returns true if the current value comes from a parent (not own value, not default)
     */
    get isParentValue(): boolean;
    /**
     * Returns true if the current value is our own value (not from parent, not default)
     */
    get isOwnValue(): boolean;
    set value(newValue: T | null);
    protected abstract duGetValue(): T | null;
    protected abstract doSetValue(newValue: T | null): void;
    abstract clone(): SettingsProperty<T>;
    get groupName(): string | undefined;
    set groupName(groupName: string | undefined);
    get boundsMin(): number | undefined;
    set boundsMin(min: number | undefined);
    get boundsMax(): number | undefined;
    set boundsMax(max: number | undefined);
    get boundsStep(): number | undefined;
    set boundsStep(step: number | undefined);
    setBounds(min?: number, max?: number, step?: number): this;
    /**
     * Fluent API for setting bounds, identical to setBounds but for chaining.
     * @returns The instance of the property for chaining.
     */
    withBounds(min?: number, max?: number, step?: number): this;
    withName(newName: string): this;
    withLog(enabled?: boolean): this;
    /**
     * Adds a parent to the end of the fallback chain.
     * This parent will be checked if no local value and no earlier parents have a value.
     */
    addParent(parent: SettingsProperty<T>): void;
    /**
     * Adds a parent to the beginning of the fallback chain (highest priority).
     * This parent will be checked first after the local value.
     */
    prependParent(parent: SettingsProperty<T>): void;
    /**
     * Removes a specific parent from the chain.
     */
    removeParent(parent: SettingsProperty<T>): void;
    /**
     * Checks if a specific property is already in the parent chain.
     */
    hasParent(parent: SettingsProperty<T>): boolean;
    /**
     * Get current parent properties
     */
    getParents(): SettingsProperty<T>[];
    /**
     * Add visibility condition for conditional rendering in UI
     */
    addVisibilityCondition(condition: VisibilityCondition): this;
    /**
     * Check if property should be visible based on conditions
     */
    isVisible(allProperties: Map<string, SettingsProperty<any>>): boolean;
    /**
     * Fluent API for adding visibility conditions
     */
    visibleWhen(dependsOn: string, when: any, operator?: 'equals' | 'not-equals' | 'includes' | 'not-includes'): this;
    /**
     * Set value immediately without animation (for subclasses that animate)
     */
    setImmediate(value: T | null): void;
    get valueType(): string;
    get typeInfo(): {
        type: string;
        subtype?: string;
        isArray: boolean;
        isAnimatable: boolean;
        bounds?: {
            min?: number;
            max?: number;
            step?: number;
        };
        options?: any[];
        multiline?: boolean;
    };
    addChangeHandler(handler: SettingsChangeHandler<T>): void;
    removeChangeHandler(handler: SettingsChangeHandler<T>): void;
    on(handler: SettingsChangeHandler<T>): void;
    off(handler: SettingsChangeHandler<T>): void;
    protected fireChangeEvent(newValue: T | null, oldValue: T | null): void;
    private onParentValueChanged;
    /**
     * Compares two values for equality. Subclasses can override for complex types.
     * @param a The first value.
     * @param b The second value.
     * @returns True if the values are considered equal.
     */
    protected isEqual(a: T | null, b: T | null): boolean;
    /**
     * Caches the current effective value. Called after any change.
     */
    protected cacheValue(): void;
    /**
     * Destroys the property, cleaning up all parent listeners.
     */
    destroy(): void;
    private getBoundsObject;
    private getOptionsArray;
    setReadOnly(value: boolean): this;
    hideFromUI(): this;
    get multiline(): boolean;
    set multiline(value: boolean);
    setMultiline(value?: boolean): this;
}
