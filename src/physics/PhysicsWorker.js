// PhysicsWorker.js - Refactored physics worker
import { initWorld, getWorld } from './WorldManager.js';
import { spawnCircle, checkCollisions, spawnMergedFruits } from './CollisionHandler.js';
import { checkDangerLine } from './GameOverDetector.js';
import { FIXED_DT } from '../config/PhysicsConfig.js';

// Container dimensions (default, will be set by init message)
let container = { width: 0.5, height: 0.6 };
let nextId = 1;

// Flag to track initialization
let isInitialized = false;

// Danger line Y position
let dangerLineY = 0;

// Game over detection constants
const NUM_COLUMNS = 5;

// id -> { rb, col, radius, fruitType }
const bodies = new Map();

// Reverse lookup: collider handle -> body id
const colliderToId = new Map();

// Track fruits that merged this frame to prevent double-merging
let mergedThisFrame = new Set();

// Fixed timestep accumulator
let accum = 0;

// Debug logging
function log(...args) {
    postMessage({ type: 'log', message: args.join(' ') });
}

/**
 * Step the physics simulation
 * @param {number} dt - Delta time
 * @param {number} substeps - Number of substeps
 */
function step(dt, substeps = 1) {
    const world = getWorld();
    accum += dt;
    const h = FIXED_DT / Math.max(1, substeps);

    while (accum >= FIXED_DT) {
        for (let i = 0; i < substeps; i++) {
            world.timestep = h;
            world.step();
        }
        accum -= FIXED_DT;
    }

    // Clear merged fruits tracking for this frame
    mergedThisFrame.clear();
    
    // Check for collisions and handle merging
    const { toRemove, toSpawn } = checkCollisions(bodies, colliderToId, mergedThisFrame);
    
    // Notify main thread to remove meshes and include merge info for scoring
    if (toRemove.size > 0) {
        const mergeEvents = toSpawn.map(spawn => ({
            resultingFruitType: spawn.type,
            position: { x: spawn.x, y: spawn.y }
        }));
        postMessage({ 
            type: 'merge', 
            removedIds: Array.from(toRemove),
            mergeEvents: mergeEvents
        });
    }
    
    // Spawn new merged fruits
    if (toSpawn.length > 0) {
        nextId = spawnMergedFruits(toSpawn, nextId, bodies, colliderToId);
    }

    // Send poses and check for danger line violations
    const updates = [];
    
    for (const [id, b] of bodies) {
        const t = b.rb.translation();
        const r = b.rb.rotation();
        updates.push({ id, x: t.x, y: t.y, rotation: r });
    }
    
    const { dangerFruits, occupiedColumns } = checkDangerLine(
        bodies, 
        dangerLineY, 
        container.width, 
        NUM_COLUMNS
    );
    
    postMessage({ 
        type: 'poses', 
        updates, 
        dangerFruits,
        occupiedColumns,
        totalColumns: NUM_COLUMNS
    });
}

// Worker message handler
self.onmessage = async (e) => {
    try {
        const msg = e.data;
        log('Received message:', msg.type);
        
        if (msg.type === 'init') {
            container = msg.container || container;
            const result = await initWorld(msg.gravity ?? -9.8, container);
            dangerLineY = result.dangerLineY;
            isInitialized = true;
            postMessage({ type: 'initialized', dangerLineY });
        } else if (!isInitialized) {
            log('Physics world not initialized yet');
            return;
        } else if (msg.type === 'spawn') {
            log('Spawning circle at:', msg.x, msg.y, 'with fruitType:', msg.fruitType);
            spawnCircle(
                msg.x, 
                msg.y, 
                msg.radius, 
                msg.fruitType, 
                msg.restitution,
                nextId++,
                bodies,
                colliderToId
            );
            // spawnCircle posts 'spawned' message directly
        } else if (msg.type === 'step') {
            step(msg.dt || FIXED_DT, msg.substeps || 1);
        } else if (msg.type === 'clear') {
            // Clear all dynamic bodies (fruits) but keep walls
            log('Clearing all physics bodies');
            const world = getWorld();
            for (const [id, body] of bodies) {
                colliderToId.delete(body.col.handle);
                world.removeRigidBody(body.rb);
            }
            bodies.clear();
            mergedThisFrame.clear();
            log('All physics bodies cleared');
        }
    } catch (error) {
        log('Error in worker:', error.message);
        postMessage({ type: 'error', message: error.message });
    }
};

