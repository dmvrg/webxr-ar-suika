import * as THREE from 'three';
import { getJointObjects } from './HandTracker.js';

const PINCH_THRESHOLD = 0.02; // Distance threshold for pinch detection

// Pinch state
let leftHandPinchActive = false;
let rightHandPinchActive = false;

// Button press state
let buttonPressedByLeftIndex = false;
let buttonPressedByRightIndex = false;

/**
 * Detect left hand pinch
 * @returns {boolean} True if pinching
 */
export function detectLeftPinch() {
    const { lThumbObj, lIndexObj, lPinchSphere } = getJointObjects();
    const distance = lIndexObj.position.distanceTo(lThumbObj.position);
    
    if (distance < PINCH_THRESHOLD) {
        // Keep pinch sphere hidden
        lPinchSphere.visible = false;
        
        const wasActive = leftHandPinchActive;
        leftHandPinchActive = true;
        
        return { 
            isPinching: true, 
            justStarted: !wasActive,
            position: lThumbObj.position.clone()
        };
    } else {
        lPinchSphere.visible = false;
        
        const wasActive = leftHandPinchActive;
        leftHandPinchActive = false;
        
        return { 
            isPinching: false, 
            justReleased: wasActive,
            position: null
        };
    }
}

/**
 * Detect right hand pinch
 * @returns {boolean} True if pinching
 */
export function detectRightPinch() {
    const { rThumbObj, rIndexObj, rPinchSphere } = getJointObjects();
    const distance = rIndexObj.position.distanceTo(rThumbObj.position);
    
    if (distance < PINCH_THRESHOLD) {
        // Keep pinch sphere hidden
        rPinchSphere.visible = false;
        
        const wasActive = rightHandPinchActive;
        rightHandPinchActive = true;
        
        return { 
            isPinching: true, 
            justStarted: !wasActive,
            position: rThumbObj.position.clone()
        };
    } else {
        rPinchSphere.visible = false;
        
        const wasActive = rightHandPinchActive;
        rightHandPinchActive = false;
        
        return { 
            isPinching: false, 
            justReleased: wasActive,
            position: null
        };
    }
}

/**
 * Check if index finger is pressing a button
 * @param {THREE.Mesh} buttonMesh - Button mesh
 * @param {THREE.Vector3} buttonWorldPos - Button world position
 * @param {number} buttonWidth - Button width
 * @param {number} buttonHeight - Button height
 * @param {number} buttonDepth - Touch detection depth
 * @returns {Object} {leftPressed, rightPressed}
 */
export function detectButtonPress(buttonMesh, buttonWorldPos, buttonWidth, buttonHeight, buttonDepth = 0.03) {
    const { lIndexObj, rIndexObj } = getJointObjects();
    
    // Get button's forward direction (normal to the button face)
    const buttonNormal = new THREE.Vector3(0, 0, 1);
    buttonNormal.applyQuaternion(buttonMesh.getWorldQuaternion(new THREE.Quaternion()));
    
    // Helper function to check if finger is touching button
    function isFingerTouchingButton(fingerPos) {
        // Calculate vector from button center to finger
        const toFinger = fingerPos.clone().sub(buttonWorldPos);
        
        // Project onto button's local space
        const buttonRight = new THREE.Vector3(1, 0, 0);
        buttonRight.applyQuaternion(buttonMesh.getWorldQuaternion(new THREE.Quaternion()));
        const buttonUp = new THREE.Vector3(0, 1, 0);
        buttonUp.applyQuaternion(buttonMesh.getWorldQuaternion(new THREE.Quaternion()));
        
        const localX = toFinger.dot(buttonRight);
        const localY = toFinger.dot(buttonUp);
        const localZ = toFinger.dot(buttonNormal);
        
        // Check if finger is within button bounds
        const withinX = Math.abs(localX) <= buttonWidth / 2;
        const withinY = Math.abs(localY) <= buttonHeight / 2;
        const withinZ = localZ >= -0.005 && localZ <= buttonDepth;
        
        return withinX && withinY && withinZ;
    }
    
    // Check left index finger
    const leftIndexWorldPos = lIndexObj.position.clone();
    const leftIndexTouching = isFingerTouchingButton(leftIndexWorldPos);
    
    // Check right index finger
    const rightIndexWorldPos = rIndexObj.position.clone();
    const rightIndexTouching = isFingerTouchingButton(rightIndexWorldPos);
    
    // Track state changes
    const leftJustPressed = leftIndexTouching && !buttonPressedByLeftIndex;
    const leftJustReleased = !leftIndexTouching && buttonPressedByLeftIndex;
    const rightJustPressed = rightIndexTouching && !buttonPressedByRightIndex;
    const rightJustReleased = !rightIndexTouching && buttonPressedByRightIndex;
    
    buttonPressedByLeftIndex = leftIndexTouching;
    buttonPressedByRightIndex = rightIndexTouching;
    
    return {
        leftPressed: leftIndexTouching,
        rightPressed: rightIndexTouching,
        leftJustPressed,
        leftJustReleased,
        rightJustPressed,
        rightJustReleased,
        anyPressed: leftIndexTouching || rightIndexTouching
    };
}

/**
 * Reset gesture state
 */
export function resetGestureState() {
    leftHandPinchActive = false;
    rightHandPinchActive = false;
    buttonPressedByLeftIndex = false;
    buttonPressedByRightIndex = false;
}

