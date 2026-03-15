// ========================================
// FRUIT CONFIGURATION
// ========================================
export const FRUITS = [
    {
        type: 0,
        name: 'Cherry',
        radius: 0.022,
        color: 0xF6100F,  // Red
        restitution: 0.4,  // Hard fruit - bouncy
    },
    {
        type: 1,
        name: 'Strawberry',
        radius: 0.03,
        color: 0xFF3535,  // Bright Red
        restitution: 0.2,  // Soft fruit - slight bounce
    },
    {
        type: 2,
        name: 'Grape',
        radius: 0.039,
        color: 0x8758E8,  // Purple
        restitution: 0.35,  // Firm fruit - bouncy
    },
    {
        type: 3,
        name: 'Dekopon',
        radius: 0.045,
        color: 0xFFB000,  // Orange
        restitution: 0.25,  // Citrus - moderate bounce
    },
    {
        type: 4,
        name: 'Persimmon',
        radius: 0.055,
        color: 0xFD8715,  // Dark Orange
        restitution: 0.15,  // Soft when ripe - low bounce
    },
    {
        type: 5,
        name: 'Apple',
        radius: 0.065,
        color: 0xF41516,  // Apple Red
        restitution: 0.3,  // Firm fruit - moderate bounce
    },
    {
        type: 6,
        name: 'Pear',
        radius: 0.075,
        color: 0xFEF269,  // Yellow-Green
        restitution: 0.2,  // Softer fruit - slight bounce
    },
    {
        type: 7,
        name: 'Peach',
        radius: 0.084,
        color: 0xFECDC9,  // Peach
        restitution: 0.1,  // Very soft - minimal bounce
    },
    {
        type: 8,
        name: 'Pineapple',
        radius: 0.105,
        color: 0xF6E807,  // Yellow
        restitution: 0.15,  // Dense but has give - low bounce
    },
    {
        type: 9,
        name: 'Melon',
        radius: 0.12,
        color: 0x85CA17,  // Green
        restitution: 0.08,  // Heavy and soft - very low bounce
    },
    {
        type: 10,
        name: 'Watermelon',
        radius: 0.14,
        color: 0x62C810,  // Dark Green
        restitution: 0.05,  // Heaviest, mostly water - almost no bounce
    }
];

/**
 * Get fruit configuration by type
 * @param {number} type - Fruit type (0-10)
 * @returns {Object} Fruit configuration
 */
export function getFruitConfig(type) {
    return FRUITS[type];
}

/**
 * Get random spawnable fruit type (first 5 fruits in SUIKA)
 * @returns {number} Random fruit type (0-4)
 */
export function getRandomSpawnableFruit() {
    const spawnableFruits = 5; // First 5 fruits can spawn
    return Math.floor(Math.random() * spawnableFruits);
}

/**
 * Get number of available fruit types
 * @returns {number} Total fruit types
 */
export function getTotalFruitTypes() {
    return FRUITS.length;
}

