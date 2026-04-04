/**
 * Layout System Types
 * All interfaces and enums for the ModernLayouters system.
 */
/** How objects are spaced along a path or surface. */
export type SpacingMode = 'margin' | 'distribute';
/** How objects are oriented relative to their path/surface. */
export type OrientationMode = 'aligned' | 'perpendicular';
/** Which direction is considered "up" for orientation. */
export type UpVectorMode = 'world' | 'path';
/** All supported layout/path types. */
export type PathType = 'line' | 'circle' | 'spiral' | 'sphere_grid' | 'sphere_hex' | 'sphere_hex_rings' | 'sphere_hex_honeycomb' | 'plane_grid' | 'plane_hex' | 'cylinder_grid' | 'plane_free' | 'sphere_free';
/** Grid mode for plane_grid layouts. */
export type GridMode = 'auto' | 'manual';
/** Hex mode for plane_hex layouts. */
export type HexMode = 'radial' | 'row';
/** String-based spiral axis (legacy support). */
export type SpiralAxis = 'y' | '-y' | 'x' | '-x' | 'z' | '-z';
/** Lightweight 3D vector interface (Three.js-independent). */
export interface Vec3 {
    x: number;
    y: number;
    z: number;
}
/** A complete transform for a single laid-out object. */
export interface LayoutTransform {
    position: Vec3;
    rotation: Vec3;
    scale: Vec3;
    needsAdaptiveScaling?: boolean;
}
/** Configuration for spiral-type layouts. */
export interface SpiralConfig {
    spiralTurns: number;
    maxRadius: number;
    growthRate: number;
    startDistance: number;
}
/** Dimensions of an object for adaptive layouts. */
export interface ObjectDimensions {
    naturalWidth: number;
    naturalHeight: number;
    width: number;
    height: number;
    aspectRatio: number;
}
/** Wrapper matching the source format: objects with userData containing dimensions. */
export interface LayoutObject {
    userData: ObjectDimensions;
}
/** Configuration object for all layouter functions. */
export interface LayoutConfig {
    objectCount: number;
    spacingMode?: SpacingMode;
    spacing?: number;
    orientation?: OrientationMode;
    upMode?: UpVectorMode;
    flip180?: boolean;
    radius?: number;
    layoutDirection?: Vec3;
    lineDirection?: Vec3;
    spiralConfig?: SpiralConfig;
    objects?: LayoutObject[];
    hexRings?: number;
    gridMode?: GridMode;
    gridRows?: number;
    gridCols?: number;
    hexMode?: HexMode;
    params?: Record<string, unknown>;
}
/** Surface vectors (tangent, normal, binormal) for orientation calculations. */
export interface SurfaceVectors {
    tangent: Vec3;
    normal: Vec3;
    binormal: Vec3;
}
