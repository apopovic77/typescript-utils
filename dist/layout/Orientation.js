/**
 * Orientation - Orientation calculation for layout system.
 * Computes rotation from surface vectors (tangent, normal, binormal).
 * Pure functions, no Three.js dependency.
 *
 * Port of orientation.js - applyOrientationToObject converted to
 * a pure function that returns Euler angles instead of mutating a Three.js Object3D.
 */
// --- Internal Vec3 math helpers ---
function vec3(x, y, z) {
    return { x, y, z };
}
function vec3Normalize(v) {
    const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    if (len === 0)
        return { x: 0, y: 0, z: 0 };
    return { x: v.x / len, y: v.y / len, z: v.z / len };
}
function vec3Length(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}
function vec3Cross(a, b) {
    return {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x
    };
}
function vec3Dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}
function vec3Negate(v) {
    return { x: -v.x, y: -v.y, z: -v.z };
}
function vec3Clone(v) {
    return { x: v.x, y: v.y, z: v.z };
}
function quatFromAxisAngle(axis, angle) {
    const halfAngle = angle / 2;
    const s = Math.sin(halfAngle);
    return {
        x: axis.x * s,
        y: axis.y * s,
        z: axis.z * s,
        w: Math.cos(halfAngle)
    };
}
function quatMultiply(a, b) {
    return {
        x: a.x * b.w + a.w * b.x + a.y * b.z - a.z * b.y,
        y: a.y * b.w + a.w * b.y + a.z * b.x - a.x * b.z,
        z: a.z * b.w + a.w * b.z + a.x * b.y - a.y * b.x,
        w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z
    };
}
function quatFromMatrix(right, up, forward) {
    // Build rotation matrix from basis vectors: column 0 = right, column 1 = up, column 2 = forward
    const m00 = right.x, m10 = right.y, m20 = right.z;
    const m01 = up.x, m11 = up.y, m21 = up.z;
    const m02 = forward.x, m12 = forward.y, m22 = forward.z;
    const trace = m00 + m11 + m22;
    let qw, qx, qy, qz;
    if (trace > 0) {
        const s = Math.sqrt(trace + 1.0) * 2;
        qw = 0.25 * s;
        qx = (m21 - m12) / s;
        qy = (m02 - m20) / s;
        qz = (m10 - m01) / s;
    }
    else if ((m00 > m11) && (m00 > m22)) {
        const s = Math.sqrt(1.0 + m00 - m11 - m22) * 2;
        qw = (m21 - m12) / s;
        qx = 0.25 * s;
        qy = (m01 + m10) / s;
        qz = (m02 + m20) / s;
    }
    else if (m11 > m22) {
        const s = Math.sqrt(1.0 + m11 - m00 - m22) * 2;
        qw = (m02 - m20) / s;
        qx = (m01 + m10) / s;
        qy = 0.25 * s;
        qz = (m12 + m21) / s;
    }
    else {
        const s = Math.sqrt(1.0 + m22 - m00 - m11) * 2;
        qw = (m10 - m01) / s;
        qx = (m02 + m20) / s;
        qy = (m12 + m21) / s;
        qz = 0.25 * s;
    }
    // Normalize
    const len = Math.sqrt(qx * qx + qy * qy + qz * qz + qw * qw);
    if (len > 0) {
        return { x: qx / len, y: qy / len, z: qz / len, w: qw / len };
    }
    return { x: 0, y: 0, z: 0, w: 1 };
}
/**
 * Convert quaternion to Euler angles (XYZ order, matching Three.js default).
 * Returns radians.
 */
function quatToEuler(q) {
    // Build rotation matrix from quaternion
    const x = q.x, y = q.y, z = q.z, w = q.w;
    const x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, xy = x * y2, xz = x * z2;
    const yy = y * y2, yz = y * z2, zz = z * z2;
    const wx = w * x2, wy = w * y2, wz = w * z2;
    const m11 = 1 - (yy + zz);
    const m12 = xy - wz;
    const m13 = xz + wy;
    const m21 = xy + wz;
    const m22 = 1 - (xx + zz);
    const m23 = yz - wx;
    // const m31 = xz - wy; // unused
    const m32 = yz + wx;
    const m33 = 1 - (xx + yy);
    // XYZ rotation order (matches Three.js default Euler order)
    const ey = Math.asin(Math.max(-1, Math.min(1, m13)));
    let ex, ez;
    if (Math.abs(m13) < 0.9999999) {
        ex = Math.atan2(-m23, m33);
        ez = Math.atan2(-m12, m11);
    }
    else {
        ex = Math.atan2(m32, m22);
        ez = 0;
    }
    return { x: ex, y: ey, z: ez };
}
export class Orientation {
    /**
     * Calculate orientation as Euler angles (radians) for an object given its surface vectors.
     * This is a pure-function port of the original applyOrientationToObject.
     *
     * @returns Vec3 with Euler angles (x, y, z) in radians.
     */
    static calculateOrientationEuler(tangent, normal, binormal, _position, orientation, upMode, pathType) {
        // Step 1: Determine what the object should point towards
        let desiredForward;
        if (orientation === 'aligned') {
            if (pathType.startsWith('sphere')) {
                desiredForward = vec3Clone(binormal);
            }
            else if (pathType.startsWith('plane')) {
                desiredForward = vec3Clone(binormal);
            }
            else {
                desiredForward = vec3Clone(normal);
            }
        }
        else {
            if (pathType.startsWith('sphere')) {
                desiredForward = vec3Clone(tangent);
            }
            else if (pathType.startsWith('plane')) {
                desiredForward = vec3Clone(tangent);
            }
            else {
                desiredForward = vec3Clone(tangent);
            }
        }
        // Step 2: Determine what should be "up" for the object
        let desiredUp;
        if (upMode === 'world') {
            desiredUp = vec3(0, 1, 0);
        }
        else {
            if (pathType.startsWith('sphere')) {
                desiredUp = vec3Negate(normal);
            }
            else if (pathType.startsWith('plane')) {
                desiredUp = vec3Clone(normal);
            }
            else {
                desiredUp = vec3Negate(binormal);
            }
        }
        // Step 3: Build orthogonal coordinate system
        desiredForward = vec3Normalize(desiredForward);
        desiredUp = vec3Normalize(desiredUp);
        // Check if forward and up are parallel
        const dot = Math.abs(vec3Dot(desiredForward, desiredUp));
        if (dot > 0.99) {
            if (upMode === 'world') {
                if (Math.abs(desiredForward.y) > 0.9) {
                    desiredUp = vec3(1, 0, 0);
                }
            }
        }
        let finalRight, finalUp, finalForward;
        if (upMode === 'world') {
            finalUp = vec3(0, 1, 0);
            const parallelThreshold = 0.99;
            const forwardUpDot = Math.abs(vec3Dot(desiredForward, finalUp));
            if (forwardUpDot > parallelThreshold) {
                if (pathType === 'circle' || pathType === 'spiral') {
                    finalForward = vec3Normalize(tangent);
                    finalRight = vec3Normalize(vec3Cross(finalUp, finalForward));
                }
                else {
                    finalForward = { x: desiredForward.x, y: 0, z: desiredForward.z };
                    if (vec3Length(finalForward) < 0.001) {
                        finalForward = vec3(0, 0, 1);
                    }
                    finalForward = vec3Normalize(finalForward);
                    finalRight = vec3Normalize(vec3Cross(finalUp, finalForward));
                }
            }
            else {
                finalRight = vec3Normalize(vec3Cross(finalUp, desiredForward));
                finalForward = vec3Normalize(vec3Cross(finalRight, finalUp));
            }
        }
        else {
            finalForward = vec3Normalize(desiredForward);
            finalUp = vec3Normalize(desiredUp);
            finalRight = vec3Normalize(vec3Cross(finalUp, finalForward));
            finalUp = vec3Normalize(vec3Cross(finalForward, finalRight));
        }
        // Step 4: Convert basis to quaternion, then to Euler
        // THREE.Matrix4.makeBasis(right, up, forward) builds a column-major matrix:
        //   column 0 = right, column 1 = up, column 2 = forward
        // Then setRotationFromMatrix extracts Euler from that.
        let quat = quatFromMatrix(finalRight, finalUp, finalForward);
        // Special case: For plane + aligned + path up, add -90 rotation around yellow arrow axis
        if (pathType.startsWith('plane') && orientation === 'aligned' && upMode === 'path') {
            const yellowArrowAxis = vec3Normalize(vec3(0, Math.sin(Math.PI / 4), Math.cos(Math.PI / 4)));
            const rotationMinus90 = quatFromAxisAngle(yellowArrowAxis, -Math.PI / 2);
            let finalQuat = quatMultiply(rotationMinus90, quat);
            // Additional 90 rotation around cyan vector (object's forward axis)
            const cyanAxis = vec3Normalize(finalForward);
            const rotationPlus90 = quatFromAxisAngle(cyanAxis, Math.PI / 2);
            finalQuat = quatMultiply(rotationPlus90, finalQuat);
            quat = finalQuat;
        }
        return quatToEuler(quat);
    }
}
