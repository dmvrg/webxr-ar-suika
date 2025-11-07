import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { MODEL_PATHS } from '../config/Constants.js';

const fontLoader = new FontLoader();
let loadedFont = null;

/**
 * Load font for text rendering
 * @returns {Promise<Font>} Loaded font
 */
export function loadFont() {
    return new Promise((resolve, reject) => {
        fontLoader.load(
            MODEL_PATHS.font,
            (font) => {
                loadedFont = font;
                console.log('Font loaded successfully');
                resolve(font);
            },
            undefined,
            (error) => {
                console.error('Error loading font:', error);
                reject(error);
            }
        );
    });
}

/**
 * Create text mesh
 * @param {string} text - Text content
 * @param {number} size - Font size
 * @param {number} color - Text color
 * @param {boolean} centered - Whether to center the geometry
 * @returns {THREE.Mesh} Text mesh
 */
export function createTextMesh(text, size = 0.03, color = 0xffffff, centered = true) {
    if (!loadedFont) {
        console.error('Font not loaded yet');
        return null;
    }
    
    const textGeometry = new TextGeometry(text, {
        font: loadedFont,
        size: size,
        depth: 0,
    });
    
    if (centered) {
        textGeometry.center();
    } else {
        // Compute bounding box for manual positioning
        textGeometry.computeBoundingBox();
    }
    
    const textMaterial = new THREE.MeshBasicMaterial({ color });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    
    return textMesh;
}

/**
 * Update existing text mesh with new content
 * @param {THREE.Mesh} textMesh - Existing text mesh
 * @param {string} newText - New text content
 * @param {number} size - Font size
 * @param {boolean} centered - Whether to center the geometry
 */
export function updateTextMesh(textMesh, newText, size = 0.03, centered = true) {
    if (!textMesh || !loadedFont) return;
    
    // Dispose old geometry
    textMesh.geometry.dispose();
    
    // Create new geometry
    const newTextGeometry = new TextGeometry(newText, {
        font: loadedFont,
        size: size,
        depth: 0,
    });
    
    if (centered) {
        newTextGeometry.center();
    } else {
        // Compute bounding box for manual positioning
        newTextGeometry.computeBoundingBox();
    }
    
    textMesh.geometry = newTextGeometry;
    
    return newTextGeometry.boundingBox;
}

/**
 * Get loaded font reference
 * @returns {Font} Loaded font
 */
export function getLoadedFont() {
    return loadedFont;
}

/**
 * Check if font is loaded
 * @returns {boolean}
 */
export function isFontLoaded() {
    return loadedFont !== null;
}

