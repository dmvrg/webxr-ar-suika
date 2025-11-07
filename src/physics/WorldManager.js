import RAPIER from '@dimforge/rapier2d-compat';
import { RESTITUTION, FRICTION } from '../config/PhysicsConfig.js';

let world = null;

/**
 * Initialize RAPIER physics world with boundaries
 * @param {number} gravity - Gravity value (usually negative)
 * @param {Object} container - Container dimensions {width, height}
 * @returns {Promise<Object>} Initialized world and dangerLineY
 */
export async function initWorld(gravity, container) {
    try {
        console.log('Initializing RAPIER...');
        await RAPIER.init();
        console.log('RAPIER initialized');
        
        world = new RAPIER.World({ x: 0, y: gravity });
        console.log('Physics world created with gravity:', gravity);

        const halfW = container.width * 0.5;
        const halfH = container.height * 0.5;

        // Create container boundaries
        // Bottom wall (floor)
        makeStaticBox(0, -halfH, halfW, 0.005);
        console.log('Created floor at y:', -halfH);

        // Left wall
        makeStaticBox(-halfW, 0, 0.005, halfH);
        console.log('Created left wall at x:', -halfW);

        // Right wall
        makeStaticBox(halfW, 0, 0.005, halfH);
        console.log('Created right wall at x:', halfW);
        
        // Calculate danger line position (94% from bottom)
        const DANGER_LINE_PERCENTAGE = 0.94;
        const dangerLineY = -halfH + (container.height * DANGER_LINE_PERCENTAGE);
        console.log('Danger line set at y:', dangerLineY);
        
        console.log('Physics world initialization complete');
        
        return { world, dangerLineY };
    } catch (error) {
        console.error('Error initializing physics:', error.message);
        throw error;
    }
}

/**
 * Create a static box collider (wall/floor)
 * @param {number} cx - Center X position
 * @param {number} cy - Center Y position
 * @param {number} hx - Half width
 * @param {number} hy - Half height
 */
function makeStaticBox(cx, cy, hx, hy) {
    const rb = world.createRigidBody(
        RAPIER.RigidBodyDesc.fixed().setTranslation(cx, cy)
    );
    const col = world.createCollider(
        RAPIER.ColliderDesc.cuboid(hx, hy)
            .setRestitution(RESTITUTION)
            .setFriction(FRICTION),
        rb
    );
    return { rb, col };
}

/**
 * Get the physics world instance
 * @returns {RAPIER.World} Physics world
 */
export function getWorld() {
    return world;
}

