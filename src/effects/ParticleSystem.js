import * as THREE from 'three';
import { PARTICLE_POOL_SIZE, PARTICLES_PER_BURST } from '../config/Constants.js';
import { worldToContainer } from '../utils/CoordinateUtils.js';

const particlePool = [];
const activeParticles = [];
let containerModel = null;

/**
 * Initialize particle pool
 * @param {THREE.Object3D} container - Container model reference
 */
export function initializeParticlePool(container) {
    containerModel = container;
    
    const particleGeometry = new THREE.SphereGeometry(0.006, 8, 8);
    
    for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 1
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.visible = false;
        containerModel.add(particle);
        particlePool.push(particle);
    }
    
    console.log(`Particle pool initialized: ${PARTICLE_POOL_SIZE} particles`);
}

/**
 * Create particle burst at merge position
 * @param {THREE.Vector3} worldPosition - World position of merge
 * @param {number} fruitColor - Color of the merged fruit
 * @param {Function} gsap - GSAP instance for animation
 */
export function createParticleBurst(worldPosition, fruitColor, gsap) {
    if (!containerModel) {
        console.warn('Particle system not initialized');
        return;
    }
    
    // Convert world position to container local space
    const localPos = worldToContainer(worldPosition, containerModel);
    
    // Get particles from pool
    const burstParticles = [];
    for (let i = 0; i < PARTICLES_PER_BURST; i++) {
        const particle = particlePool.find(p => !p.visible);
        if (!particle) {
            console.warn('Particle pool exhausted!');
            break;
        }
        
        // Set particle color and properties
        particle.material.color.setHex(fruitColor);
        particle.material.opacity = 1;
        particle.position.set(localPos.x, localPos.y, localPos.z);
        particle.scale.set(1, 1, 1);
        particle.visible = true;
        
        burstParticles.push(particle);
        activeParticles.push(particle);
    }
    
    // Animate particles bursting outward
    burstParticles.forEach((particle, index) => {
        // Create 3D spherical burst pattern
        const horizontalAngle = (Math.PI * 2 * index) / PARTICLES_PER_BURST;
        const randomHorizontalOffset = (Math.random() - 0.5) * 0.5;
        const finalHorizontalAngle = horizontalAngle + randomHorizontalOffset;
        
        // Random vertical angle (-45° to +45°)
        const verticalAngle = (Math.random() - 0.5) * Math.PI * 0.5;
        
        // Burst radius
        const burstRadius = 0.08 + Math.random() * 0.04; // 0.08-0.12m
        
        // Calculate 3D position using spherical coordinates
        const horizontalRadius = Math.cos(verticalAngle) * burstRadius;
        const targetX = localPos.x + Math.cos(finalHorizontalAngle) * horizontalRadius;
        const targetY = localPos.y + Math.sin(verticalAngle) * burstRadius;
        const targetZ = localPos.z + Math.sin(finalHorizontalAngle) * horizontalRadius;
        
        // Animate position
        gsap.to(particle.position, {
            x: targetX,
            y: targetY,
            z: targetZ,
            duration: 0.4,
            ease: "power2.out"
        });
        
        // Animate scale
        gsap.to(particle.scale, {
            x: 0.2,
            y: 0.2,
            z: 0.2,
            duration: 0.4,
            ease: "power2.in"
        });
        
        // Animate opacity
        gsap.to(particle.material, {
            opacity: 0,
            duration: 0.4,
            ease: "power2.in",
            onComplete: () => {
                // Return particle to pool
                particle.visible = false;
                const index = activeParticles.indexOf(particle);
                if (index > -1) {
                    activeParticles.splice(index, 1);
                }
            }
        });
    });
}

/**
 * Get active particles count
 * @returns {number} Number of active particles
 */
export function getActiveParticleCount() {
    return activeParticles.length;
}

/**
 * Clear all active particles
 */
export function clearActiveParticles() {
    activeParticles.forEach(particle => {
        particle.visible = false;
    });
    activeParticles.length = 0;
}

