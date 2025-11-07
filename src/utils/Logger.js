// ========================================
// CENTRALIZED LOGGING UTILITY
// ========================================

let DEBUG_MODE = true; // Set to false to disable debug logs

/**
 * Enable or disable debug logging
 * @param {boolean} enabled - Whether to enable debug logs
 */
export function setDebugMode(enabled) {
    DEBUG_MODE = enabled;
}

/**
 * Log debug message (can be toggled off)
 * @param {...any} args - Arguments to log
 */
export function log(...args) {
    if (DEBUG_MODE) {
        console.log('[SUIKA]', ...args);
    }
}

/**
 * Log warning message (always shown)
 * @param {...any} args - Arguments to log
 */
export function warn(...args) {
    console.warn('[SUIKA WARNING]', ...args);
}

/**
 * Log error message (always shown)
 * @param {...any} args - Arguments to log
 */
export function error(...args) {
    console.error('[SUIKA ERROR]', ...args);
}

/**
 * Log info message with custom prefix
 * @param {string} prefix - Custom prefix
 * @param {...any} args - Arguments to log
 */
export function logWithPrefix(prefix, ...args) {
    if (DEBUG_MODE) {
        console.log(`[${prefix}]`, ...args);
    }
}

/**
 * Log message from physics worker
 * @param {...any} args - Arguments to log
 */
export function logPhysics(...args) {
    if (DEBUG_MODE) {
        console.log('[PHYSICS]', ...args);
    }
}

