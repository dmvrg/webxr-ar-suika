import * as THREE from 'three';
import { PERFORMANCE } from '../config/Constants.js';

let scene = null;
let camera = null;
let renderer = null;
let canvas = null;

/**
 * Initialize scene, camera, and renderer
 * @returns {Object} {scene, camera, renderer}
 */
export function initScene() {
    // Get canvas
    canvas = document.querySelector('canvas.webgl');
    
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x505050);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(
        50, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        50
    );
    camera.position.set(0, 1.6, 3);
    scene.add(camera);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true 
    });
    // Cap pixel ratio for mobile VR performance
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, PERFORMANCE.maxPixelRatio));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    
    // Setup lighting
    setupLighting();
    
    console.log('Scene initialized');
    
    return { scene, camera, renderer };
}

/**
 * Setup scene lighting
 */
function setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);
    
    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(2, 3, 5);
    scene.add(directionalLight);
    
    console.log('Lighting setup complete');
}

/**
 * Handle window resize
 */
export function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Get scene reference
 * @returns {THREE.Scene}
 */
export function getScene() {
    return scene;
}

/**
 * Get camera reference
 * @returns {THREE.PerspectiveCamera}
 */
export function getCamera() {
    return camera;
}

/**
 * Get renderer reference
 * @returns {THREE.WebGLRenderer}
 */
export function getRenderer() {
    return renderer;
}

/**
 * Get canvas reference
 * @returns {HTMLCanvasElement}
 */
export function getCanvas() {
    return canvas;
}

