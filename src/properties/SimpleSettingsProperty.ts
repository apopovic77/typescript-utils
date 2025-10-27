import { SettingsProperty } from './SettingsProperty';
import { Vector3 } from '../types/Vector3';
import { Vector2 } from '../types/Vector2';
import { Color } from '../types/Color';

/**
 * Simple implementation of SettingsProperty for non-numeric values
 * No animation/interpolation - immediate value changes with events
 * Perfect for strings, booleans, enums, arrays, etc.
 */
export class SimpleSettingsProperty<T> extends SettingsProperty<T> {
    private _value: T | null;
    private _options: T[] | undefined;

    constructor(name: string, initialValue: T | null, defaultValue: T | null, groupName?: string, options?: T[], parent?: SettingsProperty<T>, expectedType?: string) {
        super(name, defaultValue, groupName, expectedType || SimpleSettingsProperty.inferType(defaultValue));
        this._options = options;
        
        // 🔧 ENUM VALIDATION: Validate initial value during construction
        if (this._options && initialValue !== null) {
            this._value = this.validateEnumValue(initialValue);
        } else {
            this._value = initialValue;
        }
        
        if (parent) {
            this.addParent(parent);
        }
    }

    /**
     * Infer type from default value for runtime type checking
     */
    private static inferType(defaultValue: any): string {
        if (defaultValue instanceof Vector3) return 'Vector3';
        if (defaultValue instanceof Vector2) return 'Vector2';
        if (defaultValue instanceof Color) return 'Color';
        if (typeof defaultValue === 'number') return 'number';
        if (typeof defaultValue === 'boolean') return 'boolean';
        if (typeof defaultValue === 'string') return 'string';
        if (Array.isArray(defaultValue)) return 'array';
        return 'unknown';
    }

    // 🚀 HIERARCHICAL IMPLEMENTATION - implement abstract methods
    protected duGetValue(): T | null {
        return this._value;
    }

    protected doSetValue(newValue: T | null): void {
        // 🔧 ENUM VALIDATION: If options are provided (enum case), validate and normalize the value
        if (this._options && newValue !== null) {
            const validatedValue = this.validateEnumValue(newValue);
            this._value = validatedValue;
        } else {
            this._value = newValue;
        }
    }

    /**
     * Validates and normalizes enum values
     * Handles case-insensitive matching for legacy data compatibility
     */
    private validateEnumValue(value: T): T | null {
        if (!this._options || value === null) {
            return value;
        }

        // 1. Direct match (ideal case)
        if (this._options.includes(value)) {
            return value;
        }

        // 2. Case-insensitive match for string enums (legacy compatibility)
        if (typeof value === 'string') {
            const stringValue = value as string;
            const matchedOption = this._options.find(option => 
                typeof option === 'string' && 
                option.toLowerCase() === stringValue.toLowerCase()
            );
            
            if (matchedOption) {
                console.warn(`🔧 [${this.name}] Normalized enum value: "${stringValue}" → "${matchedOption}"`);
                return matchedOption;
            }
        }

        // 3. Invalid value - log warning and fall back to default
        console.warn(`⚠️ [${this.name}] Invalid enum value "${value}". Valid options: [${this._options.join(', ')}]. Using default.`);
        return this._defaultValue;
    }

    // Get available options for select/enum types
    get options(): T[] | undefined {
        return this._options;
    }

    set options(options: T[] | undefined) {
        this._options = options;
    }

    // Override typeInfo to include options
    get typeInfo(): { 
        type: string; 
        subtype?: string; 
        isArray: boolean; 
        isAnimatable: boolean;
        bounds?: { min?: number; max?: number; step?: number };
        options?: T[];
    } {
        const baseInfo = super.typeInfo;
        return {
            ...baseInfo,
            options: this._options
        };
    }

    // Set value immediately (same as normal set for SimpleSettingsProperty)
    setImmediate(value: T | null): void {
        this.value = value;
    }

    public clone(): SettingsProperty<T> {
        const cloned = new SimpleSettingsProperty<T>(
            this.name,
            this.duGetValue(),
            this._defaultValue,
            this.groupName,
            this.options
        );
        this.getParents().forEach(p => cloned.addParent(p));
        return cloned;
    }

    // Fluent API for setting options
    setOptions(options: T[]): this {
        this._options = options;
        return this;
    }

    // 🚀 HIERARCHICAL FACTORY METHOD
    static create<T>(name: string, initialValue: T | null, defaultValue: T | null, groupName?: string, options?: T[], parent?: SettingsProperty<T>): SimpleSettingsProperty<T> {
        return new SimpleSettingsProperty(name, initialValue, defaultValue, groupName, options, parent);
    }


} 