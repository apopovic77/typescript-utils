import { SettingsProperty } from './SettingsProperty';
import { Vector3 } from '../types/Vector3';
import { Vector2 } from '../types/Vector2';
import { Color } from '../types/Color';
/**
 * Simple implementation of SettingsProperty for non-numeric values
 * No animation/interpolation - immediate value changes with events
 * Perfect for strings, booleans, enums, arrays, etc.
 */
export class SimpleSettingsProperty extends SettingsProperty {
    constructor(name, initialValue, defaultValue, groupName, options, parent, expectedType) {
        super(name, defaultValue, groupName, expectedType || SimpleSettingsProperty.inferType(defaultValue));
        this._options = options;
        // 🔧 ENUM VALIDATION: Validate initial value during construction
        if (this._options && initialValue !== null) {
            this._value = this.validateEnumValue(initialValue);
        }
        else {
            this._value = initialValue;
        }
        if (parent) {
            this.addParent(parent);
        }
    }
    /**
     * Infer type from default value for runtime type checking
     */
    static inferType(defaultValue) {
        if (defaultValue instanceof Vector3)
            return 'Vector3';
        if (defaultValue instanceof Vector2)
            return 'Vector2';
        if (defaultValue instanceof Color)
            return 'Color';
        if (typeof defaultValue === 'number')
            return 'number';
        if (typeof defaultValue === 'boolean')
            return 'boolean';
        if (typeof defaultValue === 'string')
            return 'string';
        if (Array.isArray(defaultValue))
            return 'array';
        return 'unknown';
    }
    // 🚀 HIERARCHICAL IMPLEMENTATION - implement abstract methods
    duGetValue() {
        return this._value;
    }
    doSetValue(newValue) {
        // 🔧 ENUM VALIDATION: If options are provided (enum case), validate and normalize the value
        if (this._options && newValue !== null) {
            const validatedValue = this.validateEnumValue(newValue);
            this._value = validatedValue;
        }
        else {
            this._value = newValue;
        }
    }
    /**
     * Validates and normalizes enum values
     * Handles case-insensitive matching for legacy data compatibility
     */
    validateEnumValue(value) {
        if (!this._options || value === null) {
            return value;
        }
        // 1. Direct match (ideal case)
        if (this._options.includes(value)) {
            return value;
        }
        // 2. Case-insensitive match for string enums (legacy compatibility)
        if (typeof value === 'string') {
            const stringValue = value;
            const matchedOption = this._options.find(option => typeof option === 'string' &&
                option.toLowerCase() === stringValue.toLowerCase());
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
    get options() {
        return this._options;
    }
    set options(options) {
        this._options = options;
    }
    // Override typeInfo to include options
    get typeInfo() {
        const baseInfo = super.typeInfo;
        return {
            ...baseInfo,
            options: this._options
        };
    }
    // Set value immediately (same as normal set for SimpleSettingsProperty)
    setImmediate(value) {
        this.value = value;
    }
    clone() {
        const cloned = new SimpleSettingsProperty(this.name, this.duGetValue(), this._defaultValue, this.groupName, this.options);
        this.getParents().forEach(p => cloned.addParent(p));
        return cloned;
    }
    // Fluent API for setting options
    setOptions(options) {
        this._options = options;
        return this;
    }
    // 🚀 HIERARCHICAL FACTORY METHOD
    static create(name, initialValue, defaultValue, groupName, options, parent) {
        return new SimpleSettingsProperty(name, initialValue, defaultValue, groupName, options, parent);
    }
}
