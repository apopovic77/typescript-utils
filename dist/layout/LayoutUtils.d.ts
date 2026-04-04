/**
 * LayoutUtils - Transform pipeline for layout system.
 * Computes complete transforms (position + rotation + scale) for objects.
 * Pure functions, no Three.js dependency.
 */
import { Vec3, PathType, SpacingMode, OrientationMode, UpVectorMode, SpiralConfig, SurfaceVectors, LayoutTransform } from './types';
export declare class LayoutUtils {
    /**
     * Calculate t parameter for object at given index.
     */
    static calculateTParameter(pathType: PathType, spacingMode: SpacingMode, spacing: number, objectIndex: number, objectCount: number, time: number): number;
    /**
     * Get surface vectors (tangent, normal, binormal) for given position/parameter.
     */
    static getSurfaceVectors(pathType: PathType, position: Vec3, t: number, sphereU: number | null, sphereV: number | null, planeX: number | null, planeZ: number | null, spiralConfig?: SpiralConfig | null, lineDirection?: Vec3 | null, spiralAxis?: Vec3 | null): SurfaceVectors;
    /**
     * Calculate orientation (rotation) for object - Pure function.
     * Returns Euler angles in radians.
     */
    static calculateOrientation(tangent: Vec3, normal: Vec3, binormal: Vec3, position: Vec3, orientation: OrientationMode, upMode: UpVectorMode, pathType: PathType, flip180?: boolean): Vec3;
    /**
     * Calculate complete transform (position + rotation + scale) for single object.
     */
    static calculateCompleteTransform(config: {
        pathType: PathType;
        spacingMode: SpacingMode;
        spacing: number;
        objectIndex: number;
        objectCount: number;
        time: number;
        sphereU: number;
        sphereV: number;
        planeX: number;
        planeZ: number;
        orientation: OrientationMode;
        upMode: UpVectorMode;
        positions: Vec3[];
        flip180?: boolean;
        spiralConfig?: SpiralConfig | null;
        lineDirection?: Vec3 | null;
        spiralAxis?: Vec3 | null;
        direction?: Vec3 | null;
    }): LayoutTransform;
}
