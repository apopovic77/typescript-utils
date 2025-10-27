/**
 * TypeScript Enums for 3D Presenter Engine
 * Replaces magic strings with type-safe enums
 */
// Label Orientation Mode (from F2 Dialog)
export var TextOrientationMode;
(function (TextOrientationMode) {
    TextOrientationMode["BILLBOARD"] = "billboard";
    TextOrientationMode["STATIC"] = "static";
})(TextOrientationMode || (TextOrientationMode = {}));
// Label Render Mode (from F2 Dialog)
export var TextRenderMode;
(function (TextRenderMode) {
    TextRenderMode["HTML"] = "html";
    TextRenderMode["CANVAS"] = "canvas";
    TextRenderMode["SCREEN_HTML"] = "screen-html";
    TextRenderMode["SCREEN_HTML_STATIC"] = "screen-html-static";
})(TextRenderMode || (TextRenderMode = {}));
// Label Mesh Types
export var LabelMeshType;
(function (LabelMeshType) {
    LabelMeshType["CANVAS"] = "canvas";
    LabelMeshType["HTML"] = "html";
    LabelMeshType["SCREEN_HTML"] = "screen-html";
    LabelMeshType["SCREEN_HTML_STATIC"] = "screen-html-static";
})(LabelMeshType || (LabelMeshType = {}));
// Label Background Mode (from F2 Dialog)
export var TextBackgroundMode;
(function (TextBackgroundMode) {
    TextBackgroundMode["BLOCK"] = "block";
    TextBackgroundMode["LINE"] = "line";
})(TextBackgroundMode || (TextBackgroundMode = {}));
// Label Modes (from markdown meta)
export var LabelMode;
(function (LabelMode) {
    LabelMode["CHILD"] = "child";
    LabelMode["INDEPENDENT"] = "independent";
    LabelMode["POINTER"] = "pointer"; // Line points to object with target
})(LabelMode || (LabelMode = {}));
// Label Visibility Modes
export var LabelVisibilityMode;
(function (LabelVisibilityMode) {
    LabelVisibilityMode["ALWAYS"] = "always";
    LabelVisibilityMode["HOVER"] = "hover";
    LabelVisibilityMode["SELECTED"] = "selected";
    LabelVisibilityMode["NEVER"] = "never";
})(LabelVisibilityMode || (LabelVisibilityMode = {}));
// Camera Rotation Modes
export var CameraRotationMode;
(function (CameraRotationMode) {
    CameraRotationMode["FIXED_OFFSET"] = "fixed_offset";
    CameraRotationMode["SMOOTH_TURN"] = "smooth_turn";
    CameraRotationMode["DIRECT_AXIS"] = "direct_axis";
})(CameraRotationMode || (CameraRotationMode = {}));
// Layout Modes
export var LayoutMode;
(function (LayoutMode) {
    LayoutMode["UPHILL"] = "uphill";
    LayoutMode["GRID"] = "grid";
    LayoutMode["CIRCLE"] = "circle";
    LayoutMode["LINE"] = "line";
    LayoutMode["SPIRAL"] = "spiral";
    LayoutMode["HORIZONTAL"] = "horizontal";
    LayoutMode["VERTICAL"] = "vertical";
})(LayoutMode || (LayoutMode = {}));
// Helper functions for enum validation
export class EnumUtils {
    static isValidTextOrientationMode(value) {
        return Object.values(TextOrientationMode).includes(value);
    }
    static isValidTextRenderMode(value) {
        return Object.values(TextRenderMode).includes(value);
    }
    static isValidLabelMeshType(value) {
        return Object.values(LabelMeshType).includes(value);
    }
    static isValidLabelMode(value) {
        return Object.values(LabelMode).includes(value);
    }
    // Normalize functions with fallbacks
    static normalizeTextOrientationMode(value) {
        if (value && EnumUtils.isValidTextOrientationMode(value)) {
            return value;
        }
        return TextOrientationMode.BILLBOARD; // Default for labels
    }
    static normalizeTextRenderMode(value) {
        if (value && EnumUtils.isValidTextRenderMode(value)) {
            return value;
        }
        return TextRenderMode.HTML; // Default for labels
    }
    static normalizeLabelMeshType(value) {
        if (value && EnumUtils.isValidLabelMeshType(value)) {
            return value;
        }
        return LabelMeshType.HTML; // Default
    }
}
