/**
 * PositionLayouts - Position calculation for all layout types.
 * Port of position-layouts.js - all position generation functions.
 */

import { Vec3, PathType, SpacingMode, GridMode, HexMode, SpiralConfig, SpiralAxis } from './types';
import { PathLayouts } from './PathLayouts';

export class PositionLayouts {

    /**
     * Main entry point: get layout positions for any path type.
     */
    static getLayoutPositions(
        pathType: PathType,
        objectCount: number,
        spacing: number,
        spacingMode: SpacingMode,
        time: number,
        sphereU: number,
        sphereV: number,
        planeX: number,
        planeZ: number,
        gridMode: GridMode,
        gridRows: number,
        gridCols: number,
        hexMode: HexMode,
        hexRings: number,
        spiralConfig: SpiralConfig | null = null,
        lineDirection: Vec3 | null = null,
        spiralAxis: Vec3 | SpiralAxis | null = null,
        radius: number = 2.0
    ): Vec3[] {
        const positions: Vec3[] = [];

        switch (pathType) {
            case 'line':
            case 'circle':
            case 'spiral':
                // 1D layouts - distribute along path
                if (spacingMode === 'margin') {
                    const startT = 0.0;

                    if (pathType === 'spiral') {
                        // SPIRAL: Use iterative arc length calculation for true fixed spacing
                        positions.push(PathLayouts.getPathPoint(startT, pathType, sphereU, sphereV, planeX, planeZ, spiralConfig, lineDirection, spiralAxis, radius));

                        let currentT = startT;
                        for (let i = 1; i < objectCount; i++) {
                            const tIncrement = PositionLayouts._findSpiralTIncrement(
                                currentT,
                                spacing,
                                spiralConfig?.spiralTurns || 2,
                                spiralConfig?.maxRadius || 3,
                                spiralConfig?.growthRate || 2
                            );
                            currentT += tIncrement;
                            positions.push(PathLayouts.getPathPoint(currentT, pathType, sphereU, sphereV, planeX, planeZ, spiralConfig, lineDirection, spiralAxis, radius));
                        }
                    } else if (pathType === 'line') {
                        const stepSize = spacing * 0.1;
                        for (let i = 0; i < objectCount; i++) {
                            const t = startT + i * stepSize;
                            positions.push(PathLayouts.getPathPoint(t, pathType, sphereU, sphereV, planeX, planeZ, spiralConfig, lineDirection, spiralAxis, radius));
                        }
                    } else {
                        // CIRCLE: Fixed spacing as fraction of circumference
                        const stepSize = spacing * 0.05;
                        for (let i = 0; i < objectCount; i++) {
                            const t = (startT + i * stepSize) % 1.0;
                            positions.push(PathLayouts.getPathPoint(t, pathType, sphereU, sphereV, planeX, planeZ, spiralConfig, lineDirection, spiralAxis, radius));
                        }
                    }
                } else {
                    // Distribute evenly across entire path
                    for (let i = 0; i < objectCount; i++) {
                        let t: number;
                        if (pathType === 'line') {
                            t = i / Math.max(1, objectCount - 1);
                        } else {
                            t = i / objectCount;
                        }
                        positions.push(PathLayouts.getPathPoint(t, pathType, sphereU, sphereV, planeX, planeZ, spiralConfig, lineDirection, spiralAxis, radius));
                    }
                }
                break;

            case 'plane_grid':
                positions.push(...PositionLayouts.getPlaneGridPositions(objectCount, spacing, spacingMode, gridMode, gridRows, gridCols));
                break;

            case 'plane_hex':
                positions.push(...PositionLayouts.getPlaneHexPositions(objectCount, spacing, spacingMode, hexMode, hexRings));
                break;

            case 'sphere_grid':
                positions.push(...PositionLayouts.getSphereGridPositions(objectCount, spacing, spacingMode, radius));
                break;

            case 'sphere_hex':
                positions.push(...PositionLayouts.getSphereHexPositions(objectCount, spacing, spacingMode, radius));
                break;

            case 'cylinder_grid':
                positions.push(...PositionLayouts.getCylinderGridPositions(objectCount, spacing, spacingMode));
                break;

            case 'plane_free':
                positions.push(PathLayouts.getPathPoint(time, pathType, sphereU, sphereV, planeX, planeZ, spiralConfig, null, null, radius));
                break;

            case 'sphere_free':
                positions.push(PathLayouts.getPathPoint(time, pathType, sphereU, sphereV, planeX, planeZ, spiralConfig, null, null, radius));
                break;
        }

        return positions;
    }

    /**
     * Internal spiral t-increment finder used by margin-mode positioning.
     * Matches the ModernLayouters.findSpiralTIncrement from the source.
     */
    private static _findSpiralTIncrement(
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

            const currentPos = PositionLayouts._getSpiralPosition(currentT, spiralTurns, maxRadius, growthRate);
            const nextPos = PositionLayouts._getSpiralPosition(nextT, spiralTurns, maxRadius, growthRate);

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

    private static _getSpiralPosition(t: number, spiralTurns: number, maxRadius: number, growthRate: number = 2): Vec3 {
        const angle = t * spiralTurns * 2 * Math.PI;
        const radius = (t / 1.0) * maxRadius;
        return {
            x: radius * Math.cos(angle),
            y: t * growthRate - 1,
            z: radius * Math.sin(angle)
        };
    }

    // --- Plane Grid ---

    static getPlaneGridPositions(
        objectCount: number,
        spacing: number,
        spacingMode: SpacingMode,
        gridMode: GridMode,
        gridRows: number,
        gridCols: number
    ): Vec3[] {
        const positions: Vec3[] = [];
        let rows: number, cols: number;

        if (gridMode === 'auto') {
            cols = Math.ceil(Math.sqrt(objectCount));
            rows = Math.ceil(objectCount / cols);
        } else {
            rows = gridRows;
            cols = gridCols;
        }

        let cellSpacingX: number, cellSpacingZ: number;

        if (spacingMode === 'margin') {
            cellSpacingX = spacing;
            cellSpacingZ = spacing;
        } else {
            const totalAreaSize = 6;
            cellSpacingX = totalAreaSize / Math.max(1, cols - 1);
            cellSpacingZ = totalAreaSize / Math.max(1, rows - 1);
        }

        const startX = -(cols - 1) * cellSpacingX / 2;
        const startZ = -(rows - 1) * cellSpacingZ / 2;

        for (let i = 0; i < objectCount; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;

            const localX = startX + col * cellSpacingX;
            const localZ = startZ + row * cellSpacingZ;

            const tiltAngle = Math.PI / 4;
            positions.push({
                x: localX,
                y: -localZ * Math.sin(tiltAngle),
                z: localZ * Math.cos(tiltAngle)
            });
        }

        return positions;
    }

    // --- Plane Hex ---

    static getPlaneHexPositions(
        objectCount: number,
        spacing: number,
        spacingMode: SpacingMode,
        hexMode: HexMode,
        hexRings: number
    ): Vec3[] {
        const positions: Vec3[] = [];

        if (hexMode === 'radial') {
            if (objectCount > 0) {
                positions.push({ x: 0, y: 0, z: 0 });
            }

            let objectIndex = 1;
            for (let ring = 1; ring <= hexRings && objectIndex < objectCount; ring++) {
                const objectsInRing = 6 * ring;

                let radius: number;
                if (spacingMode === 'margin') {
                    radius = ring * spacing;
                } else {
                    const maxRadius = 4;
                    radius = (ring / hexRings) * maxRadius;
                }

                for (let i = 0; i < objectsInRing && objectIndex < objectCount; i++) {
                    const angle = (i / objectsInRing) * Math.PI * 2;
                    const localX = Math.cos(angle) * radius;
                    const localZ = Math.sin(angle) * radius;

                    const tiltAngle = Math.PI / 4;
                    positions.push({
                        x: localX,
                        y: -localZ * Math.sin(tiltAngle),
                        z: localZ * Math.cos(tiltAngle)
                    });
                    objectIndex++;
                }
            }
        } else {
            // Row-based hex layout
            let rowSpacing: number, colSpacing: number;

            if (spacingMode === 'margin') {
                rowSpacing = spacing;
                colSpacing = spacing * 0.866; // sqrt(3)/2
            } else {
                const maxRows = Math.ceil(objectCount / hexRings);
                const areaSize = 5;
                rowSpacing = areaSize / Math.max(1, maxRows - 1);
                colSpacing = rowSpacing * 0.866;
            }

            for (let i = 0; i < objectCount; i++) {
                const row = Math.floor(i / hexRings);
                const col = i % hexRings;

                const offsetX = (row % 2) * colSpacing / 2;
                const localX = col * colSpacing + offsetX - (hexRings - 1) * colSpacing / 2;
                const localZ = row * rowSpacing - (Math.ceil(objectCount / hexRings) - 1) * rowSpacing / 2;

                const tiltAngle = Math.PI / 4;
                positions.push({
                    x: localX,
                    y: -localZ * Math.sin(tiltAngle),
                    z: localZ * Math.cos(tiltAngle)
                });
            }
        }

        return positions;
    }

    // --- Cylinder Grid ---

    static getCylinderGridPositions(
        objectCount: number,
        spacing: number,
        spacingMode: SpacingMode
    ): Vec3[] {
        const positions: Vec3[] = [];

        let rings: number, objectsPerRing: number;

        if (spacingMode === 'margin') {
            const cylinderHeight = 4;
            const ringSpacing = spacing * 0.5;
            rings = Math.max(1, Math.floor(cylinderHeight / ringSpacing) + 1);
            objectsPerRing = Math.ceil(objectCount / rings);
        } else {
            rings = Math.max(1, Math.ceil(Math.sqrt(objectCount / 3)));
            objectsPerRing = Math.ceil(objectCount / rings);
        }

        const radius = 2;
        const totalHeight = 3;

        let objectIndex = 0;
        for (let ring = 0; ring < rings && objectIndex < objectCount; ring++) {
            let y: number;
            if (rings === 1) {
                y = 0;
            } else {
                y = (ring / (rings - 1)) * totalHeight - totalHeight / 2;
            }

            const objectsInThisRing = Math.min(objectsPerRing, objectCount - objectIndex);

            for (let obj = 0; obj < objectsInThisRing; obj++) {
                const angle = (obj / objectsInThisRing) * Math.PI * 2;

                positions.push({
                    x: radius * Math.cos(angle),
                    y: y,
                    z: radius * Math.sin(angle)
                });
                objectIndex++;
            }
        }

        return positions;
    }

    // --- Sphere Grid ---

    static getSphereGridPositions(
        objectCount: number,
        spacing: number,
        spacingMode: SpacingMode,
        radius: number = 8.0
    ): Vec3[] {
        const positions: Vec3[] = [];
        const sphereRadius = radius;

        if (spacingMode === 'margin') {
            const angularSpacing = spacing * 0.1;
            const objectsPerEquatorRing = Math.max(1, Math.floor((2 * Math.PI) / angularSpacing));

            let objectIndex = 0;
            let currentRing = 0;

            while (objectIndex < objectCount) {
                let theta: number;
                if (currentRing === 0) {
                    theta = Math.PI / 2;
                } else {
                    const ringDistance = currentRing * angularSpacing;
                    if (currentRing % 2 === 1) {
                        theta = Math.PI / 2 - ringDistance;
                    } else {
                        theta = Math.PI / 2 + ringDistance;
                    }
                }

                theta = Math.max(0.01, Math.min(Math.PI - 0.01, theta));

                const ringCircumference = Math.sin(theta);
                const objectsInThisRing = Math.max(1, Math.round(objectsPerEquatorRing * ringCircumference));
                const actualObjectsInRing = Math.min(objectsInThisRing, objectCount - objectIndex);

                for (let obj = 0; obj < actualObjectsInRing; obj++) {
                    const phi = (obj / actualObjectsInRing) * Math.PI * 2;

                    positions.push({
                        x: sphereRadius * Math.sin(theta) * Math.cos(phi),
                        y: sphereRadius * Math.cos(theta),
                        z: sphereRadius * Math.sin(theta) * Math.sin(phi)
                    });
                    objectIndex++;
                }

                currentRing++;
                if (currentRing > 100) break;
            }
        } else {
            const optimalEquatorObjects = Math.max(1, Math.ceil(Math.sqrt(objectCount * 2)));

            let objectIndex = 0;
            let currentRing = 0;

            while (objectIndex < objectCount) {
                let theta: number;
                if (currentRing === 0) {
                    theta = Math.PI / 2;
                } else {
                    const totalRings = Math.ceil(objectCount / optimalEquatorObjects);

                    if (totalRings % 2 === 1) {
                        const ringsPerSide = Math.floor(totalRings / 2);
                        if (currentRing <= ringsPerSide) {
                            theta = Math.PI / 2 - (currentRing * Math.PI / (2 * ringsPerSide + 1));
                        } else {
                            const southRing = currentRing - ringsPerSide;
                            theta = Math.PI / 2 + (southRing * Math.PI / (2 * ringsPerSide + 1));
                        }
                    } else {
                        const ringsPerSide = totalRings / 2;
                        if (currentRing <= ringsPerSide) {
                            theta = Math.PI / 2 - ((currentRing + 0.5) * Math.PI / (2 * ringsPerSide));
                        } else {
                            const southRing = currentRing - ringsPerSide;
                            theta = Math.PI / 2 + ((southRing + 0.5) * Math.PI / (2 * ringsPerSide));
                        }
                    }
                }

                theta = Math.max(0.01, Math.min(Math.PI - 0.01, theta));

                const ringCircumference = Math.sin(theta);
                const objectsInThisRing = Math.max(1, Math.round(optimalEquatorObjects * ringCircumference));
                const actualObjectsInRing = Math.min(objectsInThisRing, objectCount - objectIndex);

                for (let obj = 0; obj < actualObjectsInRing; obj++) {
                    const phi = (obj / actualObjectsInRing) * Math.PI * 2;

                    positions.push({
                        x: sphereRadius * Math.sin(theta) * Math.cos(phi),
                        y: sphereRadius * Math.cos(theta),
                        z: sphereRadius * Math.sin(theta) * Math.sin(phi)
                    });
                    objectIndex++;
                }

                currentRing++;
                if (currentRing > 100) break;
            }
        }

        return positions;
    }

    // --- Sphere Hex (Fibonacci) ---

    static getSphereHexPositions(
        objectCount: number,
        spacing: number,
        spacingMode: SpacingMode,
        radius: number = 8.0
    ): Vec3[] {
        const positions: Vec3[] = [];
        const sphereRadius = radius;
        const goldenRatio = (1 + Math.sqrt(5)) / 2;

        for (let i = 0; i < objectCount; i++) {
            let theta: number, phi: number;

            if (spacingMode === 'margin') {
                const angularStep = spacing * 0.2;
                theta = angularStep * i;

                const progressAlongSphere = i / Math.max(1, objectCount - 1);
                phi = progressAlongSphere * Math.PI;

                const spiralVariation = Math.sin(theta) * (spacing * 0.05);
                phi = Math.max(0.01, Math.min(Math.PI - 0.01, phi + spiralVariation));
            } else {
                theta = 2 * Math.PI * i / goldenRatio;
                phi = Math.acos(1 - 2 * i / objectCount);
            }

            positions.push({
                x: sphereRadius * Math.sin(phi) * Math.cos(theta),
                y: sphereRadius * Math.cos(phi),
                z: sphereRadius * Math.sin(phi) * Math.sin(theta)
            });
        }

        return positions;
    }

    // --- Sphere Hex Rings ---

    static getSphereHexRingPositions(
        objectCount: number,
        spacing: number,
        spacingMode: SpacingMode,
        radius: number = 8.0
    ): Vec3[] {
        const positions: Vec3[] = [];
        const sphereRadius = radius;

        // Calculate how many rings we need
        let totalObjectsPlaced = 0;
        let maxRings = 0;
        while (totalObjectsPlaced < objectCount) {
            if (maxRings === 0) {
                totalObjectsPlaced += 1;
            } else {
                totalObjectsPlaced += 6 * maxRings;
            }
            maxRings++;
        }
        maxRings--;

        // Center position at front equator
        if (objectCount > 0) {
            positions.push({
                x: sphereRadius,
                y: 0,
                z: 0
            });
        }

        // Rings around center point on sphere surface
        let objectIndex = 1;
        for (let ring = 1; ring <= maxRings && objectIndex < objectCount; ring++) {
            const objectsInRing = 6 * ring;

            let angularDistance: number;
            if (spacingMode === 'margin') {
                angularDistance = ring * spacing * 0.2;
                angularDistance = Math.min(Math.PI * 0.8, angularDistance);
            } else {
                const maxAngularDistance = Math.PI * 0.6;
                angularDistance = (ring / maxRings) * maxAngularDistance;
            }

            const actualObjectsInRing = Math.min(objectsInRing, objectCount - objectIndex);
            for (let obj = 0; obj < actualObjectsInRing; obj++) {
                const ringAngle = (obj / objectsInRing) * Math.PI * 2;

                const lat = Math.asin(Math.sin(0) * Math.cos(angularDistance) +
                    Math.cos(0) * Math.sin(angularDistance) * Math.cos(ringAngle));

                const lon = Math.atan2(Math.sin(ringAngle) * Math.sin(angularDistance) * Math.cos(0),
                    Math.cos(angularDistance) - Math.sin(0) * Math.sin(lat));

                positions.push({
                    x: sphereRadius * Math.cos(lat) * Math.cos(lon),
                    y: sphereRadius * Math.sin(lat),
                    z: sphereRadius * Math.cos(lat) * Math.sin(lon)
                });
                objectIndex++;
            }
        }

        return positions;
    }

    // --- Sphere Hex Honeycomb ---

    static getSphereHexHoneycombPositions(
        objectCount: number,
        spacing: number,
        spacingMode: SpacingMode,
        radius: number = 8.0
    ): Vec3[] {
        const positions: Vec3[] = [];
        const sphereRadius = radius;

        // Step 1: Generate perfect 2D honeycomb coordinates
        const hexCoords: { x: number; y: number }[] = [];

        const hexSize = spacingMode === 'margin' ? spacing * 0.3 : 0.3;
        // hexWidth and hexHeight are used implicitly through hexSize in the axial->cartesian conversion
        // const hexWidth = hexSize * 2;
        // const hexHeight = hexSize * Math.sqrt(3);
        // const horizontalSpacing = hexWidth * 0.75;
        // const verticalSpacing = hexHeight;

        let objectIndex = 0;

        // Center hex at (0, 0)
        if (objectIndex < objectCount) {
            hexCoords.push({ x: 0, y: 0 });
            objectIndex++;
        }

        // Generate rings of hexagons
        let ring = 1;
        while (objectIndex < objectCount) {
            for (let side = 0; side < 6 && objectIndex < objectCount; side++) {
                for (let step = 0; step < ring && objectIndex < objectCount; step++) {
                    let q: number = 0, r: number = 0;

                    switch (side) {
                        case 0: q = ring; r = -step; break;
                        case 1: q = ring - step; r = -ring; break;
                        case 2: q = -step; r = -ring + step; break;
                        case 3: q = -ring; r = step; break;
                        case 4: q = -ring + step; r = ring; break;
                        case 5: q = step; r = ring - step; break;
                    }

                    const x = hexSize * (3 / 2 * q);
                    const y = hexSize * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);

                    hexCoords.push({ x, y });
                    objectIndex++;
                }
            }
            ring++;
        }

        // Step 2: Project 2D honeycomb to sphere surface
        for (const coord of hexCoords) {
            const scaledX = coord.x;
            const scaledY = coord.y;

            const r2 = scaledX * scaledX + scaledY * scaledY;
            // Stereographic projection
            // const scale = 2 / (1 + r2 + 1); // unused but kept as comment for reference

            const x = sphereRadius * (1 - r2) / (1 + r2 + 1);
            const y = sphereRadius * 2 * scaledY / (1 + r2 + 1);
            const z = sphereRadius * 2 * scaledX / (1 + r2 + 1);

            // Ensure point is on sphere surface
            const length = Math.sqrt(x * x + y * y + z * z);
            positions.push({
                x: (x / length) * sphereRadius,
                y: (y / length) * sphereRadius,
                z: (z / length) * sphereRadius
            });
        }

        return positions;
    }
}
