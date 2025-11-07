// ========================================
// PHYSICS ENGINE CONFIGURATION
// ========================================

export const RESTITUTION = 0.05;
export const FRICTION = 0.2;
export const FIXED_DT = 1/120;

// Linear and angular damping
export const LINEAR_DAMPING = 0.01;
export const ANGULAR_DAMPING = 0.5;

// Random spin range for initial angular velocity
export const RANDOM_SPIN_RANGE = 0.5; // -0.25 to +0.25 rad/s

// Merge detection threshold (multiplier of combined radius)
export const MERGE_DISTANCE_THRESHOLD = 1.05;

// ========================================
// FRUIT PHYSICS CONFIGURATION
// Must match FRUITS array in Fruits.js
// ========================================
// Match visual FRUITS radii so physics collider sizes align with visuals
export const FRUIT_PHYSICS_CONFIG = [
    { radius: 0.022, restitution: 0.4 },   // Cherry
    { radius: 0.030, restitution: 0.2 },   // Strawberry
    { radius: 0.039, restitution: 0.35 },  // Grape
    { radius: 0.045, restitution: 0.25 },  // Dekopon
    { radius: 0.055, restitution: 0.15 },  // Persimmon
    { radius: 0.065, restitution: 0.3 },   // Apple
    { radius: 0.075, restitution: 0.2 },   // Pear
    { radius: 0.084, restitution: 0.1 },   // Peach
    { radius: 0.105, restitution: 0.15 },  // Pineapple
    { radius: 0.120, restitution: 0.08 },  // Melon
    { radius: 0.140, restitution: 0.05 }   // Watermelon
];

/**
 * Get physics radius for a fruit type
 * @param {number} type - Fruit type (0-10)
 * @returns {number} Radius in meters
 */
export function getFruitRadius(type) {
    return FRUIT_PHYSICS_CONFIG[type]?.radius || 0.020;
}

/**
 * Get restitution (bounciness) for a fruit type
 * @param {number} type - Fruit type (0-10)
 * @returns {number} Restitution value
 */
export function getFruitRestitution(type) {
    return FRUIT_PHYSICS_CONFIG[type]?.restitution || RESTITUTION;
}

