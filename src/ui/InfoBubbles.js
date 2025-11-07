import * as THREE from 'three';
import { createFruitMesh, disposeFruitMesh } from '../models/FruitFactory.js';
import { FRUITS } from '../config/Fruits.js';
import { UI_CONFIG, PERFORMANCE } from '../config/Constants.js';
import { createTextMesh, updateTextMesh, isFontLoaded } from './TextRenderer.js';

let infoBubble0 = null; // Score bubble
let infoBubble1 = null; // Next fruit bubble
let infoBubble2 = null; // Timer bubble

let scoreText = null;
let timeText = null;
let nextFruitPreview = null;

let lastDisplayedScore = -1;
let lastDisplayedTime = '';

/**
 * Create all info bubbles (score, next fruit, timer)
 * @param {THREE.Object3D} containerModel - Container model to attach to
 */
export function createInfoBubbles(containerModel) {
    const sphereGeometry = new THREE.SphereGeometry(
        UI_CONFIG.infoBubbleRadius, 
        PERFORMANCE.sphereSegments, 
        PERFORMANCE.sphereSegments
    );
    const sphereMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.15
    });
    
    // Create bubbles
    infoBubble0 = new THREE.Mesh(sphereGeometry, sphereMaterial.clone());
    infoBubble0.position.set(
        UI_CONFIG.infoBubble0Position.x,
        UI_CONFIG.infoBubble0Position.y,
        UI_CONFIG.infoBubble0Position.z
    );
    containerModel.add(infoBubble0);
    
    infoBubble1 = new THREE.Mesh(sphereGeometry, sphereMaterial.clone());
    infoBubble1.position.set(
        UI_CONFIG.infoBubble1Position.x,
        UI_CONFIG.infoBubble1Position.y,
        UI_CONFIG.infoBubble1Position.z
    );
    containerModel.add(infoBubble1);
    
    infoBubble2 = new THREE.Mesh(sphereGeometry, sphereMaterial.clone());
    infoBubble2.position.set(
        UI_CONFIG.infoBubble2Position.x,
        UI_CONFIG.infoBubble2Position.y,
        UI_CONFIG.infoBubble2Position.z
    );
    containerModel.add(infoBubble2);
    
    // Create text if font is loaded
    if (isFontLoaded()) {
        createBubbleTexts();
    }
    
    console.log('Info bubbles created');
}

/**
 * Create text meshes for bubbles (call after font is loaded)
 */
function createBubbleTexts() {
    // Score text (bubble 0)
    scoreText = createTextMesh('0', UI_CONFIG.scoreFontSize, 0xFFF000, true);
    if (scoreText) {
        scoreText.position.set(0, 0, 0);
        infoBubble0.add(scoreText);
    }
    
    // Timer text (bubble 2)
    timeText = createTextMesh('00:00', UI_CONFIG.timeFontSize, 0xFFF000, false);
    if (timeText) {
        // Position manually since it's not centered
        const bbox = timeText.geometry.boundingBox;
        const textWidth = bbox.max.x - bbox.min.x;
        const textHeight = bbox.max.y - bbox.min.y;
        timeText.position.set(-textWidth / 2, -textHeight / 2, 0);
        infoBubble2.add(timeText);
    }
}

/**
 * Initialize bubble texts after font is loaded
 */
export function initBubbleTexts() {
    if (isFontLoaded() && !scoreText && !timeText) {
        createBubbleTexts();
    }
}

/**
 * Update next fruit preview in bubble
 * @param {number} nextFruitType - Next fruit type to display
 */
export function updateNextFruitPreview(nextFruitType) {
    if (!infoBubble1) return;
    
    // Remove old preview
    if (nextFruitPreview) {
        infoBubble1.remove(nextFruitPreview);
        disposeFruitMesh(nextFruitPreview);
    }
    
    // Create new preview
    const nextFruitRadius = FRUITS[nextFruitType].radius;
    nextFruitPreview = createFruitMesh(nextFruitType, nextFruitRadius, 0.8); // 80% size
    nextFruitPreview.position.set(0, 0, 0);
    infoBubble1.add(nextFruitPreview);
}

/**
 * Update score display
 * @param {number} newScore - New score value
 */
export function updateScoreDisplay(newScore) {
    if (!scoreText || !isFontLoaded()) return;
    
    // Only update if score changed
    if (newScore === lastDisplayedScore) return;
    lastDisplayedScore = newScore;
    
    updateTextMesh(scoreText, String(newScore), UI_CONFIG.scoreFontSize, true);
    scoreText.position.set(0, 0, 0);
}

/**
 * Update time display
 * @param {number} elapsedSeconds - Elapsed time in seconds
 */
export function updateTimeDisplay(elapsedSeconds) {
    if (!timeText || !isFontLoaded()) return;
    
    // Convert to MM:SS format
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    // Only update if changed
    if (timeString === lastDisplayedTime) return;
    lastDisplayedTime = timeString;
    
    const bbox = updateTextMesh(timeText, timeString, UI_CONFIG.timeFontSize, false);
    
    // Reposition text
    if (bbox) {
        const textWidth = bbox.max.x - bbox.min.x;
        const textHeight = bbox.max.y - bbox.min.y;
        timeText.position.set(-textWidth / 2, -textHeight / 2, 0);
    }
}

/**
 * Reset score display cache
 */
export function resetScoreCache() {
    lastDisplayedScore = -1;
}

/**
 * Reset time display cache
 */
export function resetTimeCache() {
    lastDisplayedTime = '';
}

/**
 * Apply material to info bubbles
 * @param {THREE.Material} material - Material to apply
 */
export function applyMaterialToInfoBubbles(material) {
    if (infoBubble0) infoBubble0.material = material.clone();
    if (infoBubble1) infoBubble1.material = material.clone();
    if (infoBubble2) infoBubble2.material = material.clone();
    console.log('Material applied to info bubbles');
}

/**
 * Get info bubble references
 * @returns {Object} Bubble references
 */
export function getInfoBubbles() {
    return { infoBubble0, infoBubble1, infoBubble2 };
}

/**
 * Get text mesh references
 * @returns {Object} Text mesh references
 */
export function getTextMeshes() {
    return { scoreText, timeText };
}

