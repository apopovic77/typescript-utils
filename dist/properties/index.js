"use strict";
/**
 * 🚀 HIERARCHICAL PROPERTY SYSTEM
 *
 * Unified export for all property classes with hierarchical inheritance support
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SceneSettingsData = exports.InterpolatedProperty = exports.SimpleSettingsProperty = exports.SettingsProperty = void 0;
// 🎯 Core Properties
var SettingsProperty_1 = require("./SettingsProperty");
Object.defineProperty(exports, "SettingsProperty", { enumerable: true, get: function () { return SettingsProperty_1.SettingsProperty; } });
var SimpleSettingsProperty_1 = require("./SimpleSettingsProperty");
Object.defineProperty(exports, "SimpleSettingsProperty", { enumerable: true, get: function () { return SimpleSettingsProperty_1.SimpleSettingsProperty; } });
var InterpolatedProperty_1 = require("./InterpolatedProperty");
Object.defineProperty(exports, "InterpolatedProperty", { enumerable: true, get: function () { return InterpolatedProperty_1.InterpolatedProperty; } });
// export { ConvergentProperty } from './ConvergentProperty';
// 🏗️ Settings Data Classes
var SceneSettingsData_1 = require("../core/SceneSettingsData");
Object.defineProperty(exports, "SceneSettingsData", { enumerable: true, get: function () { return SceneSettingsData_1.SceneSettingsData; } });
