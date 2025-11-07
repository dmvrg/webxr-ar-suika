import RAPIER from '@dimforge/rapier2d-compat';
import { 
    FRICTION, 
    LINEAR_DAMPING, 
    ANGULAR_DAMPING, 
    RANDOM_SPIN_RANGE,
    MERGE_DISTANCE_THRESHOLD,
    getFruitRadius,
    getFruitRestitution 
} from '../config/PhysicsConfig.js';
import { getWorld } from './WorldManager.js';

/**
 * Spawn a dynamic circle (fruit) in the physics world
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} radius - Circle radius
 * @param {number} fruitType - Fruit type (0-10)
 * @param {number} restitution - Bounciness
 * @param {number} nextId - ID for this body
 * @param {Map} bodies - Bodies map reference
 * @param {Map} colliderToId - Collider to ID map reference
 * @returns {Object} Created body info
 */
export function spawnCircle(x, y, radius, fruitType, restitution, nextId, bodies, colliderToId) {
    const world = getWorld();
    const id = nextId;
    
    console.log('Spawning circle at position:', x, y, 'fruitType:', fruitType, 'restitution:', restitution);
    
    const rb = world.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(x, y)
            .setLinearDamping(LINEAR_DAMPING)
            .setAngularDamping(ANGULAR_DAMPING)
    );
    
    // Give a small random initial angular velocity
    const randomSpin = (Math.random() - 0.5) * RANDOM_SPIN_RANGE;
    rb.setAngvel(randomSpin);
    
    const col = world.createCollider(
        RAPIER.ColliderDesc.ball(radius)
            .setRestitution(restitution)
            .setFriction(FRICTION),
        rb
    );
    
    bodies.set(id, { rb, col, radius, fruitType });
    colliderToId.set(col.handle, id);
    
    // Notify main thread that fruit was spawned
    postMessage({ type: 'spawned', id, radius, x, y, fruitType });
    
    return { id, radius, x, y, fruitType };
}

/**
 * Check for collisions and handle merging
 * @param {Map} bodies - Bodies map
 * @param {Map} colliderToId - Collider to ID map
 * @param {Set} mergedThisFrame - Set of merged IDs this frame
 * @returns {Object} Merge results {toRemove, toSpawn}
 */
export function checkCollisions(bodies, colliderToId, mergedThisFrame) {
    const world = getWorld();
    const toRemove = new Set();
    const toSpawn = [];
    
    // Simple and reliable: check distances between all fruit pairs
    const bodyArray = Array.from(bodies.entries());
    for (let i = 0; i < bodyArray.length; i++) {
        if (toRemove.has(bodyArray[i][0])) continue;
        
        for (let j = i + 1; j < bodyArray.length; j++) {
            const [id1, body1] = bodyArray[i];
            const [id2, body2] = bodyArray[j];
            
            // Skip if already marked for removal
            if (toRemove.has(id1) || toRemove.has(id2)) continue;
            
            // Check if same fruit type
            if (body1.fruitType !== body2.fruitType) continue;
            
            // Get positions
            const pos1 = body1.rb.translation();
            const pos2 = body2.rb.translation();
            
            // Calculate distance between fruits
            const dx = pos2.x - pos1.x;
            const dy = pos2.y - pos1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = body1.radius + body2.radius;
            
            // Check if fruits are touching
            if (distance <= minDistance * MERGE_DISTANCE_THRESHOLD) {
                // Mark both fruits for removal
                toRemove.add(id1);
                toRemove.add(id2);
                mergedThisFrame.add(id1);
                mergedThisFrame.add(id2);
                
                // Calculate merge position (midpoint)
                const mergeX = (pos1.x + pos2.x) / 2;
                const mergeY = (pos1.y + pos2.y) / 2;
                
                // Only spawn next fruit if not max type (Watermelon = 10)
                const fruitType = body1.fruitType;
                if (fruitType < 10) {
                    const nextType = fruitType + 1;
                    toSpawn.push({ x: mergeX, y: mergeY, type: nextType });
                    console.log('Merging two', fruitType, 'fruits into type', nextType, 'at', mergeX, mergeY);
                } else {
                    console.log('Watermelons collided - no merge (max fruit reached)');
                }
                
                break; // Exit inner loop since we merged id1
            }
        }
    }
    
    // Remove merged fruits from physics world
    for (const id of toRemove) {
        const body = bodies.get(id);
        if (body) {
            colliderToId.delete(body.col.handle);
            world.removeRigidBody(body.rb);
            bodies.delete(id);
        }
    }
    
    return { toRemove, toSpawn };
}

/**
 * Spawn new merged fruits
 * @param {Array} toSpawn - Array of spawn info {x, y, type}
 * @param {number} nextId - Next available ID
 * @param {Map} bodies - Bodies map
 * @param {Map} colliderToId - Collider to ID map
 * @returns {number} Updated nextId
 */
export function spawnMergedFruits(toSpawn, nextId, bodies, colliderToId) {
    let currentId = nextId;
    
    for (const spawn of toSpawn) {
        // Get fruit config for next type
        const nextRadius = getFruitRadius(spawn.type);
        const nextRestitution = getFruitRestitution(spawn.type);
        spawnCircle(spawn.x, spawn.y, nextRadius, spawn.type, nextRestitution, currentId++, bodies, colliderToId);
    }
    
    return currentId;
}

