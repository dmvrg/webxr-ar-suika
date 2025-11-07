import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { MODEL_PATHS } from '../config/Constants.js';
import { getTotalFruitTypes } from '../config/Fruits.js';

const gltfLoader = new GLTFLoader();

// Store loaded models and their sizes
export const fruitModels = new Array(getTotalFruitTypes());
export const fruitModelSizes = new Array(getTotalFruitTypes());
export let containerGLB = null;
export let cloudModel = null;

let modelsLoadedCount = 0;
let totalModels = getTotalFruitTypes();
let onAllModelsLoadedCallback = null;

/**
 * Check if all models are loaded
 * @returns {boolean}
 */
export function areModelsLoaded() {
    return modelsLoadedCount === totalModels;
}

/**
 * Load all fruit models (0-10)
 * @param {Function} onProgress - Progress callback (loadedCount, totalCount)
 * @returns {Promise<void>}
 */
export function loadAllFruitModels(onProgress = null) {
    return new Promise((resolve) => {
        console.log('Loading fruit models...');
        
        const totalFruits = getTotalFruitTypes();
        
        for (let i = 0; i < totalFruits; i++) {
            gltfLoader.load(
                MODEL_PATHS.fruits(i),
                (gltf) => {
                    const model = gltf.scene;
                    
                    // Center the model's bounding box to origin
                    const box = new THREE.Box3().setFromObject(model);
                    const center = box.getCenter(new THREE.Vector3());
                    model.position.sub(center);
                    
                    // Calculate the bounding sphere radius
                    const size = box.getSize(new THREE.Vector3());
                    const maxDimension = Math.max(size.x, size.y, size.z);
                    fruitModelSizes[i] = maxDimension / 2;
                    
                    fruitModels[i] = model;
                    modelsLoadedCount++;
                    
                    console.log(`Loaded fruit_${i}.glb (${modelsLoadedCount}/${totalFruits}) - original radius: ${fruitModelSizes[i].toFixed(3)}m`);
                    
                    if (onProgress) {
                        onProgress(modelsLoadedCount, totalFruits);
                    }
                    
                    if (modelsLoadedCount === totalFruits) {
                        console.log('All fruit models loaded!');
                        if (onAllModelsLoadedCallback) {
                            onAllModelsLoadedCallback();
                        }
                        resolve();
                    }
                },
                undefined,
                (error) => {
                    console.error(`Error loading fruit_${i}.glb:`, error);
                }
            );
        }
    });
}

/**
 * Load container GLB model
 * @returns {Promise<THREE.Group>}
 */
export function loadContainerModel() {
    return new Promise((resolve, reject) => {
        gltfLoader.load(
            MODEL_PATHS.container,
            (gltf) => {
                containerGLB = gltf.scene;
                
                // Center the model at origin
                const box = new THREE.Box3().setFromObject(containerGLB);
                const center = box.getCenter(new THREE.Vector3());
                containerGLB.position.sub(center);
                containerGLB.position.set(0, 0, 0);
                
                console.log('Suika container GLB loaded successfully!');
                resolve(containerGLB);
            },
            undefined,
            (error) => {
                console.error('Error loading suika-container.glb:', error);
                reject(error);
            }
        );
    });
}

/**
 * Load cloud GLB model
 * @returns {Promise<THREE.Group>}
 */
export function loadCloudModel() {
    return new Promise((resolve, reject) => {
        gltfLoader.load(
            MODEL_PATHS.cloud,
            (gltf) => {
                cloudModel = gltf.scene;
                console.log('Cloud model loaded successfully');
                resolve(cloudModel);
            },
            undefined,
            (error) => {
                console.error('Error loading cloud model:', error);
                reject(error);
            }
        );
    });
}

/**
 * Set callback for when all models are loaded
 * @param {Function} callback - Callback function
 */
export function onAllModelsLoaded(callback) {
    onAllModelsLoadedCallback = callback;
    
    // If already loaded, call immediately
    if (areModelsLoaded()) {
        callback();
    }
}

/**
 * Load all models (fruits, container, cloud)
 * @returns {Promise<void>}
 */
export async function loadAllModels() {
    console.log('Starting to load all models...');
    
    await Promise.all([
        loadAllFruitModels(),
        loadContainerModel(),
        loadCloudModel()
    ]);
    
    console.log('All models loaded successfully!');
}

