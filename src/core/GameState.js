import { getRandomSpawnableFruit } from '../config/Fruits.js';
import { FRUITS } from '../config/Fruits.js';
import { COMBO_WINDOW, MIN_COLUMNS_FOR_GAMEOVER, DANGER_TIMEOUT } from '../config/Constants.js';

// Game state
let isGameOver = false;
let score = 0;
let comboCount = 0;
let lastMergeTime = 0;
let gameStartTime = null;
let elapsedSeconds = 0;

// Danger line state
let dangerLineY = 0;
let columnCoverageStartTime = null;

// Current and next fruit
let currentFruitType = 0;
let currentFruitRadius = FRUITS[0].radius;
let nextFruitType = getRandomSpawnableFruit();
let nextFruitRadius = FRUITS[nextFruitType].radius;

// Spawn timing
let lastSpawnTime = 0;

/**
 * Reset game state
 */
export function resetGameState() {
    isGameOver = false;
    score = 0;
    comboCount = 0;
    lastMergeTime = 0;
    gameStartTime = Date.now();
    elapsedSeconds = 0;
    columnCoverageStartTime = null;
    lastSpawnTime = 0;
    
    // Reset fruit types
    currentFruitType = getRandomSpawnableFruit();
    currentFruitRadius = FRUITS[currentFruitType].radius;
    nextFruitType = getRandomSpawnableFruit();
    nextFruitRadius = FRUITS[nextFruitType].radius;
    
    console.log('Game state reset');
}

/**
 * Calculate score for a merge
 * @param {number} resultingFruitType - Type of fruit created by merge
 * @returns {number} Points earned
 */
export function calculateMergeScore(resultingFruitType) {
    // Base score: Triangular number formula
    const baseScore = (resultingFruitType * (resultingFruitType + 1)) / 2;
    
    // Check if we're in a combo window
    const currentTime = Date.now();
    if (currentTime - lastMergeTime <= COMBO_WINDOW) {
        comboCount++;
    } else {
        comboCount = 1;
    }
    lastMergeTime = currentTime;
    
    // Apply combo multiplier
    let multiplier = 1.0;
    if (comboCount === 2) {
        multiplier = 1.5;
    } else if (comboCount === 3) {
        multiplier = 2.0;
    } else if (comboCount >= 4) {
        multiplier = 2.5;
    }
    
    const finalScore = Math.floor(baseScore * multiplier);
    console.log(`Merge: ${FRUITS[resultingFruitType].name} | Base: ${baseScore} | Combo: x${multiplier.toFixed(1)} | Points: +${finalScore}`);
    
    return finalScore;
}

/**
 * Add points to score
 * @param {number} points - Points to add
 */
export function addScore(points) {
    score += points;
}

/**
 * Update elapsed time
 */
export function updateElapsedTime() {
    if (!gameStartTime || isGameOver) return;
    
    const currentTime = Date.now();
    elapsedSeconds = Math.floor((currentTime - gameStartTime) / 1000);
}

/**
 * Check danger line condition
 * @param {number} numOccupiedColumns - Number of occupied columns
 * @returns {boolean} True if game over triggered
 */
export function checkDangerLineCondition(numOccupiedColumns) {
    if (isGameOver) return false;
    
    const currentTime = Date.now();
    
    if (numOccupiedColumns >= MIN_COLUMNS_FOR_GAMEOVER) {
        if (columnCoverageStartTime === null) {
            columnCoverageStartTime = currentTime;
            console.log(`Danger: ${numOccupiedColumns} columns occupied`);
        } else {
            const timeInDanger = currentTime - columnCoverageStartTime;
            if (timeInDanger >= DANGER_TIMEOUT) {
                console.log(`Game Over: ${numOccupiedColumns} columns occupied for ${timeInDanger}ms`);
                triggerGameOver();
                return true;
            }
        }
    } else {
        if (columnCoverageStartTime !== null) {
            console.log(`Safe: Only ${numOccupiedColumns} columns occupied - timer reset`);
            columnCoverageStartTime = null;
        }
    }
    
    return false;
}

/**
 * Trigger game over
 */
export function triggerGameOver() {
    isGameOver = true;
    columnCoverageStartTime = null;
    console.log('=== GAME OVER ===');
    console.log('Final Score:', score);
    console.log('Time:', elapsedSeconds, 'seconds');
}

/**
 * Rotate fruits (current becomes next, generate new next)
 */
export function rotateFruits() {
    currentFruitType = nextFruitType;
    currentFruitRadius = nextFruitRadius;
    nextFruitType = getRandomSpawnableFruit();
    nextFruitRadius = FRUITS[nextFruitType].radius;
}

// Getters
export function getScore() { return score; }
export function getComboCount() { return comboCount; }
export function getElapsedSeconds() { return elapsedSeconds; }
export function isGameOverState() { return isGameOver; }
export function getDangerLineY() { return dangerLineY; }
export function getCurrentFruitType() { return currentFruitType; }
export function getCurrentFruitRadius() { return currentFruitRadius; }
export function getNextFruitType() { return nextFruitType; }
export function getNextFruitRadius() { return nextFruitRadius; }
export function getLastSpawnTime() { return lastSpawnTime; }
export function getGameStartTime() { return gameStartTime; }

// Setters
export function setDangerLineY(y) { dangerLineY = y; }
export function setLastSpawnTime(time) { lastSpawnTime = time; }
export function setGameStartTime(time) { gameStartTime = time; }
export function setCurrentFruitType(type) { 
    currentFruitType = type;
    currentFruitRadius = FRUITS[type].radius;
}
export function setNextFruitType(type) { 
    nextFruitType = type;
    nextFruitRadius = FRUITS[type].radius;
}

