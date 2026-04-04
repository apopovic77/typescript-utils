/**
 * Layout Module - ModernLayouters system ported from 3dPresenter2.
 *
 * Provides pure, Three.js-independent layout algorithms for positioning
 * and orienting objects in 3D space using various patterns:
 * line, circle, spiral, plane grid/hex, sphere grid/hex, cylinder, etc.
 *
 * Usage:
 * ```typescript
 * import { Layouters, LayoutConfig, LayoutTransform } from '@arkturian/typescript-utils';
 *
 * const transforms = Layouters.circle({
 *     objectCount: 10,
 *     radius: 5,
 *     spacingMode: 'distribute',
 *     orientation: 'aligned',
 *     upMode: 'world'
 * });
 * ```
 */
// High-level API
export { Layouters } from './Layouters';
// Lower-level building blocks (for advanced use)
export { PositionLayouts } from './PositionLayouts';
export { PathLayouts } from './PathLayouts';
export { Orientation } from './Orientation';
export { LayoutUtils } from './LayoutUtils';
