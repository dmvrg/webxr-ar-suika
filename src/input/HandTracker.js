import * as THREE from 'three';
import { OculusHandModel } from 'three/examples/jsm/webxr/OculusHandModel.js';

// Hand references
let hand1 = null;
let hand2 = null;

// Joint tracking objects (invisible)
let lThumbObj = null;
let lIndexObj = null;
let rThumbObj = null;
let rIndexObj = null;

// Pinch visualization spheres
let lPinchSphere = null;
let rPinchSphere = null;

/**
 * Setup hand tracking with Oculus hand models
 * @param {THREE.WebXRManager} xr - XR manager from renderer
 * @param {THREE.Scene} scene - Scene to add hands to
 */
export function setupHands(xr, scene) {
    // Create hand models
    hand1 = xr.getHand(0);
    hand1.add(new OculusHandModel(hand1));
    scene.add(hand1);

    hand2 = xr.getHand(1);
    hand2.add(new OculusHandModel(hand2));
    scene.add(hand2);
    
    // Create hands group
    const handsGroup = new THREE.Group();
    handsGroup.add(hand1, hand2);
    scene.add(handsGroup);
    handsGroup.visible = false;
    
    // Create joint tracking objects (invisible)
    const sphere = new THREE.SphereGeometry(0, 0, 0);
    const defaultMat = new THREE.MeshBasicMaterial({ 
        color: 0xff0000, 
        opacity: 0,
        transparent: true 
    });

    lThumbObj = new THREE.Mesh(sphere, defaultMat);
    lIndexObj = new THREE.Mesh(sphere, defaultMat);
    rThumbObj = new THREE.Mesh(sphere, defaultMat);
    rIndexObj = new THREE.Mesh(sphere, defaultMat);

    scene.add(lThumbObj);
    scene.add(lIndexObj);
    scene.add(rThumbObj);
    scene.add(rIndexObj);
    
    // Create pinch visualization spheres
    const sphere2 = new THREE.SphereGeometry(0.006, 12, 12);
    const defaultMat2 = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const greenMat2 = new THREE.MeshLambertMaterial({ color: 0x00ff00 });

    lPinchSphere = new THREE.Mesh(sphere2, defaultMat2);
    rPinchSphere = new THREE.Mesh(sphere2, greenMat2);
    scene.add(lPinchSphere);
    scene.add(rPinchSphere);
    lPinchSphere.visible = false;
    rPinchSphere.visible = false;
    
    console.log('Hand tracking initialized');
}

/**
 * Update hand joint positions (call every frame)
 */
export function updateHandJoints() {
    // Left Hand Joint References
    if (hand1 && hand1.joints && hand1.joints['thumb-tip']) {
        lThumbObj.position.copy(hand1.joints['thumb-tip'].position);
        lThumbObj.rotation.copy(hand1.joints['thumb-tip'].rotation);
    }

    if (hand1 && hand1.joints && hand1.joints['index-finger-tip']) {
        lIndexObj.position.copy(hand1.joints['index-finger-tip'].position);
        lIndexObj.rotation.copy(hand1.joints['index-finger-tip'].rotation);
    }

    // Right Hand Joint References
    if (hand2 && hand2.joints && hand2.joints['thumb-tip']) {
        rThumbObj.position.copy(hand2.joints['thumb-tip'].position);
        rThumbObj.rotation.copy(hand2.joints['thumb-tip'].rotation);
    }

    if (hand2 && hand2.joints && hand2.joints['index-finger-tip']) {
        rIndexObj.position.copy(hand2.joints['index-finger-tip'].position);
        rIndexObj.rotation.copy(hand2.joints['index-finger-tip'].rotation);
    }
}

/**
 * Get joint objects
 * @returns {Object} Joint objects
 */
export function getJointObjects() {
    return {
        lThumbObj,
        lIndexObj,
        rThumbObj,
        rIndexObj,
        lPinchSphere,
        rPinchSphere
    };
}

/**
 * Get hand references
 * @returns {Object} Hand references
 */
export function getHands() {
    return { hand1, hand2 };
}

