/**
 * Orientation - Orientation calculation for layout system.
 * Computes rotation from surface vectors (tangent, normal, binormal).
 * Pure functions, no Three.js dependency.
 *
 * Port of orientation.js - applyOrientationToObject converted to
 * a pure function that returns Euler angles instead of mutating a Three.js Object3D.
 */
import { Vec3, OrientationMode, UpVectorMode, PathType } from './types';
export declare class Orientation {
    /**
     * Calculate orientation as Euler angles (radians) for an object given its surface vectors.
     * This is a pure-function port of the original applyOrientationToObject.
     *
     * @returns Vec3 with Euler angles (x, y, z) in radians.
     */
    static calculateOrientationEuler(tangent: Vec3, normal: Vec3, binormal: Vec3, _position: Vec3, orientation: OrientationMode, upMode: UpVectorMode, pathType: PathType): Vec3;
}
