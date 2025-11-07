import * as THREE from 'three';
import { UI_CONFIG, MODEL_PATHS } from '../config/Constants.js';
import { createTextMesh, updateTextMesh, isFontLoaded } from './TextRenderer.js';

let endPanel = null;
let buttonPlaceholder = null;
let gameOverText = null;
let endPanelScoreText = null;
let scoreLabelText = null;

/**
 * Create game over panel with button
 * @param {THREE.Scene} scene - Scene to add panel to
 * @returns {THREE.Mesh} End panel mesh
 */
export function createGameOverPanel(scene) {
    const textureLoader = new THREE.TextureLoader();
    
    // Load textures
    const endPanelTexture = textureLoader.load(MODEL_PATHS.panelTexture);
    const buttonTexture = textureLoader.load(MODEL_PATHS.buttonTexture);
    
    // Create end panel
    const endPanelWidth = UI_CONFIG.endPanelWidth;
    const endPanelHeight = endPanelWidth * UI_CONFIG.endPanelAspectRatio;
    const endPanelGeometry = new THREE.PlaneGeometry(endPanelWidth, endPanelHeight);
    const endPanelMaterial = new THREE.MeshBasicMaterial({ 
        map: endPanelTexture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1.0
    });
    
    endPanel = new THREE.Mesh(endPanelGeometry, endPanelMaterial);
    endPanel.position.set(0, 0.05, 1.0);
    endPanel.scale.set(0, 0, 0); // Initially hidden
    endPanel.renderOrder = 1;
    scene.add(endPanel);
    
    // Create button
    const buttonWidth = UI_CONFIG.buttonWidth;
    const buttonHeight = buttonWidth * UI_CONFIG.buttonAspectRatio;
    const buttonGeometry = new THREE.PlaneGeometry(buttonWidth, buttonHeight);
    const buttonMaterial = new THREE.MeshBasicMaterial({ 
        map: buttonTexture,
        side: THREE.DoubleSide,
        transparent: true,
        depthTest: false,
        depthWrite: false
    });
    
    buttonPlaceholder = new THREE.Mesh(buttonGeometry, buttonMaterial);
    buttonPlaceholder.position.set(0, -0.082, 0.02);
    buttonPlaceholder.renderOrder = 2;
    endPanel.add(buttonPlaceholder);
    
    // Create text elements if font is loaded
    if (isFontLoaded()) {
        createPanelTexts();
    }
    
    console.log('Game over panel created');
    
    return endPanel;
}

/**
 * Create text elements for the panel
 */
function createPanelTexts() {
    // "Game Over" text
    gameOverText = createTextMesh('Game Over', UI_CONFIG.gameOverFontSize, 0xffffff, true);
    if (gameOverText) {
        gameOverText.position.set(0, 0.095, 0.005);
        gameOverText.renderOrder = 3;
        endPanel.add(gameOverText);
    }
    
    // Final score text
    endPanelScoreText = createTextMesh('0', UI_CONFIG.endPanelScoreFontSize, 0xFFF000, true);
    if (endPanelScoreText) {
        endPanelScoreText.position.set(0, 0.025, 0.005);
        endPanelScoreText.renderOrder = 3;
        endPanel.add(endPanelScoreText);
    }
    
    // "points" label
    scoreLabelText = createTextMesh('points', UI_CONFIG.pointsLabelFontSize, 0xffffff, true);
    if (scoreLabelText) {
        scoreLabelText.position.set(0, -0.02, 0.005);
        scoreLabelText.renderOrder = 3;
        endPanel.add(scoreLabelText);
    }
}

/**
 * Initialize panel texts after font is loaded
 */
export function initPanelTexts() {
    if (isFontLoaded() && !gameOverText && !endPanelScoreText && !scoreLabelText) {
        createPanelTexts();
    }
}

/**
 * Show game over panel with animation
 * @param {Object} camera - Camera reference for positioning
 * @param {number} finalScore - Final score to display
 * @param {Function} gsap - GSAP instance
 */
export function showGameOverPanel(camera, finalScore, gsap) {
    if (!endPanel) return;
    
    // Position panel relative to camera
    const headHeight = camera.position.y;
    const headDistance = camera.position.z;
    endPanel.position.set(0, headHeight - 0.2, headDistance - 1.1);
    
    // Make panel face camera (Y-axis rotation only)
    const horizontalDirection = new THREE.Vector3(
        camera.position.x - endPanel.position.x,
        0,
        camera.position.z - endPanel.position.z
    ).normalize();
    const angle = Math.atan2(horizontalDirection.x, horizontalDirection.z);
    endPanel.rotation.set(0, angle, 0);
    
    // Update score text
    if (endPanelScoreText && isFontLoaded()) {
        updateTextMesh(endPanelScoreText, String(finalScore), UI_CONFIG.endPanelScoreFontSize, true);
        endPanelScoreText.position.set(0, 0.025, 0.005);
    }
    
    // Animate panel scale up
    gsap.to(endPanel.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.3,
        ease: "back.out(1.7)"
    });
}

/**
 * Hide game over panel with animation
 * @param {Function} gsap - GSAP instance
 * @param {Function} onComplete - Callback when animation completes
 */
export function hideGameOverPanel(gsap, onComplete) {
    if (!endPanel) return;
    
    gsap.to(endPanel.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.3,
        ease: "back.in(1.7)",
        onComplete
    });
}

/**
 * Animate button press
 * @param {Function} gsap - GSAP instance
 */
export function animateButtonPress(gsap) {
    if (!buttonPlaceholder) return;
    
    gsap.to(buttonPlaceholder.scale, {
        x: 0.7,
        y: 0.7,
        z: 0.7,
        duration: 0.3,
        ease: "power2.out"
    });
}

/**
 * Animate button release
 * @param {Function} gsap - GSAP instance
 */
export function animateButtonRelease(gsap) {
    if (!buttonPlaceholder) return;
    
    gsap.to(buttonPlaceholder.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.3,
        delay: 0.2,
        ease: "power2.out"
    });
}

/**
 * Get end panel reference
 * @returns {THREE.Mesh}
 */
export function getEndPanel() {
    return endPanel;
}

/**
 * Get button placeholder reference
 * @returns {THREE.Mesh}
 */
export function getButton() {
    return buttonPlaceholder;
}

/**
 * Check if panel is visible
 * @returns {boolean}
 */
export function isPanelVisible() {
    return endPanel && endPanel.scale.x > 0;
}

