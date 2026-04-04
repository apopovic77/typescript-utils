/**
 * PathLayouts - Path math for layout system.
 * Computes path points, tangents, normals, and binormals for all path types.
 * All functions are pure and Three.js-independent.
 */

import { Vec3, PathType, SpiralConfig, SpiralAxis } from './types';

// --- Internal Vec3 math helpers ---

function vec3(x: number, y: number, z: number): Vec3 {
    return { x, y, z };
}

function vec3Normalize(v: Vec3): Vec3 {
    const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    if (len === 0) return { x: 0, y: 0, z: 0 };
    return { x: v.x / len, y: v.y / len, z: v.z / len };
}

function vec3Length(v: Vec3): number {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

function vec3Cross(a: Vec3, b: Vec3): Vec3 {
    return {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x
    };
}

function vec3Dot(a: Vec3, b: Vec3): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function vec3Sub(a: Vec3, b: Vec3): Vec3 {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function vec3Negate(v: Vec3): Vec3 {
    return { x: -v.x, y: -v.y, z: -v.z };
}

function vec3Clone(v: Vec3): Vec3 {
    return { x: v.x, y: v.y, z: v.z };
}

export class PathLayouts {

    /**
     * Get a point on the path at parameter t.
     */
    static getPathPoint(
        t: number,
        pathType: PathType,
        sphereU: number = 0.25,
        sphereV: number = 0.25,
        planeX: number = 0.5,
        planeZ: number = 0.5,
        spiralConfig: SpiralConfig | null = null,
        lineDirection: Vec3 | null = null,
        spiralAxis: Vec3 | SpiralAxis | null = null,
        radius: number = 2.0
    ): Vec3 {
        // Force radius to be a valid number
        let finalRadius = 2.0;
        if (typeof radius === 'number' && !isNaN(radius) && radius > 0) {
            finalRadius = radius;
        }

        switch (pathType) {
            case 'line':
                if (lineDirection) {
                    const scaledT = t * 2 - 1;
                    return {
                        x: lineDirection.x * scaledT,
                        y: lineDirection.y * scaledT,
                        z: lineDirection.z * scaledT
                    };
                } else {
                    return {
                        x: 0,
                        y: t * 2 - 1,
                        z: t * 2 - 1
                    };
                }

            case 'circle': {
                const angle = t * Math.PI * 2;

                if (lineDirection) {
                    // Custom circle direction - lineDirection is the circle's normal (rotation axis)
                    const normal = vec3Normalize(lineDirection);

                    const worldUp = vec3(0, 1, 0);
                    const worldRight = vec3(1, 0, 0);

                    let u = vec3Cross(normal, worldUp);
                    if (vec3Length(u) < 0.001) {
                        u = vec3Cross(normal, worldRight);
                    }
                    u = vec3Normalize(u);

                    const v = vec3Normalize(vec3Cross(normal, u));

                    const cx = Math.cos(angle) * finalRadius;
                    const cy = Math.sin(angle) * finalRadius;

                    return {
                        x: u.x * cx + v.x * cy,
                        y: u.y * cx + v.y * cy,
                        z: u.z * cx + v.z * cy
                    };
                } else {
                    return {
                        x: Math.cos(angle) * finalRadius,
                        y: Math.sin(angle) * finalRadius * 0.75,
                        z: Math.sin(angle) * finalRadius
                    };
                }
            }

            case 'spiral': {
                const spiralTurns = spiralConfig?.spiralTurns || 2;
                const maxRadius = spiralConfig?.maxRadius || 3;
                const growthRate = spiralConfig?.growthRate || 2;
                const startDistance = spiralConfig?.startDistance || 0;

                const adjustedT = startDistance + t * (1 - startDistance);

                const spiralAngle = adjustedT * Math.PI * 2 * spiralTurns;
                const radiusAtT = (adjustedT / 1.0) * maxRadius;

                const axisHeight = adjustedT * growthRate - 1;
                const x_component = Math.cos(spiralAngle) * radiusAtT;
                const z_component = Math.sin(spiralAngle) * radiusAtT;

                // Support both custom direction vectors and axis strings
                if (lineDirection && typeof lineDirection === 'object' && 'x' in lineDirection) {
                    const axis = vec3Normalize(lineDirection);

                    const worldUp = vec3(0, 1, 0);
                    const worldRight = vec3(1, 0, 0);

                    let u = vec3Cross(axis, worldUp);
                    if (vec3Length(u) < 0.001) {
                        u = vec3Cross(axis, worldRight);
                    }
                    u = vec3Normalize(u);

                    const v = vec3Normalize(vec3Cross(axis, u));

                    return {
                        x: u.x * x_component + v.x * z_component + axis.x * axisHeight,
                        y: u.y * x_component + v.y * z_component + axis.y * axisHeight,
                        z: u.z * x_component + v.z * z_component + axis.z * axisHeight
                    };
                } else if (spiralAxis && typeof spiralAxis === 'string') {
                    // Legacy string-based axis support
                    switch (spiralAxis) {
                        case 'y':
                            return { x: x_component, y: axisHeight, z: z_component };
                        case '-y':
                            return { x: x_component, y: -axisHeight, z: z_component };
                        case 'x':
                            return { x: axisHeight, y: x_component, z: z_component };
                        case '-x':
                            return { x: -axisHeight, y: x_component, z: z_component };
                        case 'z':
                            return { x: x_component, y: z_component, z: axisHeight };
                        case '-z':
                            return { x: x_component, y: z_component, z: -axisHeight };
                        default:
                            return { x: x_component, y: axisHeight, z: z_component };
                    }
                } else {
                    // Default Y axis
                    return {
                        x: x_component,
                        y: axisHeight,
                        z: z_component
                    };
                }
            }

            case 'sphere_free': {
                const phi = sphereU * Math.PI * 2;
                const theta = sphereV * Math.PI;
                const sphereRadius = 2;
                return {
                    x: sphereRadius * Math.sin(theta) * Math.cos(phi),
                    y: sphereRadius * Math.cos(theta),
                    z: sphereRadius * Math.sin(theta) * Math.sin(phi)
                };
            }

            case 'plane_free': {
                const planeSize = 2;
                const localX = (planeX - 0.5) * planeSize * 2;
                const localZ_val = (planeZ - 0.5) * planeSize * 2;
                const tiltAngle = Math.PI / 4;
                return {
                    x: localX,
                    y: -localZ_val * Math.sin(tiltAngle),
                    z: localZ_val * Math.cos(tiltAngle)
                };
            }

            default:
                return { x: 0, y: 0, z: 0 };
        }
    }

    // --- Standard path functions (ALWAYS consistent, ignores custom directions) ---

    /**
     * Get standard tangent vector (ignores custom directions).
     * Used for aligned/perpendicular orientation calculations.
     */
    static getStandardTangent(
        t: number,
        pathType: PathType,
        sphereU: number = 0.25,
        sphereV: number = 0.25,
        spiralConfig: SpiralConfig | null = null,
        spiralAxis: SpiralAxis | null = null
    ): Vec3 {
        if (pathType.startsWith('sphere')) {
            return PathLayouts.getSphereUTangent(sphereU, sphereV);
        }
        if (pathType.startsWith('plane')) {
            return PathLayouts.getPlaneXTangent();
        }
        if (pathType.startsWith('cylinder')) {
            return PathLayouts.getCylinderUTangent();
        }

        const dt = 0.001;
        const p1 = PathLayouts.getStandardPathPoint(t - dt, pathType, sphereU, sphereV, spiralConfig, spiralAxis);
        const p2 = PathLayouts.getStandardPathPoint(t + dt, pathType, sphereU, sphereV, spiralConfig, spiralAxis);

        return vec3Normalize(vec3Sub(p2, p1));
    }

    static getStandardNormal(
        t: number,
        pathType: PathType,
        sphereU: number = 0.25,
        sphereV: number = 0.25,
        spiralConfig: SpiralConfig | null = null,
        spiralAxis: SpiralAxis | null = null
    ): Vec3 {
        if (pathType.startsWith('sphere')) {
            return PathLayouts.getSphereVTangent(sphereU, sphereV);
        }
        if (pathType.startsWith('plane')) {
            return PathLayouts.getPlaneZTangent();
        }
        if (pathType.startsWith('cylinder')) {
            return PathLayouts.getCylinderVTangent();
        }

        const dt = 0.001;
        const t1 = PathLayouts.getStandardTangent(t - dt, pathType, sphereU, sphereV, spiralConfig, spiralAxis);
        const t2 = PathLayouts.getStandardTangent(t + dt, pathType, sphereU, sphereV, spiralConfig, spiralAxis);

        const normal = vec3Sub(t2, t1);

        if (vec3Length(normal) < 0.001) {
            const tangent = PathLayouts.getStandardTangent(t, pathType, sphereU, sphereV, spiralConfig, spiralAxis);

            if (pathType === 'line') {
                const worldUp = vec3(0, 1, 0);
                let lineNormal = vec3Cross(tangent, worldUp);

                if (vec3Length(lineNormal) < 0.001) {
                    lineNormal = vec3(1, 0, 0);
                } else {
                    lineNormal = vec3Normalize(lineNormal);
                }
                return lineNormal;
            }

            if (Math.abs(tangent.x) < 0.9) {
                return vec3Normalize(vec3Cross(vec3(1, 0, 0), tangent));
            } else {
                return vec3Normalize(vec3Cross(vec3(0, 1, 0), tangent));
            }
        }
        return vec3Normalize(normal);
    }

    static getStandardBinormal(
        t: number,
        pathType: PathType,
        sphereU: number = 0.25,
        sphereV: number = 0.25,
        _planeX: number = 0.5,
        _planeZ: number = 0.5,
        spiralConfig: SpiralConfig | null = null,
        spiralAxis: SpiralAxis | null = null
    ): Vec3 {
        const tangent = PathLayouts.getStandardTangent(t, pathType, sphereU, sphereV, spiralConfig, spiralAxis);
        const normal = PathLayouts.getStandardNormal(t, pathType, sphereU, sphereV, spiralConfig, spiralAxis);

        return vec3Normalize(vec3Cross(tangent, normal));
    }

    /**
     * Get standard path point (ALWAYS consistent, ignores custom directions).
     * Used for orientation calculations.
     */
    static getStandardPathPoint(
        t: number,
        pathType: PathType,
        sphereU: number = 0.25,
        sphereV: number = 0.25,
        spiralConfig: SpiralConfig | null = null,
        _spiralAxis: SpiralAxis | null = null
    ): Vec3 {
        switch (pathType) {
            case 'line':
                return {
                    x: 0,
                    y: t * 2 - 1,
                    z: t * 2 - 1
                };
            case 'circle': {
                const angle = t * Math.PI * 2;
                return {
                    x: Math.cos(angle) * 2,
                    y: Math.sin(angle) * 1.5,
                    z: Math.sin(angle) * 2
                };
            }
            case 'spiral': {
                const spiralTurns = spiralConfig?.spiralTurns || 2;
                const maxRadius = spiralConfig?.maxRadius || 3;
                const growthRate = spiralConfig?.growthRate || 2;
                const startDistance = spiralConfig?.startDistance || 0;

                const adjustedT = startDistance + t * (1 - startDistance);
                const spiralAngle = adjustedT * Math.PI * 2 * spiralTurns;
                const radiusAtT = (adjustedT / 1.0) * maxRadius;
                const axisHeight = adjustedT * growthRate - 1;
                const x_component = Math.cos(spiralAngle) * radiusAtT;
                const z_component = Math.sin(spiralAngle) * radiusAtT;

                return { x: x_component, y: axisHeight, z: z_component };
            }
            default:
                return { x: 0, y: 0, z: 0 };
        }
    }

    // --- Tangent / Normal / Binormal (with custom direction support) ---

    static getTangent(
        t: number,
        pathType: PathType,
        sphereU: number = 0.25,
        sphereV: number = 0.25,
        spiralConfig: SpiralConfig | null = null,
        lineDirection: Vec3 | null = null,
        spiralAxis: Vec3 | null = null
    ): Vec3 {
        if (pathType.startsWith('sphere')) {
            return PathLayouts.getSphereUTangent(sphereU, sphereV);
        }
        if (pathType.startsWith('plane')) {
            return PathLayouts.getPlaneXTangent();
        }
        if (pathType.startsWith('cylinder')) {
            return PathLayouts.getCylinderUTangent();
        }

        // For circle with custom direction, calculate tangent analytically
        if (pathType === 'circle' && lineDirection) {
            const angle = t * Math.PI * 2;
            const normal = vec3Normalize(lineDirection);

            const worldUp = vec3(0, 1, 0);
            const worldRight = vec3(1, 0, 0);

            let u = vec3Cross(normal, worldUp);
            if (vec3Length(u) < 0.001) {
                u = vec3Cross(normal, worldRight);
            }
            u = vec3Normalize(u);

            const v = vec3Normalize(vec3Cross(normal, u));

            return vec3Normalize({
                x: u.x * (-Math.sin(angle)) + v.x * Math.cos(angle),
                y: u.y * (-Math.sin(angle)) + v.y * Math.cos(angle),
                z: u.z * (-Math.sin(angle)) + v.z * Math.cos(angle)
            });
        }

        // For spiral with custom direction, calculate tangent analytically
        if (pathType === 'spiral' && spiralAxis && spiralConfig) {
            const { spiralTurns = 2, maxRadius = 3, growthRate = 2 } = spiralConfig;
            const angle = t * spiralTurns * 2 * Math.PI;
            const spiralRadius = (t / 1.0) * maxRadius;
            const spiralAxisVector = vec3Normalize(spiralAxis);

            const worldUp = vec3(0, 1, 0);
            const worldRight = vec3(1, 0, 0);

            let spiralU = vec3Cross(spiralAxisVector, worldUp);
            if (vec3Length(spiralU) < 0.001) {
                spiralU = vec3Cross(spiralAxisVector, worldRight);
            }
            spiralU = vec3Normalize(spiralU);

            const spiralV = vec3Normalize(vec3Cross(spiralAxisVector, spiralU));

            const drdt = maxRadius / 1.0;
            const dangledt = spiralTurns * 2 * Math.PI;
            const dhdt = growthRate;

            return vec3Normalize({
                x: drdt * (spiralU.x * Math.cos(angle) + spiralV.x * Math.sin(angle)) +
                    spiralRadius * dangledt * (spiralU.x * (-Math.sin(angle)) + spiralV.x * Math.cos(angle)) +
                    dhdt * spiralAxisVector.x,

                y: drdt * (spiralU.y * Math.cos(angle) + spiralV.y * Math.sin(angle)) +
                    spiralRadius * dangledt * (spiralU.y * (-Math.sin(angle)) + spiralV.y * Math.cos(angle)) +
                    dhdt * spiralAxisVector.y,

                z: drdt * (spiralU.z * Math.cos(angle) + spiralV.z * Math.sin(angle)) +
                    spiralRadius * dangledt * (spiralU.z * (-Math.sin(angle)) + spiralV.z * Math.cos(angle)) +
                    dhdt * spiralAxisVector.z
            });
        }

        // For other paths, use numerical differentiation
        const dt = 0.001;
        const p1 = PathLayouts.getPathPoint(t - dt, pathType, sphereU, sphereV, 0.5, 0.5, spiralConfig, lineDirection, spiralAxis, 2.0);
        const p2 = PathLayouts.getPathPoint(t + dt, pathType, sphereU, sphereV, 0.5, 0.5, spiralConfig, lineDirection, spiralAxis, 2.0);

        return vec3Normalize(vec3Sub(p2, p1));
    }

    static getNormal(
        t: number,
        pathType: PathType,
        sphereU: number = 0.25,
        sphereV: number = 0.25,
        spiralConfig: SpiralConfig | null = null,
        lineDirection: Vec3 | null = null,
        spiralAxis: Vec3 | null = null
    ): Vec3 {
        if (pathType.startsWith('sphere')) {
            return PathLayouts.getSphereVTangent(sphereU, sphereV);
        }
        if (pathType.startsWith('plane')) {
            return PathLayouts.getPlaneZTangent();
        }
        if (pathType.startsWith('cylinder')) {
            return PathLayouts.getCylinderVTangent();
        }

        // For circle with custom direction, calculate normal analytically
        if (pathType === 'circle' && lineDirection) {
            const angle = t * Math.PI * 2;
            const circleNormal = vec3Normalize(lineDirection);

            const worldUp = vec3(0, 1, 0);
            const worldRight = vec3(1, 0, 0);

            let u = vec3Cross(circleNormal, worldUp);
            if (vec3Length(u) < 0.001) {
                u = vec3Cross(circleNormal, worldRight);
            }
            u = vec3Normalize(u);

            const v = vec3Normalize(vec3Cross(circleNormal, u));

            return vec3Normalize({
                x: u.x * Math.cos(angle) + v.x * Math.sin(angle),
                y: u.y * Math.cos(angle) + v.y * Math.sin(angle),
                z: u.z * Math.cos(angle) + v.z * Math.sin(angle)
            });
        }

        // For spiral with custom direction, calculate normal analytically
        if (pathType === 'spiral' && spiralAxis && spiralConfig) {
            const tangent = PathLayouts.getTangent(t, pathType, sphereU, sphereV, spiralConfig, lineDirection, spiralAxis);
            const spiralAxisVector = vec3Normalize(spiralAxis);

            const normal = vec3Cross(tangent, spiralAxisVector);

            if (vec3Length(normal) < 0.001) {
                const { spiralTurns = 2 } = spiralConfig;
                const angle = t * spiralTurns * 2 * Math.PI;

                const worldUp = vec3(0, 1, 0);
                const worldRight = vec3(1, 0, 0);

                let spiralU = vec3Cross(spiralAxisVector, worldUp);
                if (vec3Length(spiralU) < 0.001) {
                    spiralU = vec3Cross(spiralAxisVector, worldRight);
                }
                spiralU = vec3Normalize(spiralU);

                const spiralV = vec3Normalize(vec3Cross(spiralAxisVector, spiralU));

                return vec3Normalize({
                    x: spiralU.x * Math.cos(angle) + spiralV.x * Math.sin(angle),
                    y: spiralU.y * Math.cos(angle) + spiralV.y * Math.sin(angle),
                    z: spiralU.z * Math.cos(angle) + spiralV.z * Math.sin(angle)
                });
            }

            return vec3Normalize(normal);
        }

        const dt = 0.001;
        const t1 = PathLayouts.getTangent(t - dt, pathType, sphereU, sphereV, spiralConfig, lineDirection, spiralAxis);
        const t2 = PathLayouts.getTangent(t + dt, pathType, sphereU, sphereV, spiralConfig, lineDirection, spiralAxis);

        const normal = vec3Sub(t2, t1);

        if (vec3Length(normal) < 0.001) {
            const tangent = PathLayouts.getTangent(t, pathType, sphereU, sphereV, spiralConfig, lineDirection, spiralAxis);

            if (pathType === 'line') {
                const worldUp = vec3(0, 1, 0);
                const worldRight = vec3(1, 0, 0);
                const worldForward = vec3(0, 0, 1);

                let lineNormal = vec3Cross(tangent, worldUp);
                if (vec3Length(lineNormal) < 0.001) {
                    lineNormal = vec3Cross(tangent, worldRight);
                }
                if (vec3Length(lineNormal) < 0.001) {
                    lineNormal = vec3Cross(tangent, worldForward);
                }
                if (vec3Length(lineNormal) < 0.001) {
                    lineNormal = vec3(1, 0, 0);
                } else {
                    lineNormal = vec3Normalize(lineNormal);
                }

                return lineNormal;
            }

            if (Math.abs(tangent.x) < 0.9) {
                return vec3Normalize(vec3Cross(vec3(1, 0, 0), tangent));
            } else {
                return vec3Normalize(vec3Cross(vec3(0, 1, 0), tangent));
            }
        }
        return vec3Normalize(normal);
    }

    static getBinormal(
        t: number,
        pathType: PathType,
        sphereU: number = 0.25,
        sphereV: number = 0.25,
        planeX: number = 0.5,
        planeZ: number = 0.5,
        spiralConfig: SpiralConfig | null = null,
        lineDirection: Vec3 | null = null,
        spiralAxis: Vec3 | null = null
    ): Vec3 {
        if (pathType.startsWith('sphere')) {
            const position = PathLayouts.getPathPoint(t, pathType, sphereU, sphereV, planeX, planeZ, spiralConfig, lineDirection, spiralAxis, 2.0);
            return vec3Normalize(position);
        }
        if (pathType.startsWith('plane')) {
            const xTangent = PathLayouts.getPlaneXTangent();
            const zTangent = PathLayouts.getPlaneZTangent();
            return vec3Normalize(vec3Cross(xTangent, zTangent));
        }

        // For circle with custom direction, binormal is the circle's axis
        if (pathType === 'circle' && lineDirection) {
            return vec3Normalize(lineDirection);
        }

        const tangent = PathLayouts.getTangent(t, pathType, sphereU, sphereV, spiralConfig, lineDirection, spiralAxis);
        const normal = PathLayouts.getNormal(t, pathType, sphereU, sphereV, spiralConfig, lineDirection, spiralAxis);
        return vec3Normalize(vec3Cross(tangent, normal));
    }

    // --- Sphere tangent functions ---

    static getSphereUTangent(sphereU: number, sphereV: number): Vec3 {
        const phi = sphereU * Math.PI * 2;
        const theta = sphereV * Math.PI;
        const radius = 2;

        return vec3Normalize({
            x: -radius * Math.sin(theta) * Math.sin(phi),
            y: 0,
            z: radius * Math.sin(theta) * Math.cos(phi)
        });
    }

    static getSphereVTangent(sphereU: number, sphereV: number): Vec3 {
        const phi = sphereU * Math.PI * 2;
        const theta = sphereV * Math.PI;
        const radius = 2;

        return vec3Normalize({
            x: radius * Math.cos(theta) * Math.cos(phi),
            y: -radius * Math.sin(theta),
            z: radius * Math.cos(theta) * Math.sin(phi)
        });
    }

    // --- Plane tangent functions ---

    static getPlaneXTangent(): Vec3 {
        return { x: 1, y: 0, z: 0 };
    }

    static getPlaneZTangent(): Vec3 {
        const tiltAngle = Math.PI / 4;
        return vec3Normalize({
            x: 0,
            y: -Math.sin(tiltAngle),
            z: Math.cos(tiltAngle)
        });
    }

    // --- Cylinder tangent functions ---

    static getCylinderUTangent(): Vec3 {
        const phi = 0;
        return vec3Normalize({
            x: -Math.sin(phi),
            y: 0,
            z: Math.cos(phi)
        });
    }

    static getCylinderVTangent(): Vec3 {
        return { x: 0, y: 1, z: 0 };
    }

    // --- Helper functions for getting tangents/normals at specific positions ---

    static getTangentAtPosition(position: Vec3, pathType: PathType): Vec3 {
        if (pathType.startsWith('sphere')) {
            const radius = 2;
            const phi = Math.atan2(position.z, position.x);
            const theta = Math.acos(position.y / radius);

            return vec3Normalize({
                x: -radius * Math.sin(theta) * Math.sin(phi),
                y: 0,
                z: radius * Math.sin(theta) * Math.cos(phi)
            });
        } else if (pathType.startsWith('plane')) {
            return PathLayouts.getPlaneXTangent();
        }
        return { x: 1, y: 0, z: 0 };
    }

    static getNormalAtPosition(position: Vec3, pathType: PathType): Vec3 {
        if (pathType.startsWith('sphere')) {
            const radius = 2;
            const phi = Math.atan2(position.z, position.x);
            const theta = Math.acos(position.y / radius);

            return vec3Normalize({
                x: radius * Math.cos(theta) * Math.cos(phi),
                y: -radius * Math.sin(theta),
                z: radius * Math.cos(theta) * Math.sin(phi)
            });
        } else if (pathType.startsWith('plane')) {
            return PathLayouts.getPlaneZTangent();
        }
        return { x: 0, y: 1, z: 0 };
    }

    static getBinormalAtPosition(position: Vec3, pathType: PathType): Vec3 {
        if (pathType.startsWith('sphere')) {
            return vec3Normalize(position);
        } else if (pathType.startsWith('plane')) {
            const xTangent = PathLayouts.getPlaneXTangent();
            const zTangent = PathLayouts.getPlaneZTangent();
            return vec3Normalize(vec3Cross(xTangent, zTangent));
        }
        return { x: 0, y: 0, z: 1 };
    }
}
