/**
 * PathLayouts - Path math for layout system.
 * Computes path points, tangents, normals, and binormals for all path types.
 * All functions are pure and Three.js-independent.
 */
import { Vec3, PathType, SpiralConfig, SpiralAxis } from './types';
export declare class PathLayouts {
    /**
     * Get a point on the path at parameter t.
     */
    static getPathPoint(t: number, pathType: PathType, sphereU?: number, sphereV?: number, planeX?: number, planeZ?: number, spiralConfig?: SpiralConfig | null, lineDirection?: Vec3 | null, spiralAxis?: Vec3 | SpiralAxis | null, radius?: number): Vec3;
    /**
     * Get standard tangent vector (ignores custom directions).
     * Used for aligned/perpendicular orientation calculations.
     */
    static getStandardTangent(t: number, pathType: PathType, sphereU?: number, sphereV?: number, spiralConfig?: SpiralConfig | null, spiralAxis?: SpiralAxis | null): Vec3;
    static getStandardNormal(t: number, pathType: PathType, sphereU?: number, sphereV?: number, spiralConfig?: SpiralConfig | null, spiralAxis?: SpiralAxis | null): Vec3;
    static getStandardBinormal(t: number, pathType: PathType, sphereU?: number, sphereV?: number, _planeX?: number, _planeZ?: number, spiralConfig?: SpiralConfig | null, spiralAxis?: SpiralAxis | null): Vec3;
    /**
     * Get standard path point (ALWAYS consistent, ignores custom directions).
     * Used for orientation calculations.
     */
    static getStandardPathPoint(t: number, pathType: PathType, sphereU?: number, sphereV?: number, spiralConfig?: SpiralConfig | null, _spiralAxis?: SpiralAxis | null): Vec3;
    static getTangent(t: number, pathType: PathType, sphereU?: number, sphereV?: number, spiralConfig?: SpiralConfig | null, lineDirection?: Vec3 | null, spiralAxis?: Vec3 | null): Vec3;
    static getNormal(t: number, pathType: PathType, sphereU?: number, sphereV?: number, spiralConfig?: SpiralConfig | null, lineDirection?: Vec3 | null, spiralAxis?: Vec3 | null): Vec3;
    static getBinormal(t: number, pathType: PathType, sphereU?: number, sphereV?: number, planeX?: number, planeZ?: number, spiralConfig?: SpiralConfig | null, lineDirection?: Vec3 | null, spiralAxis?: Vec3 | null): Vec3;
    static getSphereUTangent(sphereU: number, sphereV: number): Vec3;
    static getSphereVTangent(sphereU: number, sphereV: number): Vec3;
    static getPlaneXTangent(): Vec3;
    static getPlaneZTangent(): Vec3;
    static getCylinderUTangent(): Vec3;
    static getCylinderVTangent(): Vec3;
    static getTangentAtPosition(position: Vec3, pathType: PathType): Vec3;
    static getNormalAtPosition(position: Vec3, pathType: PathType): Vec3;
    static getBinormalAtPosition(position: Vec3, pathType: PathType): Vec3;
}
