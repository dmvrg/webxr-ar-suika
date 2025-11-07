import * as THREE from 'three';
import { containerGLB } from './ModelLoader.js';
import { CONTAINER_CONFIG, PERFORMANCE } from '../config/Constants.js';

let containerModel = null;

/**
 * Create the container mesh (invisible wrapper with GLB child)
 * @returns {THREE.Mesh} Container mesh
 */
export function createContainer() {
    // Create invisible container mesh
    const containerGeometry = new THREE.BoxGeometry(0, 0, 0);
    const containerMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.0
    });
    containerModel = new THREE.Mesh(containerGeometry, containerMaterial);
    
    // Add GLB child if loaded
    if (containerGLB) {
        containerGLB.scale.set(
            PERFORMANCE.containerModelScale, 
            PERFORMANCE.containerModelScale, 
            PERFORMANCE.containerModelScale
        );
        containerModel.add(containerGLB);
    }
    
    return containerModel;
}

/**
 * Get the container model instance
 * @returns {THREE.Mesh} Container mesh
 */
export function getContainer() {
    return containerModel;
}

/**
 * Apply material to container GLB
 * @param {THREE.Material} material - Material to apply
 */
export function applyMaterialToContainer(material) {
    if (!containerGLB) {
        console.warn('Container GLB not loaded yet');
        return;
    }
    
    containerGLB.traverse((child) => {
        if (child.isMesh) {
            child.material = material;
        }
    });
    
    console.log('Material applied to container');
}

/**
 * Create base composition (wrapper for container)
 * @returns {THREE.Mesh} Base composition
 */
export function createBaseComposition() {
    const tempGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
    const tempMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.0,
        depthTest: false,
        depthWrite: false
    });
    const baseComposition = new THREE.Mesh(tempGeo, tempMat);
    baseComposition.scale.set(1, 1, 1);
    
    return baseComposition;
}

/**
 * Get container half dimensions
 * @returns {Object} {halfW, halfH, halfD}
 */
export function getContainerHalfDimensions() {
    return {
        halfW: CONTAINER_CONFIG.width * 0.5,
        halfH: CONTAINER_CONFIG.height * 0.5,
        halfD: CONTAINER_CONFIG.depth * 0.5
    };
}

