/**
 * TypeScript Enums for 3D Presenter Engine
 * Replaces magic strings with type-safe enums
 */

// Label Orientation Mode (from F2 Dialog)
export enum TextOrientationMode {
    BILLBOARD = 'billboard',
    STATIC = 'static'
}

// Label Render Mode (from F2 Dialog)
export enum TextRenderMode {
    HTML = 'html',
    CANVAS = 'canvas',
    SCREEN_HTML = 'screen-html',
    SCREEN_HTML_STATIC = 'screen-html-static'
}

// Label Mesh Types
export enum LabelMeshType {
    CANVAS = 'canvas',
    HTML = 'html',
    SCREEN_HTML = 'screen-html',
    SCREEN_HTML_STATIC = 'screen-html-static'
}

// Label Background Mode (from F2 Dialog)
export enum TextBackgroundMode {
    BLOCK = 'block',
    LINE = 'line'
}


// Label Modes (from markdown meta)
export enum LabelMode {
    CHILD = 'child',        // Label rotates with object
    INDEPENDENT = 'independent', // Label stays independent (billboard)
    POINTER = 'pointer'     // Line points to object with target
}

// Label Visibility Modes
export enum LabelVisibilityMode {
    ALWAYS = 'always',
    HOVER = 'hover',
    SELECTED = 'selected',
    NEVER = 'never'
}

// Camera Rotation Modes
export enum CameraRotationMode {
    FIXED_OFFSET = 'fixed_offset',
    SMOOTH_TURN = 'smooth_turn',
    DIRECT_AXIS = 'direct_axis'
}

// Layout Modes
export enum LayoutMode {
    UPHILL = 'uphill',
    GRID = 'grid',
    CIRCLE = 'circle',
    LINE = 'line',
    SPIRAL = 'spiral',
    HORIZONTAL = 'horizontal',
    VERTICAL = 'vertical'
}

// Helper functions for enum validation
export class EnumUtils {
    static isValidTextOrientationMode(value: string): value is TextOrientationMode {
        return Object.values(TextOrientationMode).includes(value as TextOrientationMode);
    }

    static isValidTextRenderMode(value: string): value is TextRenderMode {
        return Object.values(TextRenderMode).includes(value as TextRenderMode);
    }

    static isValidLabelMeshType(value: string): value is LabelMeshType {
        return Object.values(LabelMeshType).includes(value as LabelMeshType);
    }

    static isValidLabelMode(value: string): value is LabelMode {
        return Object.values(LabelMode).includes(value as LabelMode);
    }

    // Normalize functions with fallbacks
    static normalizeTextOrientationMode(value?: string): TextOrientationMode {
        if (value && EnumUtils.isValidTextOrientationMode(value)) {
            return value;
        }
        return TextOrientationMode.BILLBOARD; // Default for labels
    }

    static normalizeTextRenderMode(value?: string): TextRenderMode {
        if (value && EnumUtils.isValidTextRenderMode(value)) {
            return value;
        }
        return TextRenderMode.HTML; // Default for labels
    }

    static normalizeLabelMeshType(value?: string): LabelMeshType {
        if (value && EnumUtils.isValidLabelMeshType(value)) {
            return value;
        }
        return LabelMeshType.HTML; // Default
    }
} 