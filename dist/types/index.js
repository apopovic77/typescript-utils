"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Color = exports.Quaternion = exports.Vector3 = void 0;
// Core mathematical types
var Vector3_1 = require("./Vector3");
Object.defineProperty(exports, "Vector3", { enumerable: true, get: function () { return Vector3_1.Vector3; } });
var Quaternion_1 = require("./Quaternion");
Object.defineProperty(exports, "Quaternion", { enumerable: true, get: function () { return Quaternion_1.Quaternion; } });
var Color_1 = require("./Color");
Object.defineProperty(exports, "Color", { enumerable: true, get: function () { return Color_1.Color; } });
// Export enums
__exportStar(require("./enums"), exports);
// Export easing functions from their own module
__exportStar(require("./easing"), exports);
__exportStar(require("./Lerpable"), exports);
__exportStar(require("./Slerpable"), exports);
__exportStar(require("./Vector2"), exports);
__exportStar(require("./Vector2"), exports);
__exportStar(require("./Vector3"), exports);
__exportStar(require("./Quaternion"), exports);
__exportStar(require("./Color"), exports);
//export * from './UUID';
__exportStar(require("./easing"), exports);
__exportStar(require("./Lerpable"), exports);
//export * from './Equatable';
__exportStar(require("./BoundingBox"), exports);
__exportStar(require("./type-guards"), exports);
