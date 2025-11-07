import * as THREE from 'three';
import { createFruitMesh, disposeFruitMesh } from '../models/FruitFactory.js';
import { FRUITS } from '../config/Fruits.js';
import { CONTAINER_CONFIG, UI_CONFIG } from '../config/Constants.js';
import { getContainerHalfDimensions } from '../models/ContainerBuilder.js';

let dropSphere = null;
let verticalLine = null;
let currentFruitType = 0;
let currentFruitRadius = FRUITS[0].radius;
let containerModel = null;

// Track last hand positions for delta calculation
let lastLeftHandX = 0;
let lastRightHandX = 0;

/**
 * Initialize drop controller
 * @param {THREE.Object3D} container - Container model reference
 * @param {number} initialFruitType - Initial fruit type
 */
export function initDropController(container, initialFruitType = 0) {
    containerModel = container;
    currentFruitType = initialFruitType;
    currentFruitRadius = FRUITS[initialFruitType].radius;
    
    // Create drop sphere
    dropSphere = createDropSphere();
    containerModel.add(dropSphere);
    
    // Create vertical guide line
    verticalLine = createVerticalLine();
    containerModel.add(verticalLine);
    
    console.log('Drop controller initialized');
}

/**
 * Create drop sphere mesh
 * @returns {THREE.Object3D}
 */
function createDropSphere() {
    const mesh = createFruitMesh(currentFruitType, currentFruitRadius);
    
    // Position above container
    const dropSphereY = (CONTAINER_CONFIG.height * 0.5) + 0.05;
    mesh.position.set(0, dropSphereY, 0);
    
    return mesh;
}

/**
 * Create vertical guide line
 * @returns {THREE.Mesh}
 */
function createVerticalLine() {
    const lineGeometry = new THREE.PlaneGeometry(
        UI_CONFIG.verticalLineWidth, 
        UI_CONFIG.verticalLineHeight
    );
    const lineMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: UI_CONFIG.verticalLineOpacity
    });
    const line = new THREE.Mesh(lineGeometry, lineMaterial);
    
    // Position line to follow dropSphere
    const dropSphereY = (CONTAINER_CONFIG.height * 0.5) + 0.05;
    line.position.set(0, dropSphereY - UI_CONFIG.verticalLineHeight / 2, 0);
    
    return line;
}

/**
 * Update drop sphere with new fruit type
 * @param {number} fruitType - New fruit type
 */
export function updateDropSphere(fruitType) {
    if (!dropSphere) return;
    
    currentFruitType = fruitType;
    currentFruitRadius = FRUITS[fruitType].radius;
    
    // Store current state
    const wasVisible = dropSphere.visible;
    const currentX = dropSphere.position.x;
    const currentY = dropSphere.position.y;
    
    // Remove old drop sphere
    containerModel.remove(dropSphere);
    disposeFruitMesh(dropSphere);
    
    // Create new drop sphere
    dropSphere = createDropSphere();
    dropSphere.visible = wasVisible;
    dropSphere.position.set(currentX, currentY, 0);
    
    containerModel.add(dropSphere);
}

/**
 * Move drop sphere horizontally
 * @param {number} deltaX - X movement delta
 * @param {number} movementSpeed - Movement speed multiplier
 */
export function moveDropSphere(deltaX, movementSpeed = 1.0) {
    if (!dropSphere) return;
    
    const { halfW } = getContainerHalfDimensions();
    const maxX = halfW - currentFruitRadius;
    const newX = dropSphere.position.x + deltaX * movementSpeed;
    dropSphere.position.x = THREE.MathUtils.clamp(newX, -maxX, maxX);
    
    // Update vertical line position
    if (verticalLine) {
        verticalLine.position.x = dropSphere.position.x;
    }
}

/**
 * Handle pinch movement for drop sphere
 * @param {boolean} isLeftHand - Whether this is left hand
 * @param {THREE.Vector3} handPosition - Current hand position
 * @param {number} movementSpeed - Movement speed multiplier
 */
export function handlePinchMovement(isLeftHand, handPosition, movementSpeed = 1.0) {
    const currentHandX = handPosition.x;
    
    if (isLeftHand) {
        const deltaX = currentHandX - lastLeftHandX;
        if (Math.abs(deltaX) > 0.001) {
            moveDropSphere(deltaX, movementSpeed);
        }
        lastLeftHandX = currentHandX;
    } else {
        const deltaX = currentHandX - lastRightHandX;
        if (Math.abs(deltaX) > 0.001) {
            moveDropSphere(deltaX, movementSpeed);
        }
        lastRightHandX = currentHandX;
    }
}

/**
 * Reset hand position tracking (when pinch starts)
 * @param {boolean} isLeftHand - Whether this is left hand
 * @param {THREE.Vector3} handPosition - Current hand position
 */
export function resetHandTracking(isLeftHand, handPosition) {
    if (isLeftHand) {
        lastLeftHandX = handPosition.x;
    } else {
        lastRightHandX = handPosition.x;
    }
}

/**
 * Get drop sphere world position
 * @returns {THREE.Vector3} World position
 */
export function getDropSpherePosition() {
    if (!dropSphere) return new THREE.Vector3();
    
    const worldPos = new THREE.Vector3();
    dropSphere.getWorldPosition(worldPos);
    return worldPos;
}

/**
 * Hide drop sphere and vertical line
 */
export function hideDropVisuals() {
    if (dropSphere) dropSphere.visible = false;
    if (verticalLine) verticalLine.visible = false;
}

/**
 * Show drop sphere and vertical line with animation
 * @param {Function} gsap - GSAP instance
 */
export function showDropVisuals(gsap) {
    if (!dropSphere || !verticalLine) return;
    
    // Store target scale
    const targetScale = dropSphere.scale.x;
    
    // Set scale to 0
    dropSphere.scale.set(0, 0, 0);
    verticalLine.scale.set(0, 0, 0);
    
    // Make visible
    dropSphere.visible = true;
    verticalLine.visible = true;
    
    // Animate scale
    gsap.to(dropSphere.scale, 
        { x: targetScale, y: targetScale, z: targetScale, duration: 0.2, ease: "power2.out" }
    );
    gsap.to(verticalLine.scale, 
        { x: 1, y: 1, z: 1, duration: 0.2, ease: "power2.out" }
    );
}

/**
 * Get current fruit type
 * @returns {number} Current fruit type
 */
export function getCurrentFruitType() {
    return currentFruitType;
}

/**
 * Get current fruit radius
 * @returns {number} Current fruit radius
 */
export function getCurrentFruitRadius() {
    return currentFruitRadius;
}

/**
 * Get drop sphere reference
 * @returns {THREE.Object3D} Drop sphere mesh
 */
export function getDropSphere() {
    return dropSphere;
}

/**
 * Get vertical line reference
 * @returns {THREE.Mesh} Vertical line mesh
 */
export function getVerticalLine() {
    return verticalLine;
}

/**
 * Update vertical line to follow drop sphere (call every frame)
 */
export function updateDropVisualsPosition() {
    if (verticalLine && dropSphere) {
        // Update X position to match dropSphere
        verticalLine.position.x = dropSphere.position.x;
        
        // Sync visibility with dropSphere
        verticalLine.visible = dropSphere.visible;
    }
}

