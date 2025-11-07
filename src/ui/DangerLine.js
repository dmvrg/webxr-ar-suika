import * as THREE from 'three';
import { CONTAINER_CONFIG, UI_CONFIG } from '../config/Constants.js';

let dangerLineMesh = null;

/**
 * Create danger line visualization (hidden by default)
 * @param {THREE.Object3D} containerModel - Container model to attach to
 * @returns {THREE.Mesh} Danger line mesh
 */
export function createDangerLine(containerModel) {
    const dangerLineHeight = -CONTAINER_CONFIG.height * 0.5 + (CONTAINER_CONFIG.height * 0.94);
    
    const dangerLineGeometry = new THREE.PlaneGeometry(
        CONTAINER_CONFIG.width * 0.95, 
        0.002
    );
    const dangerLineMaterial = new THREE.MeshBasicMaterial({ 
        color: UI_CONFIG.dangerLineColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: UI_CONFIG.dangerLineOpacity
    });
    
    dangerLineMesh = new THREE.Mesh(dangerLineGeometry, dangerLineMaterial);
    dangerLineMesh.position.set(0, dangerLineHeight, 0);
    dangerLineMesh.visible = false; // Hidden by default
    
    containerModel.add(dangerLineMesh);
    
    console.log('Danger line created at Y:', dangerLineHeight);
    
    return dangerLineMesh;
}

/**
 * Show danger line
 */
export function showDangerLine() {
    if (dangerLineMesh) {
        dangerLineMesh.visible = true;
    }
}

/**
 * Hide danger line
 */
export function hideDangerLine() {
    if (dangerLineMesh) {
        dangerLineMesh.visible = false;
    }
}

/**
 * Get danger line mesh reference
 * @returns {THREE.Mesh} Danger line mesh
 */
export function getDangerLine() {
    return dangerLineMesh;
}

