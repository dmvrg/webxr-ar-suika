// PhysicsBridge.js - Main thread communication with physics worker
import { CONTAINER_CONFIG } from '../config/Constants.js';

let physicsWorker = null;
let messageHandlers = {};
let isInitialized = false;

/**
 * Initialize physics worker
 * @returns {Promise<void>}
 */
export function initPhysics() {
    return new Promise((resolve, reject) => {
        // Create worker
        physicsWorker = new Worker(
            new URL('./PhysicsWorker.js', import.meta.url), 
            { type: 'module' }
        );
        
        // Error handling
        physicsWorker.onerror = (error) => {
            console.error('Physics worker error:', error);
            reject(error);
        };
        
        // Message handling
        physicsWorker.onmessage = (e) => {
            const msg = e.data;
            
            // Handle initialization
            if (msg.type === 'initialized') {
                isInitialized = true;
                resolve(msg);
            }
            
            // Call registered handlers
            if (messageHandlers[msg.type]) {
                messageHandlers[msg.type](msg);
            }
        };
        
        // Initialize with container config
        physicsWorker.postMessage({ 
            type: 'init', 
            container: { 
                width: CONTAINER_CONFIG.width, 
                height: CONTAINER_CONFIG.height 
            }, 
            gravity: CONTAINER_CONFIG.gravity 
        });
    });
}

/**
 * Register a message handler for physics worker messages
 * @param {string} type - Message type
 * @param {Function} handler - Handler function
 */
export function onPhysicsMessage(type, handler) {
    messageHandlers[type] = handler;
}

/**
 * Remove a message handler
 * @param {string} type - Message type
 */
export function offPhysicsMessage(type) {
    delete messageHandlers[type];
}

/**
 * Spawn a fruit in the physics world
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} radius - Fruit radius
 * @param {number} fruitType - Fruit type (0-10)
 * @param {number} restitution - Bounciness
 */
export function spawnFruit(x, y, radius, fruitType, restitution) {
    if (!isInitialized) {
        console.warn('Physics not initialized yet');
        return;
    }
    
    physicsWorker.postMessage({ 
        type: 'spawn', 
        x, 
        y, 
        radius, 
        fruitType, 
        restitution 
    });
}

/**
 * Step the physics simulation
 * @param {number} dt - Delta time
 * @param {number} substeps - Number of substeps (default: 1)
 */
export function stepPhysics(dt, substeps = 1) {
    if (!isInitialized) {
        return;
    }
    
    physicsWorker.postMessage({ 
        type: 'step', 
        dt, 
        substeps 
    });
}

/**
 * Clear all physics bodies (restart game)
 */
export function clearPhysics() {
    if (!isInitialized) {
        return;
    }
    
    physicsWorker.postMessage({ type: 'clear' });
}

/**
 * Terminate the physics worker
 */
export function terminatePhysics() {
    if (physicsWorker) {
        physicsWorker.terminate();
        physicsWorker = null;
        isInitialized = false;
        messageHandlers = {};
    }
}

/**
 * Check if physics is initialized
 * @returns {boolean}
 */
export function isPhysicsReady() {
    return isInitialized;
}

