/**
 * Layouters - High-level layout API.
 * Port of modern-layouters.js ModernLayouters class.
 * Each static method takes a LayoutConfig and returns LayoutTransform[].
 */

import {
    Vec3, LayoutConfig, LayoutTransform, SpacingMode, OrientationMode, UpVectorMode,
    SpiralConfig
} from './types';
import { PositionLayouts } from './PositionLayouts';
import { LayoutUtils } from './LayoutUtils';

// --- Internal Vec3 math helpers ---

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

export class Layouters {

    // ======================================================================
    // Standard Layouters
    // ======================================================================

    /**
     * Circle layout - distribute objects along a circle path.
     */
    static circle(config: LayoutConfig): LayoutTransform[] {
        const {
            objectCount,
            spacingMode = 'distribute',
            spacing = 1.5,
            orientation = 'aligned',
            upMode = 'world',
            flip180 = false,
            radius = 5.0,
            layoutDirection = undefined,
            lineDirection = undefined
        } = config;

        const direction = layoutDirection || lineDirection || null;

        const positions = PositionLayouts.getLayoutPositions(
            'circle', objectCount, spacing, spacingMode,
            0, 0.25, 0.25, 0.5, 0.5, 'auto', 3, 3, 'radial', 2, null, direction, null, radius
        );

        const transforms: LayoutTransform[] = [];
        for (let i = 0; i < objectCount; i++) {
            const transform = LayoutUtils.calculateCompleteTransform({
                pathType: 'circle',
                spacingMode,
                spacing,
                objectIndex: i,
                objectCount,
                time: 0,
                sphereU: 0.25,
                sphereV: 0.25,
                planeX: 0.5,
                planeZ: 0.5,
                orientation,
                upMode,
                flip180,
                positions,
                lineDirection: direction
            });
            transforms.push(transform);
        }

        return transforms;
    }

    /**
     * Line layout - distribute objects along a line path.
     */
    static line(config: LayoutConfig): LayoutTransform[] {
        const {
            objectCount,
            spacingMode = 'distribute',
            spacing = 1.5,
            orientation = 'aligned',
            upMode = 'world',
            flip180 = false,
            layoutDirection = undefined,
            lineDirection = undefined
        } = config;

        const direction = layoutDirection || lineDirection || null;

        const positions = PositionLayouts.getLayoutPositions(
            'line', objectCount, spacing, spacingMode,
            0, 0.25, 0.25, 0.5, 0.5, 'auto', 3, 3, 'radial', 2, null, direction, null
        );

        const transforms: LayoutTransform[] = [];
        for (let i = 0; i < objectCount; i++) {
            const transform = LayoutUtils.calculateCompleteTransform({
                pathType: 'line',
                spacingMode,
                spacing,
                objectIndex: i,
                objectCount,
                time: 0,
                sphereU: 0.25,
                sphereV: 0.25,
                planeX: 0.5,
                planeZ: 0.5,
                orientation,
                upMode,
                flip180,
                positions,
                direction
            });
            transforms.push(transform);
        }

        return transforms;
    }

    /**
     * Spiral layout - distribute objects along a spiral path.
     */
    static spiral(config: LayoutConfig): LayoutTransform[] {
        const {
            objectCount,
            spacingMode = 'distribute',
            spacing = 1.5,
            orientation = 'aligned',
            upMode = 'world',
            flip180 = false,
            spiralConfig,
            layoutDirection = undefined,
            lineDirection = undefined
        } = config;

        const direction = layoutDirection || lineDirection || null;

        const positions = PositionLayouts.getLayoutPositions(
            'spiral', objectCount, spacing, spacingMode,
            0, 0.25, 0.25, 0.5, 0.5, 'auto', 3, 3, 'radial', 2, spiralConfig ?? null, direction, direction
        );

        const transforms: LayoutTransform[] = [];
        for (let i = 0; i < objectCount; i++) {
            const transform = LayoutUtils.calculateCompleteTransform({
                pathType: 'spiral',
                spacingMode,
                spacing,
                objectIndex: i,
                objectCount,
                time: 0,
                sphereU: 0.25,
                sphereV: 0.25,
                planeX: 0.5,
                planeZ: 0.5,
                orientation,
                upMode,
                flip180,
                positions,
                spiralConfig: spiralConfig ?? null,
                lineDirection: direction,
                spiralAxis: direction
            });
            transforms.push(transform);
        }

        return transforms;
    }

    // ======================================================================
    // Adaptive Layouters
    // ======================================================================

    /**
     * Adaptive line layout - normalizes object heights and adaptive spacing.
     * Requires objects with userData dimensions.
     * Returns transforms with needsAdaptiveScaling=true.
     */
    static lineAdaptive(config: LayoutConfig): LayoutTransform[] {
        const { objects } = config;

        if (objects && objects.length > 0 && objects[0].userData && objects[0].userData.width !== undefined) {
            return Layouters._adaptiveLineLayoutPositionsOnly(config);
        } else {
            // Fallback to standard line layout if no size data
            return Layouters.line(config);
        }
    }

    /**
     * Adaptive circle layout - normalizes object heights and adaptive arc spacing.
     */
    static circleAdaptive(config: LayoutConfig): LayoutTransform[] {
        const { objects } = config;

        if (objects && objects.length > 0 && objects[0].userData && objects[0].userData.width !== undefined) {
            return Layouters._adaptiveCircleLayoutPositionsOnly(config);
        } else {
            return Layouters.circle(config);
        }
    }

    /**
     * Adaptive spiral layout - normalizes object heights and adaptive spiral spacing.
     */
    static spiralAdaptive(config: LayoutConfig): LayoutTransform[] {
        const { objects } = config;

        if (objects && objects.length > 0 && objects[0].userData && objects[0].userData.width !== undefined) {
            return Layouters._adaptiveSpiralLayoutPositionsOnly(config);
        } else {
            return Layouters.spiral(config);
        }
    }

    // ======================================================================
    // Surface Layouters
    // ======================================================================

    /**
     * Sphere Grid layout.
     */
    static sphereGrid(config: LayoutConfig): LayoutTransform[] {
        const {
            objectCount,
            spacingMode = 'distribute',
            spacing = 1.5,
            orientation = 'aligned',
            upMode = 'world',
            flip180 = false,
            radius = 8.0
        } = config;

        const positions = PositionLayouts.getLayoutPositions(
            'sphere_grid', objectCount, spacing, spacingMode,
            0, 0.25, 0.25, 0.5, 0.5, 'auto', 3, 3, 'radial', 2, null, null, null, radius
        );

        if (!positions || positions.length === 0) {
            throw new Error(`No positions generated for sphere_grid with objectCount=${objectCount}`);
        }

        const transforms: LayoutTransform[] = [];
        for (let i = 0; i < Math.min(objectCount, positions.length); i++) {
            if (!positions[i]) continue;

            const transform = LayoutUtils.calculateCompleteTransform({
                pathType: 'sphere_grid',
                spacingMode,
                spacing,
                objectIndex: i,
                objectCount,
                time: 0,
                sphereU: 0.25,
                sphereV: 0.25,
                planeX: 0.5,
                planeZ: 0.5,
                orientation,
                upMode,
                flip180,
                positions
            });
            transforms.push(transform);
        }

        return transforms;
    }

    /**
     * Sphere Hex layout (Fibonacci distribution).
     */
    static sphereHex(config: LayoutConfig): LayoutTransform[] {
        const {
            objectCount,
            spacingMode = 'distribute',
            spacing = 1.5,
            orientation = 'aligned',
            upMode = 'world',
            flip180 = false,
            radius = 8.0
        } = config;

        const positions = PositionLayouts.getLayoutPositions(
            'sphere_hex', objectCount, spacing, spacingMode,
            0, 0.25, 0.25, 0.5, 0.5, 'auto', 3, 3, 'radial', 2, null, null, null, radius
        );

        if (!positions || positions.length === 0) {
            throw new Error(`No positions generated for sphere_hex with objectCount=${objectCount}`);
        }

        const transforms: LayoutTransform[] = [];
        for (let i = 0; i < objectCount; i++) {
            const transform = LayoutUtils.calculateCompleteTransform({
                pathType: 'sphere_hex',
                spacingMode,
                spacing,
                objectIndex: i,
                objectCount,
                time: 0,
                sphereU: 0.25,
                sphereV: 0.25,
                planeX: 0.5,
                planeZ: 0.5,
                orientation,
                upMode,
                flip180,
                positions
            });
            transforms.push(transform);
        }

        return transforms;
    }

    /**
     * Sphere Hex Rings layout - ring-based hexagonal pattern on sphere.
     */
    static sphereHexRings(config: LayoutConfig): LayoutTransform[] {
        const {
            objectCount,
            spacingMode = 'distribute',
            spacing = 1.5,
            orientation = 'aligned',
            upMode = 'world',
            flip180 = false,
            radius = 8.0
        } = config;

        const positions = PositionLayouts.getSphereHexRingPositions(objectCount, spacing, spacingMode, radius);

        if (!positions || positions.length === 0) {
            throw new Error(`No positions generated for sphere_hex_rings with objectCount=${objectCount}`);
        }

        const transforms: LayoutTransform[] = [];
        for (let i = 0; i < objectCount; i++) {
            const transform = LayoutUtils.calculateCompleteTransform({
                pathType: 'sphere_hex',
                spacingMode,
                spacing,
                objectIndex: i,
                objectCount,
                time: 0,
                sphereU: 0.25,
                sphereV: 0.25,
                planeX: 0.5,
                planeZ: 0.5,
                orientation,
                upMode,
                flip180,
                positions
            });
            transforms.push(transform);
        }

        return transforms;
    }

    /**
     * Sphere Hex Honeycomb layout - true honeycomb tessellation pattern.
     */
    static sphereHexHoneycomb(config: LayoutConfig): LayoutTransform[] {
        const {
            objectCount,
            spacingMode = 'distribute',
            spacing = 1.5,
            orientation = 'aligned',
            upMode = 'world',
            flip180 = false,
            radius = 8.0
        } = config;

        const positions = PositionLayouts.getSphereHexHoneycombPositions(objectCount, spacing, spacingMode, radius);

        if (!positions || positions.length === 0) {
            throw new Error(`No positions generated for sphere_hex_honeycomb with objectCount=${objectCount}`);
        }

        const transforms: LayoutTransform[] = [];
        for (let i = 0; i < objectCount; i++) {
            const transform = LayoutUtils.calculateCompleteTransform({
                pathType: 'sphere_hex',
                spacingMode,
                spacing,
                objectIndex: i,
                objectCount,
                time: 0,
                sphereU: 0.25,
                sphereV: 0.25,
                planeX: 0.5,
                planeZ: 0.5,
                orientation,
                upMode,
                flip180,
                positions
            });
            transforms.push(transform);
        }

        return transforms;
    }

    /**
     * Plane Grid layout.
     */
    static planeGrid(config: LayoutConfig): LayoutTransform[] {
        const {
            objectCount,
            spacingMode = 'distribute',
            spacing = 1.5,
            orientation = 'aligned',
            upMode = 'world',
            flip180 = false
        } = config;

        const positions = PositionLayouts.getLayoutPositions(
            'plane_grid', objectCount, spacing, spacingMode,
            0, 0.25, 0.25, 0.5, 0.5, 'auto', 3, 3, 'radial', 2
        );

        if (!positions || positions.length === 0) {
            throw new Error(`No positions generated for plane_grid with ${objectCount} objects`);
        }

        const transforms: LayoutTransform[] = [];
        for (let i = 0; i < objectCount; i++) {
            const transform = LayoutUtils.calculateCompleteTransform({
                pathType: 'plane_grid',
                spacingMode,
                spacing,
                objectIndex: i,
                objectCount,
                time: 0,
                sphereU: 0.25,
                sphereV: 0.25,
                planeX: 0.5,
                planeZ: 0.5,
                orientation,
                upMode,
                flip180,
                positions
            });
            transforms.push(transform);
        }

        return transforms;
    }

    /**
     * Plane Hex layout.
     */
    static planeHex(config: LayoutConfig): LayoutTransform[] {
        const {
            objectCount,
            spacingMode = 'distribute',
            spacing = 1.5,
            orientation = 'aligned',
            upMode = 'world',
            flip180 = false
        } = config;

        const positions = PositionLayouts.getLayoutPositions(
            'plane_hex', objectCount, spacing, spacingMode,
            0, 0.25, 0.25, 0.5, 0.5, 'auto', 3, 3, 'radial', 2
        );

        if (!positions || positions.length === 0) {
            throw new Error(`No positions generated for plane_hex with ${objectCount} objects`);
        }

        const transforms: LayoutTransform[] = [];
        for (let i = 0; i < objectCount; i++) {
            const transform = LayoutUtils.calculateCompleteTransform({
                pathType: 'plane_hex',
                spacingMode,
                spacing,
                objectIndex: i,
                objectCount,
                time: 0,
                sphereU: 0.25,
                sphereV: 0.25,
                planeX: 0.5,
                planeZ: 0.5,
                orientation,
                upMode,
                flip180,
                positions
            });
            transforms.push(transform);
        }

        return transforms;
    }

    /**
     * Plane Hex Rings layout.
     */
    static planeHexRings(config: LayoutConfig): LayoutTransform[] {
        const {
            objectCount,
            spacingMode = 'distribute',
            spacing = 1.5,
            orientation = 'aligned',
            upMode = 'world',
            flip180 = false
        } = config;

        const positions = PositionLayouts.getPlaneHexPositions(objectCount, spacing, spacingMode, 'radial', 10);

        if (!positions || positions.length === 0) {
            throw new Error(`No positions generated for plane_hex_rings with ${objectCount} objects`);
        }

        const transforms: LayoutTransform[] = [];
        for (let i = 0; i < objectCount; i++) {
            const transform = LayoutUtils.calculateCompleteTransform({
                pathType: 'plane_hex',
                spacingMode,
                spacing,
                objectIndex: i,
                objectCount,
                time: 0,
                sphereU: 0.25,
                sphereV: 0.25,
                planeX: 0.5,
                planeZ: 0.5,
                orientation,
                upMode,
                flip180,
                positions
            });
            transforms.push(transform);
        }

        return transforms;
    }

    /**
     * Cylinder Grid layout.
     */
    static cylinderGrid(config: LayoutConfig): LayoutTransform[] {
        const {
            objectCount,
            spacingMode = 'distribute',
            spacing = 1.5,
            orientation = 'aligned',
            upMode = 'world',
            flip180 = false
        } = config;

        const positions = PositionLayouts.getLayoutPositions(
            'cylinder_grid', objectCount, spacing, spacingMode,
            0, 0.25, 0.25, 0.5, 0.5, 'auto', 3, 3, 'radial', 2
        );

        if (!positions || positions.length === 0) {
            throw new Error(`No positions generated for cylinder_grid with ${objectCount} objects`);
        }

        const transforms: LayoutTransform[] = [];
        for (let i = 0; i < objectCount; i++) {
            const transform = LayoutUtils.calculateCompleteTransform({
                pathType: 'cylinder_grid',
                spacingMode,
                spacing,
                objectIndex: i,
                objectCount,
                time: 0,
                sphereU: 0.25,
                sphereV: 0.25,
                planeX: 0.5,
                planeZ: 0.5,
                orientation,
                upMode,
                flip180,
                positions
            });
            transforms.push(transform);
        }

        return transforms;
    }

    // ======================================================================
    // Internal Adaptive Layout Implementations
    // ======================================================================

    /**
     * Adaptive Line Layout - positions only, scale calculated externally.
     */
    private static _adaptiveLineLayoutPositionsOnly(config: LayoutConfig): LayoutTransform[] {
        const {
            objectCount,
            spacingMode = 'distribute',
            spacing = 1.5,
            orientation = 'aligned',
            upMode = 'world',
            flip180 = false,
            objects,
            layoutDirection = undefined,
            lineDirection = undefined
        } = config;

        const direction = layoutDirection || lineDirection || null;

        // 1. Get the normal line layout as baseline for orientation
        const baseTransforms = Layouters.line({
            objectCount, spacingMode, spacing, orientation, upMode, flip180, layoutDirection: direction ?? undefined
        });

        // 2. Calculate adaptive positions along the SAME line direction as base layout
        if (baseTransforms.length < 2) {
            for (let i = 0; i < baseTransforms.length; i++) {
                baseTransforms[i].needsAdaptiveScaling = true;
            }
            return baseTransforms;
        }

        const baseStartPos = baseTransforms[0].position;
        const endPos = baseTransforms[baseTransforms.length - 1].position;
        const calculatedLineDirection = {
            x: endPos.x - baseStartPos.x,
            y: endPos.y - baseStartPos.y,
            z: endPos.z - baseStartPos.z
        };
        const lineLength = Math.sqrt(calculatedLineDirection.x ** 2 + calculatedLineDirection.y ** 2 + calculatedLineDirection.z ** 2);

        const startPos: Vec3 = { x: 0, y: 0, z: 0 };

        if (lineLength < 0.001) {
            // Edge case: all objects at same position
            const directionConfig: LayoutConfig = { ...config, spacing: 0.1 };
            const directionTransforms = Layouters.line(directionConfig);

            if (directionTransforms.length >= 2) {
                const dirStartPos = directionTransforms[0].position;
                const dirEndPos = directionTransforms[directionTransforms.length - 1].position;
                const originalDirection = {
                    x: dirEndPos.x - dirStartPos.x,
                    y: dirEndPos.y - dirStartPos.y,
                    z: dirEndPos.z - dirStartPos.z
                };
                const originalLength = Math.sqrt(originalDirection.x ** 2 + originalDirection.y ** 2 + originalDirection.z ** 2);

                if (originalLength > 0.001) {
                    const unitDirection = {
                        x: originalDirection.x / originalLength,
                        y: originalDirection.y / originalLength,
                        z: originalDirection.z / originalLength
                    };
                    return Layouters._adaptiveLineLayoutWithDirection(config, { x: 0, y: 0, z: 0 }, unitDirection, 5);
                }
            }

            const defaultDirection: Vec3 = { x: 1, y: 0, z: 0 };
            return Layouters._adaptiveLineLayoutWithDirection(config, { x: 0, y: 0, z: 0 }, defaultDirection, 5);
        }

        const unitDirection = {
            x: calculatedLineDirection.x / lineLength,
            y: calculatedLineDirection.y / lineLength,
            z: calculatedLineDirection.z / lineLength
        };

        // 3. Calculate FINAL widths that will be used after scaling
        const finalWidths: number[] = [];
        for (let i = 0; i < objectCount && objects && i < objects.length; i++) {
            const obj = objects[i];
            const naturalWidth = obj.userData.naturalWidth || 0.3;
            const naturalHeight = obj.userData.naturalHeight || 0.5;
            const targetHeight = 0.5;

            const finalScaleFactor = targetHeight / naturalHeight;
            const finalWidth = naturalWidth * finalScaleFactor;

            finalWidths.push(finalWidth);
        }

        // 4. ITERATIVE positioning — masonry-style: each tile placed edge-to-edge + gap
        // Both spacing modes use the same iterative approach.
        // 'margin': spacing = fixed gap between tiles
        // 'distribute': spacing = gap, total length adapts to content
        const adaptiveTransforms: LayoutTransform[] = [];
        const gap = spacing;

        // First pass: compute total length for centering
        let totalLength = 0;
        for (let i = 0; i < finalWidths.length; i++) {
            totalLength += finalWidths[i];
            if (i < finalWidths.length - 1) totalLength += gap;
        }

        // Second pass: place tiles centered around origin
        let cursor = -totalLength / 2;

        for (let i = 0; i < objectCount && objects && i < objects.length && i < baseTransforms.length; i++) {
            const currentWidth = finalWidths[i];
            const centerPos = cursor + currentWidth / 2;

            const newPosition: Vec3 = {
                x: startPos.x + unitDirection.x * centerPos,
                y: startPos.y + unitDirection.y * centerPos,
                z: startPos.z + unitDirection.z * centerPos
            };

            cursor += currentWidth + gap;

            adaptiveTransforms.push({
                position: newPosition,
                rotation: baseTransforms[i].rotation,
                scale: { x: 1, y: 1, z: 1 },
                needsAdaptiveScaling: true
            });
        }

        return adaptiveTransforms;
    }

    /**
     * Adaptive Line Layout with explicit direction (fallback for edge cases).
     */
    private static _adaptiveLineLayoutWithDirection(
        config: LayoutConfig,
        startPos: Vec3,
        unitDirection: Vec3,
        lineLength: number
    ): LayoutTransform[] {
        const {
            objectCount,
            spacingMode = 'distribute',
            spacing = 1.5,
            objects
        } = config;

        const finalWidths: number[] = [];
        for (let i = 0; i < objectCount && objects && i < objects.length; i++) {
            const obj = objects[i];
            const naturalWidth = obj.userData.naturalWidth || 0.3;
            const naturalHeight = obj.userData.naturalHeight || 0.5;
            const targetHeight = 0.5;
            const finalScaleFactor = targetHeight / naturalHeight;
            const finalWidth = naturalWidth * finalScaleFactor;
            finalWidths.push(finalWidth);
        }

        const adaptiveTransforms: LayoutTransform[] = [];
        const gap = spacing;

        // Compute total length for centering
        let totalLength = 0;
        for (let i = 0; i < finalWidths.length; i++) {
            totalLength += finalWidths[i];
            if (i < finalWidths.length - 1) totalLength += gap;
        }

        let cursor = -totalLength / 2;

        for (let i = 0; i < objectCount && objects && i < objects.length; i++) {
            const currentWidth = finalWidths[i];
            const centerPos = cursor + currentWidth / 2;

            const newPosition: Vec3 = {
                x: startPos.x + unitDirection.x * centerPos,
                y: startPos.y + unitDirection.y * centerPos,
                z: startPos.z + unitDirection.z * centerPos
            };

            cursor += currentWidth + gap;

            // Calculate proper rotation using LayoutUtils
            const transform = LayoutUtils.calculateCompleteTransform({
                pathType: 'line',
                spacingMode: config.spacingMode ?? 'distribute',
                spacing: config.spacing ?? 1.5,
                objectIndex: 0,
                objectCount: config.objectCount,
                time: 0,
                sphereU: 0.25,
                sphereV: 0.25,
                planeX: 0.5,
                planeZ: 0.5,
                orientation: config.orientation ?? 'aligned',
                upMode: config.upMode ?? 'world',
                flip180: config.flip180 ?? false,
                positions: [newPosition]
            });

            adaptiveTransforms.push({
                position: newPosition,
                rotation: transform.rotation,
                scale: { x: 1, y: 1, z: 1 },
                needsAdaptiveScaling: true
            });
        }

        return adaptiveTransforms;
    }

    /**
     * Adaptive Circle Layout - positions only, scale calculated externally.
     */
    private static _adaptiveCircleLayoutPositionsOnly(config: LayoutConfig): LayoutTransform[] {
        const {
            objectCount,
            spacingMode = 'distribute',
            spacing = 1.5,
            orientation = 'aligned',
            upMode = 'world',
            flip180 = false,
            objects,
            radius = 5.0,
            layoutDirection = undefined,
            lineDirection = undefined
        } = config;

        const direction = layoutDirection || lineDirection || null;

        const baseTransforms = Layouters.circle({
            objectCount, spacingMode, spacing, orientation, upMode, flip180, radius, layoutDirection: direction ?? undefined
        });

        if (baseTransforms.length < 2) {
            for (let i = 0; i < baseTransforms.length; i++) {
                baseTransforms[i].needsAdaptiveScaling = true;
            }
            return baseTransforms;
        }

        const circleRadius = radius;
        const circumference = 2 * Math.PI * circleRadius;

        const finalWidths: number[] = [];
        const arcLengths: number[] = [];
        for (let i = 0; i < objectCount && objects && i < objects.length; i++) {
            const obj = objects[i];
            const naturalWidth = obj.userData.naturalWidth || 0.3;
            const naturalHeight = obj.userData.naturalHeight || 0.5;
            const targetHeight = 0.5;
            const finalScaleFactor = targetHeight / naturalHeight;
            const finalWidth = naturalWidth * finalScaleFactor;

            const arcLength = finalWidth;
            finalWidths.push(finalWidth);
            arcLengths.push(arcLength);
        }

        // Extract circle coordinate system
        let circleNormal: Vec3, circleU: Vec3, circleV: Vec3;
        if (direction) {
            circleNormal = vec3Normalize(direction);

            const worldUp: Vec3 = { x: 0, y: 1, z: 0 };
            const worldRight: Vec3 = { x: 1, y: 0, z: 0 };

            circleU = vec3Cross(circleNormal, worldUp);
            if (vec3Length(circleU) < 0.001) {
                circleU = vec3Cross(circleNormal, worldRight);
            }
            circleU = vec3Normalize(circleU);

            circleV = vec3Normalize(vec3Cross(circleNormal, circleU));
        } else {
            circleNormal = { x: 0, y: 1, z: 0 };
            circleU = { x: 1, y: 0, z: 0 };
            circleV = { x: 0, y: 0, z: 1 };
        }

        const adaptiveTransforms: LayoutTransform[] = [];
        let currentAngle = 0;

        for (let i = 0; i < objectCount && objects && i < objects.length && i < baseTransforms.length; i++) {
            const currentArcLength = arcLengths[i];

            const x = circleRadius * (circleU.x * Math.cos(currentAngle) + circleV.x * Math.sin(currentAngle));
            const y = circleRadius * (circleU.y * Math.cos(currentAngle) + circleV.y * Math.sin(currentAngle));
            const z = circleRadius * (circleU.z * Math.cos(currentAngle) + circleV.z * Math.sin(currentAngle));
            const newPosition: Vec3 = { x, y, z };

            if (i < objectCount - 1) {
                const nextArcLength = arcLengths[i + 1];
                let spacingArcLength: number;

                if (spacingMode === 'margin') {
                    spacingArcLength = currentArcLength / 2 + spacing + nextArcLength / 2;
                } else {
                    const totalArcLength = arcLengths.reduce((sum, arc) => sum + arc, 0);
                    const availableCircumference = circumference - totalArcLength;
                    const gap = availableCircumference / Math.max(1, objectCount - 1);
                    spacingArcLength = currentArcLength / 2 + gap + nextArcLength / 2;
                }

                const angleIncrement = spacingArcLength / circleRadius;
                currentAngle += angleIncrement;
            }

            const tParameter = currentAngle / (2 * Math.PI);

            const { tangent, normal, binormal } = LayoutUtils.getSurfaceVectors(
                'circle',
                newPosition,
                tParameter,
                null,
                null,
                null,
                null,
                null,
                direction,
                null
            );

            const rotation = LayoutUtils.calculateOrientation(
                tangent, normal, binormal, newPosition,
                orientation, upMode, 'circle', flip180
            );

            adaptiveTransforms.push({
                position: newPosition,
                rotation: { x: rotation.x, y: rotation.y, z: rotation.z },
                scale: { x: 1, y: 1, z: 1 },
                needsAdaptiveScaling: true
            });
        }

        return adaptiveTransforms;
    }

    /**
     * Adaptive Spiral Layout - positions only, scale calculated externally.
     */
    private static _adaptiveSpiralLayoutPositionsOnly(config: LayoutConfig): LayoutTransform[] {
        const {
            objectCount,
            spacingMode = 'distribute',
            spacing = 1.5,
            orientation = 'aligned',
            upMode = 'world',
            flip180 = false,
            objects,
            spiralConfig,
            layoutDirection = undefined,
            lineDirection = undefined
        } = config;

        const direction = layoutDirection || lineDirection || null;

        const baseTransforms = Layouters.spiral({
            objectCount, spacingMode, spacing, orientation, upMode, flip180, spiralConfig, layoutDirection: direction ?? undefined
        });

        if (baseTransforms.length < 2) {
            for (let i = 0; i < baseTransforms.length; i++) {
                baseTransforms[i].needsAdaptiveScaling = true;
            }
            return baseTransforms;
        }

        const spiralTurns = spiralConfig?.spiralTurns || 2;
        const maxRadius = spiralConfig?.maxRadius || 3;
        const growthRate = spiralConfig?.growthRate || 2;
        const startDistance = spiralConfig?.startDistance || 0;

        const finalWidths: number[] = [];
        for (let i = 0; i < objectCount && objects && i < objects.length; i++) {
            const obj = objects[i];
            const naturalWidth = obj.userData.naturalWidth || 0.3;
            const naturalHeight = obj.userData.naturalHeight || 0.5;
            const targetHeight = 0.5;
            const finalScaleFactor = targetHeight / naturalHeight;
            const finalWidth = naturalWidth * finalScaleFactor;
            finalWidths.push(finalWidth);
        }

        // Extract spiral coordinate system
        let spiralAxisVector: Vec3, spiralU: Vec3, spiralV: Vec3;
        if (direction) {
            spiralAxisVector = vec3Normalize(direction);

            const worldUp: Vec3 = { x: 0, y: 1, z: 0 };
            const worldRight: Vec3 = { x: 1, y: 0, z: 0 };

            spiralU = vec3Cross(spiralAxisVector, worldUp);
            if (vec3Length(spiralU) < 0.001) {
                spiralU = vec3Cross(spiralAxisVector, worldRight);
            }
            spiralU = vec3Normalize(spiralU);

            spiralV = vec3Normalize(vec3Cross(spiralAxisVector, spiralU));
        } else {
            spiralAxisVector = { x: 0, y: 1, z: 0 };
            spiralU = { x: 1, y: 0, z: 0 };
            spiralV = { x: 0, y: 0, z: 1 };
        }

        const adaptiveTransforms: LayoutTransform[] = [];
        let currentT = startDistance;

        for (let i = 0; i < objectCount && objects && i < objects.length && i < baseTransforms.length; i++) {
            const currentWidth = finalWidths[i];

            const angle = currentT * spiralTurns * 2 * Math.PI;
            const spiralRadius = (currentT / 1.0) * maxRadius;
            const currentHeightProgression = currentT * growthRate - 1;

            const x = spiralRadius * (spiralU.x * Math.cos(angle) + spiralV.x * Math.sin(angle)) + currentHeightProgression * spiralAxisVector.x;
            const y = spiralRadius * (spiralU.y * Math.cos(angle) + spiralV.y * Math.sin(angle)) + currentHeightProgression * spiralAxisVector.y;
            const z = spiralRadius * (spiralU.z * Math.cos(angle) + spiralV.z * Math.sin(angle)) + currentHeightProgression * spiralAxisVector.z;
            const newPosition: Vec3 = { x, y, z };

            if (i < objectCount - 1) {
                const nextWidth = finalWidths[i + 1];
                let spacingDistance: number;

                if (spacingMode === 'margin') {
                    spacingDistance = currentWidth / 2 + spacing + nextWidth / 2;
                } else {
                    const totalWidth = finalWidths.reduce((sum, w) => sum + w, 0);
                    const availableSpiral = 1.0 - (totalWidth / (objectCount * 0.5));
                    const gap = availableSpiral / Math.max(1, objectCount - 1);
                    spacingDistance = currentWidth / 2 + gap + nextWidth / 2;
                }

                const tIncrement = Layouters._findSpiralTIncrementWithDirection(
                    currentT, spacingDistance, spiralTurns, maxRadius, growthRate, spiralAxisVector, spiralU, spiralV
                );
                currentT += tIncrement;
            }

            const { tangent, normal, binormal } = LayoutUtils.getSurfaceVectors(
                'spiral',
                newPosition,
                currentT,
                null,
                null,
                null,
                null,
                { spiralTurns, maxRadius, growthRate, startDistance },
                direction,
                direction
            );

            const rotation = LayoutUtils.calculateOrientation(
                tangent, normal, binormal, newPosition,
                orientation, upMode, 'spiral', flip180
            );

            adaptiveTransforms.push({
                position: newPosition,
                rotation: { x: rotation.x, y: rotation.y, z: rotation.z },
                scale: { x: 1, y: 1, z: 1 },
                needsAdaptiveScaling: true
            });
        }

        return adaptiveTransforms;
    }

    // ======================================================================
    // Spiral T-Increment Helpers
    // ======================================================================

    /**
     * Find correct t-increment for spiral to achieve desired arc length (legacy Y-axis spiral).
     */
    static findSpiralTIncrement(
        currentT: number,
        targetDistance: number,
        spiralTurns: number,
        maxRadius: number,
        growthRate: number = 2
    ): number {
        let tIncrement = targetDistance / (maxRadius * 2 * Math.PI);
        const maxIterations = 10;
        const tolerance = 0.001;

        for (let iter = 0; iter < maxIterations; iter++) {
            const nextT = currentT + tIncrement;

            const currentPos = Layouters._getSpiralPosition(currentT, spiralTurns, maxRadius, growthRate);
            const nextPos = Layouters._getSpiralPosition(nextT, spiralTurns, maxRadius, growthRate);

            const actualDistance = Math.sqrt(
                (nextPos.x - currentPos.x) ** 2 +
                (nextPos.y - currentPos.y) ** 2 +
                (nextPos.z - currentPos.z) ** 2
            );

            const error = Math.abs(actualDistance - targetDistance);
            if (error < tolerance) {
                break;
            }

            const ratio = targetDistance / actualDistance;
            tIncrement *= ratio;

            if (tIncrement < 0.00001) break;
            if (tIncrement > 1.0) break;
        }

        return Math.max(0.00001, tIncrement);
    }

    /**
     * Find correct t-increment for spiral with custom direction.
     */
    private static _findSpiralTIncrementWithDirection(
        currentT: number,
        targetDistance: number,
        spiralTurns: number,
        maxRadius: number,
        growthRate: number,
        spiralAxisVector: Vec3,
        spiralU: Vec3,
        spiralV: Vec3
    ): number {
        let tIncrement = targetDistance / (maxRadius * 2 * Math.PI);
        const maxIterations = 10;
        const tolerance = 0.001;

        for (let iter = 0; iter < maxIterations; iter++) {
            const nextT = currentT + tIncrement;

            const currentPos = Layouters._getSpiralPositionWithDirection(currentT, spiralTurns, maxRadius, growthRate, spiralAxisVector, spiralU, spiralV);
            const nextPos = Layouters._getSpiralPositionWithDirection(nextT, spiralTurns, maxRadius, growthRate, spiralAxisVector, spiralU, spiralV);

            const actualDistance = Math.sqrt(
                (nextPos.x - currentPos.x) ** 2 +
                (nextPos.y - currentPos.y) ** 2 +
                (nextPos.z - currentPos.z) ** 2
            );

            const error = Math.abs(actualDistance - targetDistance);
            if (error < tolerance) {
                break;
            }

            const ratio = targetDistance / actualDistance;
            tIncrement *= ratio;

            if (tIncrement < 0.00001) break;
            if (tIncrement > 1.0) break;
        }

        return Math.max(0.00001, tIncrement);
    }

    /**
     * Get spiral position for given t parameter (legacy Y-axis spiral).
     */
    private static _getSpiralPosition(t: number, spiralTurns: number, maxRadius: number, growthRate: number = 2): Vec3 {
        const angle = t * spiralTurns * 2 * Math.PI;
        const radius = (t / 1.0) * maxRadius;
        return {
            x: radius * Math.cos(angle),
            y: t * growthRate - 1,
            z: radius * Math.sin(angle)
        };
    }

    /**
     * Get spiral position for given t parameter with custom direction.
     */
    private static _getSpiralPositionWithDirection(
        t: number,
        spiralTurns: number,
        maxRadius: number,
        growthRate: number,
        spiralAxisVector: Vec3,
        spiralU: Vec3,
        spiralV: Vec3
    ): Vec3 {
        const angle = t * spiralTurns * 2 * Math.PI;
        const radius = (t / 1.0) * maxRadius;
        const heightProgression = t * growthRate - 1;

        return {
            x: radius * (spiralU.x * Math.cos(angle) + spiralV.x * Math.sin(angle)) + heightProgression * spiralAxisVector.x,
            y: radius * (spiralU.y * Math.cos(angle) + spiralV.y * Math.sin(angle)) + heightProgression * spiralAxisVector.y,
            z: radius * (spiralU.z * Math.cos(angle) + spiralV.z * Math.sin(angle)) + heightProgression * spiralAxisVector.z
        };
    }
}
