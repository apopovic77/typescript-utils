export { Vector3 } from './Vector3';
export { Quaternion } from './Quaternion';
export { Color } from './Color';
import { Vector3 } from './Vector3';
export * from './enums';
export type LabelMode = 'always' | 'hover' | 'selected' | 'never';
export type CameraType = 'fixed_offset' | 'smooth_turn' | 'direct_axis';
export interface LabelData {
    text: string;
    meshPoint: Vector3;
    worldOffset: Vector3;
    mode: LabelMode;
    fontSize: number;
    color: string;
    backgroundColor: string;
    showConnector: boolean;
}
export interface CameraSettings {
    fov: number;
    near: number;
    far: number;
    position: Vector3;
    target: Vector3;
    up: Vector3;
}
export interface AnimationState {
    isPlaying: boolean;
    startTime: number;
    duration: number;
    loop: boolean;
}
export interface SceneSettings {
    backgroundColor: string;
    ambientLightColor: string;
    ambientLightIntensity: number;
    directionalLightColor: string;
    directionalLightIntensity: number;
    directionalLightPosition: Vector3;
}
export type SceneEventType = 'click' | 'hover' | 'select' | 'deselect' | 'drag' | 'drop';
export interface SceneEvent {
    type: SceneEventType;
    target: any;
    position: Vector3;
    screenPosition: {
        x: number;
        y: number;
    };
    timestamp: number;
}
export type UUID = string;
export type Timestamp = number;
export * from './easing';
export interface InterpolatedPropertyConfig<T> {
    value: T;
    duration: number;
    easing?: (t: number) => number;
}
export * from './Lerpable';
export * from './Slerpable';
export * from './Vector2';
export * from './Vector2';
export * from './Vector3';
export * from './Quaternion';
export * from './Color';
export * from './easing';
export * from './Lerpable';
export * from './BoundingBox';
export * from './type-guards';
