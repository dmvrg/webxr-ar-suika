import * as THREE from 'three';
import { fruitModels, fruitModelSizes, areModelsLoaded } from './ModelLoader.js';
import { FRUITS } from '../config/Fruits.js';
import { PERFORMANCE } from '../config/Constants.js';

/**
 * Create a fruit mesh (GLB model or fallback sphere)
 * @param {number} fruitType - Fruit type (0-10)
 * @param {number} radius - Desired radius
 * @param {number} scale - Optional scale multiplier (default: 1.0)
 * @returns {THREE.Object3D} Fruit mesh
 */
export function createFruitMesh(fruitType, radius, scale = 1.0) {
    const fruitConfig = FRUITS[fruitType];
    
    if (!fruitConfig) {
        console.error('Invalid fruit type:', fruitType);
        return createFallbackSphere(radius, 0xffffff);
    }
    
    // Use GLB model if loaded
    if (areModelsLoaded() && fruitModels[fruitType]) {
        const mesh = fruitModels[fruitType].clone();
        
        // Scale the model to match the desired radius
        const originalRadius = fruitModelSizes[fruitType];
        const scaleFactor = (radius / originalRadius) * scale;
        mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
        
        return mesh;
    }
    
    // Fallback: Create sphere with fruit color
    return createFallbackSphere(radius * scale, fruitConfig.color);
}

/**
 * Create a fallback sphere mesh
 * @param {number} radius - Sphere radius
 * @param {number} color - Sphere color
 * @returns {THREE.Mesh}
 */
function createFallbackSphere(radius, color) {
    const geo = new THREE.SphereGeometry(radius, PERFORMANCE.sphereSegments, PERFORMANCE.sphereSegments);
    const mat = new THREE.MeshPhongMaterial({ 
        color: color,
        shininess: 30,
        specular: 0x222222
    });
    return new THREE.Mesh(geo, mat);
}

/**
 * Dispose a fruit mesh properly (handles both GLB and sphere)
 * @param {THREE.Object3D} mesh - Mesh to dispose
 */
export function disposeFruitMesh(mesh) {
    if (!mesh) return;
    
    mesh.traverse((child) => {
        if (child.geometry) {
            child.geometry.dispose();
        }
        if (child.material) {
            if (Array.isArray(child.material)) {
                child.material.forEach(mat => mat.dispose());
            } else {
                child.material.dispose();
            }
        }
    });
}

/**
 * Calculate scale factor for a fruit mesh
 * @param {number} fruitType - Fruit type (0-10)
 * @param {number} desiredRadius - Desired radius
 * @returns {number} Scale factor
 */
export function calculateFruitScale(fruitType, desiredRadius) {
    if (!areModelsLoaded() || !fruitModels[fruitType]) {
        return 1.0;
    }
    
    const originalRadius = fruitModelSizes[fruitType];
    return desiredRadius / originalRadius;
}

