import * as THREE from 'three';
import { SHADER_PATHS } from '../config/Constants.js';

let fresnelMaterial = null;
let fresnelMaterialInfoBubbles = null;
let fresnelCloudMaterial = null;

/**
 * Helper function to load shader files
 * @param {string} url - Shader file URL
 * @returns {Promise<string>} Shader source code
 */
async function loadShader(url) {
    const response = await fetch(url);
    return await response.text();
}

/**
 * Load and create Fresnel shader materials
 * @returns {Promise<void>}
 */
export async function loadShaderMaterials() {
    try {
        // Load shader files
        const [vertexShader, fragmentShader] = await Promise.all([
            loadShader(SHADER_PATHS.fresnelVertex),
            loadShader(SHADER_PATHS.fresnelFragment)
        ]);
        
        // Create Fresnel material for container
        fresnelMaterial = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                outlineThickness: { value: 0.8 },
                outlineColor: { value: new THREE.Color(0xF7FBFF) },
                opacity: { value: 0.1 }
            },
            side: THREE.DoubleSide,
            transparent: true,
            depthWrite: false,
        });
        
        // Create Fresnel material for info bubbles (higher opacity)
        fresnelMaterialInfoBubbles = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                outlineThickness: { value: 1.5 },
                outlineColor: { value: new THREE.Color(0xF7FBFF) },
                opacity: { value: 0.2 }
            },
            side: THREE.DoubleSide,
            transparent: true,
            depthWrite: false,
        });
        
        console.log('Fresnel shader materials loaded successfully!');
    } catch (error) {
        console.error('Error loading Fresnel shaders:', error);
    }
}

/**
 * Create cloud Fresnel shader material
 * @returns {THREE.ShaderMaterial} Cloud material
 */
export function createCloudMaterial() {
    fresnelCloudMaterial = new THREE.ShaderMaterial({
        uniforms: {
            fresnelColor: { value: new THREE.Color(0xffffff) },
            rimColor: { value: new THREE.Color(0x88ccff) },
            fresnelPower: { value: 0.6 },
            rimStrength: { value: 0.6 }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 fresnelColor;
            uniform vec3 rimColor;
            uniform float fresnelPower;
            uniform float rimStrength;
            
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            
            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);
                
                // Fresnel effect
                float fresnel = pow(1.0 - abs(dot(normal, viewDir)), fresnelPower);
                
                // Mix base color with rim color
                vec3 finalColor = mix(fresnelColor, rimColor, fresnel * rimStrength);
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `,
        side: THREE.DoubleSide
    });
    
    return fresnelCloudMaterial;
}

/**
 * Get Fresnel material for container
 * @returns {THREE.ShaderMaterial}
 */
export function getFresnelMaterial() {
    return fresnelMaterial;
}

/**
 * Get Fresnel material for info bubbles
 * @returns {THREE.ShaderMaterial}
 */
export function getFresnelMaterialInfoBubbles() {
    return fresnelMaterialInfoBubbles;
}

/**
 * Get cloud material
 * @returns {THREE.ShaderMaterial}
 */
export function getCloudMaterial() {
    return fresnelCloudMaterial;
}

/**
 * Check if shaders are loaded
 * @returns {boolean}
 */
export function areShadersLoaded() {
    return fresnelMaterial !== null && fresnelMaterialInfoBubbles !== null;
}

