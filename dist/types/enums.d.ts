/**
 * TypeScript Enums for 3D Presenter Engine
 * Replaces magic strings with type-safe enums
 */
export declare enum TextOrientationMode {
    BILLBOARD = "billboard",
    STATIC = "static"
}
export declare enum TextRenderMode {
    HTML = "html",
    CANVAS = "canvas",
    SCREEN_HTML = "screen-html",
    SCREEN_HTML_STATIC = "screen-html-static"
}
export declare enum LabelMeshType {
    CANVAS = "canvas",
    HTML = "html",
    SCREEN_HTML = "screen-html",
    SCREEN_HTML_STATIC = "screen-html-static"
}
export declare enum TextBackgroundMode {
    BLOCK = "block",
    LINE = "line"
}
export declare enum LabelMode {
    CHILD = "child",// Label rotates with object
    INDEPENDENT = "independent",// Label stays independent (billboard)
    POINTER = "pointer"
}
export declare enum LabelVisibilityMode {
    ALWAYS = "always",
    HOVER = "hover",
    SELECTED = "selected",
    NEVER = "never"
}
export declare enum CameraRotationMode {
    FIXED_OFFSET = "fixed_offset",
    SMOOTH_TURN = "smooth_turn",
    DIRECT_AXIS = "direct_axis"
}
export declare enum LayoutMode {
    UPHILL = "uphill",
    GRID = "grid",
    CIRCLE = "circle",
    LINE = "line",
    SPIRAL = "spiral",
    HORIZONTAL = "horizontal",
    VERTICAL = "vertical"
}
export declare class EnumUtils {
    static isValidTextOrientationMode(value: string): value is TextOrientationMode;
    static isValidTextRenderMode(value: string): value is TextRenderMode;
    static isValidLabelMeshType(value: string): value is LabelMeshType;
    static isValidLabelMode(value: string): value is LabelMode;
    static normalizeTextOrientationMode(value?: string): TextOrientationMode;
    static normalizeTextRenderMode(value?: string): TextRenderMode;
    static normalizeLabelMeshType(value?: string): LabelMeshType;
}
