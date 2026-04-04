/**
 * LayoutUtils - Transform pipeline for layout system.
 * Computes complete transforms (position + rotation + scale) for objects.
 * Pure functions, no Three.js dependency.
 */

import { Vec3, PathType, SpacingMode, OrientationMode, UpVectorMode, SpiralConfig, SurfaceVectors, LayoutTransform } from './types';
import { PathLayouts } from './PathLayouts';
import { Orientation } from './Orientation';

// --- Internal Vec3 math helpers ---

function vec3(x: number, y: number, z: number): Vec3 {
    return { x, y, z };
}

function vec3Normalize(v: Vec3): Vec3 {
    const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    if (len === 0) return { x: 0, y: 0, z: 0 };
    return { x: v.x / len, y: v.y / len, z: v.z / len };
}

function vec3Negate(v: Vec3): Vec3 {
    return { x: -v.x, y: -v.y, z: -v.z };
}

function vec3Dot(a: Vec3, b: Vec3): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function vec3Cross(a: Vec3, b: Vec3): Vec3 {
    return {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x
    };
}

// --- Quaternion helpers for flip180 ---

interface Quat {
    x: number;
    y: number;
    z: number;
    w: number;
}

function quatFromAxisAngle(axis: Vec3, angle: number): Quat {
    const halfAngle = angle / 2;
    const s = Math.sin(halfAngle);
    return {
        x: axis.x * s,
        y: axis.y * s,
        z: axis.z * s,
        w: Math.cos(halfAngle)
    };
}

function quatMultiply(a: Quat, b: Quat): Quat {
    return {
        x: a.x * b.w + a.w * b.x + a.y * b.z - a.z * b.y,
        y: a.y * b.w + a.w * b.y + a.z * b.x - a.x * b.z,
        z: a.z * b.w + a.w * b.z + a.x * b.y - a.y * b.x,
        w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z
    };
}

function quatFromEuler(euler: Vec3): Quat {
    const c1 = Math.cos(euler.x / 2);
    const c2 = Math.cos(euler.y / 2);
    const c3 = Math.cos(euler.z / 2);
    const s1 = Math.sin(euler.x / 2);
    const s2 = Math.sin(euler.y / 2);
    const s3 = Math.sin(euler.z / 2);

    // XYZ rotation order
    return {
        x: s1 * c2 * c3 + c1 * s2 * s3,
        y: c1 * s2 * c3 - s1 * c2 * s3,
        z: c1 * c2 * s3 + s1 * s2 * c3,
        w: c1 * c2 * c3 - s1 * s2 * s3
    };
}

function quatToEuler(q: Quat): Vec3 {
    const x = q.x, y = q.y, z = q.z, w = q.w;
    const x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, xy = x * y2, xz = x * z2;
    const yy = y * y2, yz = y * z2, zz = z * z2;
    const wx = w * x2, wy = w * y2, wz = w * z2;

    const m11 = 1 - (yy + zz);
    const m12 = xy - wz;
    const m13 = xz + wy;
    const m23 = yz - wx;
    const m22 = 1 - (xx + zz);
    const m32 = yz + wx;
    const m33 = 1 - (xx + yy);

    const ey = Math.asin(Math.max(-1, Math.min(1, m13)));
    let ex: number, ez: number;
    if (Math.abs(m13) < 0.9999999) {
        ex = Math.atan2(-m23, m33);
        ez = Math.atan2(-m12, m11);
    } else {
        ex = Math.atan2(m32, m22);
        ez = 0;
    }

    return { x: ex, y: ey, z: ez };
}

export class LayoutUtils {

    /**
     * Calculate t parameter for object at given index.
     */
    static calculateTParameter(
        pathType: PathType,
        spacingMode: SpacingMode,
        spacing: number,
        objectIndex: number,
        objectCount: number,
        time: number
    ): number {
        let t: number;

        if (pathType.includes('_free')) {
            t = time;
        } else if (pathType === 'line' || pathType === 'circle' || pathType === 'spiral') {
            if (spacingMode === 'margin') {
                const startT = 0.0;
                let stepSize: number;
                if (pathType === 'line') {
                    stepSize = spacing * 0.1;
                } else {
                    stepSize = spacing * 0.05;
                }
                t = startT + objectIndex * stepSize;
                if (pathType !== 'line' && pathType !== 'spiral') {
                    t = t % 1.0;
                }
            } else {
                if (pathType === 'line') {
                    t = objectIndex / Math.max(1, objectCount - 1);
                } else {
                    t = objectIndex / objectCount;
                }
            }
        } else {
            t = 0;
        }

        return t;
    }

    /**
     * Get surface vectors (tangent, normal, binormal) for given position/parameter.
     */
    static getSurfaceVectors(
        pathType: PathType,
        position: Vec3,
        t: number,
        sphereU: number | null,
        sphereV: number | null,
        planeX: number | null,
        planeZ: number | null,
        spiralConfig: SpiralConfig | null = null,
        lineDirection: Vec3 | null = null,
        spiralAxis: Vec3 | null = null
    ): SurfaceVectors {
        const su = sphereU ?? 0.25;
        const sv = sphereV ?? 0.25;
        const px = planeX ?? 0.5;
        const pz = planeZ ?? 0.5;

        let tangent: Vec3, normal: Vec3, binormal: Vec3;

        if (pathType.startsWith('sphere') || pathType.startsWith('plane')) {
            tangent = PathLayouts.getTangentAtPosition(position, pathType);
            normal = PathLayouts.getNormalAtPosition(position, pathType);
            binormal = PathLayouts.getBinormalAtPosition(position, pathType);
        } else {
            tangent = PathLayouts.getTangent(t, pathType, su, sv, spiralConfig, lineDirection, spiralAxis);
            normal = PathLayouts.getNormal(t, pathType, su, sv, spiralConfig, lineDirection, spiralAxis);
            binormal = PathLayouts.getBinormal(t, pathType, su, sv, px, pz, spiralConfig, lineDirection, spiralAxis);
        }

        return { tangent, normal, binormal };
    }

    /**
     * Calculate orientation (rotation) for object - Pure function.
     * Returns Euler angles in radians.
     */
    static calculateOrientation(
        tangent: Vec3,
        normal: Vec3,
        binormal: Vec3,
        position: Vec3,
        orientation: OrientationMode,
        upMode: UpVectorMode,
        pathType: PathType,
        flip180: boolean = false
    ): Vec3 {
        // Get base rotation from the orientation calculator
        const baseEuler = Orientation.calculateOrientationEuler(
            tangent, normal, binormal, position, orientation, upMode, pathType
        );

        // Apply 180 flip if requested
        if (flip180) {
            let localUpAxis: Vec3;
            if (upMode === 'world') {
                localUpAxis = vec3(0, 1, 0);
            } else {
                if (pathType.startsWith('sphere')) {
                    localUpAxis = vec3Negate(normal);
                } else if (pathType.startsWith('plane')) {
                    localUpAxis = { x: normal.x, y: normal.y, z: normal.z };
                } else {
                    localUpAxis = vec3Negate(binormal);
                }
            }

            const flipQuat = quatFromAxisAngle(localUpAxis, Math.PI);
            const baseQuat = quatFromEuler(baseEuler);
            const flippedQuat = quatMultiply(flipQuat, baseQuat);

            return quatToEuler(flippedQuat);
        }

        return baseEuler;
    }

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
    }): LayoutTransform {
        const {
            pathType, spacingMode, spacing, objectIndex, objectCount, time,
            sphereU, sphereV, planeX, planeZ, orientation, upMode, positions,
            flip180 = false, spiralConfig = null,
            lineDirection = null, spiralAxis = null
        } = config;

        const position = positions[objectIndex] ?? { x: 0, y: 0, z: 0 };

        const t = LayoutUtils.calculateTParameter(pathType, spacingMode, spacing, objectIndex, objectCount, time);

        const { tangent, normal, binormal } = LayoutUtils.getSurfaceVectors(
            pathType, position, t, sphereU, sphereV, planeX, planeZ, spiralConfig, lineDirection, spiralAxis
        );

        const rotation = LayoutUtils.calculateOrientation(
            tangent, normal, binormal, position, orientation, upMode, pathType, flip180
        );

        return {
            position: { x: position.x, y: position.y, z: position.z },
            rotation: { x: rotation.x, y: rotation.y, z: rotation.z },
            scale: { x: 1, y: 1, z: 1 }
        };
    }
}
