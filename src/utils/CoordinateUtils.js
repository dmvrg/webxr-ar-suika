import * as THREE from 'three';

/**
 * Convert world coordinates to container local coordinates
 * @param {THREE.Vector3} worldPosition - Position in world space
 * @param {THREE.Object3D} containerModel - Container mesh reference
 * @returns {THREE.Vector3} Position in container local space
 */
export function worldToContainer(worldPosition, containerModel) {
    const inv = new THREE.Matrix4().copy(containerModel.matrixWorld).invert();
    return worldPosition.clone().applyMatrix4(inv);
}

/**
 * Convert container local coordinates to world coordinates
 * @param {THREE.Vector3} localPosition - Position in container local space
 * @param {THREE.Object3D} containerModel - Container mesh reference
 * @returns {THREE.Vector3} Position in world space
 */
export function containerToWorld(localPosition, containerModel) {
    return localPosition.clone().applyMatrix4(containerModel.matrixWorld);
}

/**
 * Calculate container bounds (half widths)
 * @param {Object} containerConfig - Container configuration object
 * @returns {Object} Object with halfW, halfH, halfD
 */
export function getContainerBounds(containerConfig) {
    return {
        halfW: containerConfig.width * 0.5,
        halfH: containerConfig.height * 0.5,
        halfD: containerConfig.depth * 0.5
    };
}

