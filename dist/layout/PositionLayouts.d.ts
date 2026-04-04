/**
 * PositionLayouts - Position calculation for all layout types.
 * Port of position-layouts.js - all position generation functions.
 */
import { Vec3, PathType, SpacingMode, GridMode, HexMode, SpiralConfig, SpiralAxis } from './types';
export declare class PositionLayouts {
    /**
     * Main entry point: get layout positions for any path type.
     */
    static getLayoutPositions(pathType: PathType, objectCount: number, spacing: number, spacingMode: SpacingMode, time: number, sphereU: number, sphereV: number, planeX: number, planeZ: number, gridMode: GridMode, gridRows: number, gridCols: number, hexMode: HexMode, hexRings: number, spiralConfig?: SpiralConfig | null, lineDirection?: Vec3 | null, spiralAxis?: Vec3 | SpiralAxis | null, radius?: number): Vec3[];
    /**
     * Internal spiral t-increment finder used by margin-mode positioning.
     * Matches the ModernLayouters.findSpiralTIncrement from the source.
     */
    private static _findSpiralTIncrement;
    private static _getSpiralPosition;
    static getPlaneGridPositions(objectCount: number, spacing: number, spacingMode: SpacingMode, gridMode: GridMode, gridRows: number, gridCols: number): Vec3[];
    static getPlaneHexPositions(objectCount: number, spacing: number, spacingMode: SpacingMode, hexMode: HexMode, hexRings: number): Vec3[];
    static getCylinderGridPositions(objectCount: number, spacing: number, spacingMode: SpacingMode): Vec3[];
    static getSphereGridPositions(objectCount: number, spacing: number, spacingMode: SpacingMode, radius?: number): Vec3[];
    static getSphereHexPositions(objectCount: number, spacing: number, spacingMode: SpacingMode, radius?: number): Vec3[];
    static getSphereHexRingPositions(objectCount: number, spacing: number, spacingMode: SpacingMode, radius?: number): Vec3[];
    static getSphereHexHoneycombPositions(objectCount: number, spacing: number, spacingMode: SpacingMode, radius?: number): Vec3[];
}
