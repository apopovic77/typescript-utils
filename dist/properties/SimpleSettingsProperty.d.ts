import { SettingsProperty } from './SettingsProperty';
/**
 * Simple implementation of SettingsProperty for non-numeric values
 * No animation/interpolation - immediate value changes with events
 * Perfect for strings, booleans, enums, arrays, etc.
 */
export declare class SimpleSettingsProperty<T> extends SettingsProperty<T> {
    private _value;
    private _options;
    constructor(name: string, initialValue: T | null, defaultValue: T | null, groupName?: string, options?: T[], parent?: SettingsProperty<T>, expectedType?: string);
    /**
     * Infer type from default value for runtime type checking
     */
    private static inferType;
    protected duGetValue(): T | null;
    protected doSetValue(newValue: T | null): void;
    /**
     * Validates and normalizes enum values
     * Handles case-insensitive matching for legacy data compatibility
     */
    private validateEnumValue;
    get options(): T[] | undefined;
    set options(options: T[] | undefined);
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
        options?: T[];
    };
    setImmediate(value: T | null): void;
    clone(): SettingsProperty<T>;
    setOptions(options: T[]): this;
    static create<T>(name: string, initialValue: T | null, defaultValue: T | null, groupName?: string, options?: T[], parent?: SettingsProperty<T>): SimpleSettingsProperty<T>;
}
