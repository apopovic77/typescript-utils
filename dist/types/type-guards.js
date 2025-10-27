export function isLerpable(obj) {
    return obj && typeof obj.lerp === 'function';
}
export function isSlerpable(obj) {
    return obj && typeof obj.slerp === 'function';
}
export function isEquatable(obj) {
    return obj && typeof obj.equals === 'function';
}
