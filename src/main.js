import * as THREE from 'three';

// Core
import { initScene, getScene, getCamera, getRenderer, handleResize } from './core/SceneManager.js';
import { initWebXR, positionCompositionAtHeadHeight, getXRSessionTime } from './core/WebXRManager.js';
import * as GameState from './core/GameState.js';

// Config
import { SPAWN_COOLDOWN, CONTAINER_CONFIG, PERFORMANCE } from './config/Constants.js';
import { getFruitConfig } from './config/Fruits.js';

// Physics
import { initPhysics, onPhysicsMessage, spawnFruit, stepPhysics, clearPhysics } from './physics/PhysicsBridge.js';

// Models
import { loadAllModels, cloudModel } from './models/ModelLoader.js';
import { createContainer, createBaseComposition, applyMaterialToContainer } from './models/ContainerBuilder.js';
import { createFruitMesh, disposeFruitMesh } from './models/FruitFactory.js';

// UI
import { loadFont } from './ui/TextRenderer.js';
import { createInfoBubbles, updateNextFruitPreview, updateScoreDisplay, updateTimeDisplay, resetScoreCache, resetTimeCache, applyMaterialToInfoBubbles, initBubbleTexts } from './ui/InfoBubbles.js';
import { createDangerLine } from './ui/DangerLine.js';
import { createGameOverPanel, showGameOverPanel, hideGameOverPanel, animateButtonPress, animateButtonRelease, isPanelVisible, initPanelTexts, getButton } from './ui/GameOverPanel.js';

// Input
import { setupHands, updateHandJoints } from './input/HandTracker.js';
import { detectLeftPinch, detectRightPinch, detectButtonPress } from './input/GestureDetector.js';
import { initDropController, updateDropSphere, handlePinchMovement, resetHandTracking, getDropSpherePosition, hideDropVisuals, showDropVisuals, updateDropVisualsPosition } from './input/DropController.js';

// Effects
import { initializeParticlePool, createParticleBurst } from './effects/ParticleSystem.js';
import { loadShaderMaterials, getFresnelMaterial, getFresnelMaterialInfoBubbles, createCloudMaterial } from './effects/ShaderMaterials.js';
import { updateGSAP, animateStaggerScaleDown, animateScaleUp, getGSAP } from './effects/AnimationManager.js';

// Utils
import { worldToContainer, disableFrustumCulling } from './utils/CoordinateUtils.js';

// ========================================
// GLOBAL REFERENCES
// ========================================
let scene, camera, renderer;
let baseComposition, containerModel;
let cloudPlaceholder = null;
const clock = new THREE.Clock();

// Fruit meshes tracking
const fruitMeshes = new Map();
// Pending visual mesh to bridge drop -> physics spawn (prevents flicker)
let pendingSpawnMesh = null;

// Button press state
let buttonPressed = false;
let lastButtonPressTime = 0;

// ========================================
// INITIALIZATION
// ========================================
async function init() {
    console.log('🎮 Initializing Suika WebXR Game...');
    
    // 1. Initialize scene
    ({ scene, camera, renderer } = initScene());
    
    // 2. Load resources
    await Promise.all([
        loadFont(),
        loadShaderMaterials(),
        loadAllModels()
    ]);
    
    // 3. Initialize physics
    await initPhysics();
    
    // 4. Setup physics message handlers
    setupPhysicsHandlers();
    
    // 5. Create base composition and container
    baseComposition = createBaseComposition();
    scene.add(baseComposition);
    
    containerModel = createContainer();
    baseComposition.add(containerModel);
    
    // 6. Apply shaders
    applyMaterialToContainer(getFresnelMaterial());
    
    // 7. Create UI elements
    createInfoBubbles(containerModel);
    initBubbleTexts();
    createDangerLine(containerModel);
    createGameOverPanel(scene);
    initPanelTexts();
    applyMaterialToInfoBubbles(getFresnelMaterialInfoBubbles());
    
    // 8. Initialize effects
    initializeParticlePool(containerModel);
    
    // 9. Initialize input
    setupHands(renderer.xr, scene);
    initDropController(containerModel, GameState.getCurrentFruitType());
    
    // 10. Add cloud model
    if (cloudModel) {
        cloudPlaceholder = cloudModel.clone();
        const fresnelCloudMaterial = createCloudMaterial();
        
        // Apply shader to first mesh only
        let firstMeshFound = false;
        cloudPlaceholder.traverse((child) => {
            if (child.isMesh && !firstMeshFound) {
                child.material = fresnelCloudMaterial;
                firstMeshFound = true;
            }
        });
        
        cloudPlaceholder.scale.set(PERFORMANCE.cloudModelScale, PERFORMANCE.cloudModelScale, PERFORMANCE.cloudModelScale);
        cloudPlaceholder.position.set(0, 0.41, -0.06);
        baseComposition.add(cloudPlaceholder);
    }
    
    // 11. Initialize WebXR
    initWebXR(renderer, onXRSessionStart, onXRSessionEnd);
    
    // 12. Setup window resize
    window.addEventListener('resize', handleResize);
    
    // 13. Disable frustum culling on all static scene objects so nothing
    //     disappears during video recording when the capture camera differs
    //     from the XR view.
    disableFrustumCulling(scene);
    
    // 14. Start animation loop
    renderer.setAnimationLoop(animate);
    
    console.log('✅ Game initialized successfully!');
}

// ========================================
// PHYSICS HANDLERS
// ========================================
function setupPhysicsHandlers() {
    // Handle initialization
    onPhysicsMessage('initialized', (msg) => {
        GameState.setDangerLineY(msg.dangerLineY);
        console.log('Physics initialized, danger line at Y:', msg.dangerLineY);
    });
    
    // Handle spawn
    onPhysicsMessage('spawned', (msg) => {
        const { id, radius, x, y, fruitType } = msg;
        
        if (pendingSpawnMesh) {
            // Reuse pending mesh to avoid any visual gap
            const mesh = pendingSpawnMesh;
            mesh.userData.fruitType = fruitType;
            mesh.userData.physicsId = id;
            mesh.position.set(x, y, 0);
            fruitMeshes.set(id, mesh);
            pendingSpawnMesh = null;
            return;
        }
        
        const mesh = createFruitMesh(fruitType, radius);
        mesh.userData.fruitType = fruitType;
        mesh.userData.physicsId = id;
        
        containerModel.add(mesh);
        mesh.position.set(x, y, 0);
        fruitMeshes.set(id, mesh);
    });
    
    // Handle pose updates
    onPhysicsMessage('poses', (msg) => {
        // Update fruit positions
        for (const u of msg.updates) {
            const m = fruitMeshes.get(u.id);
            if (m) {
                m.position.set(u.x, u.y, 0);
                if (u.rotation !== undefined) {
                    m.rotation.z = u.rotation;
                }
            }
        }
        
        // Check danger line
        if (msg.dangerFruits && msg.occupiedColumns) {
            GameState.checkDangerLineCondition(msg.occupiedColumns.length);
        }
    });
    
    // Handle merges
    onPhysicsMessage('merge', (msg) => {
        const gsap = getGSAP();
        
        // Remove merged fruits with animation
        for (const id of msg.removedIds) {
            const mesh = fruitMeshes.get(id);
            if (mesh) {
                // Get world position for particle burst
                const worldPos = new THREE.Vector3();
                mesh.getWorldPosition(worldPos);
                
                const fruitType = mesh.userData.fruitType;
                const fruitColor = getFruitConfig(fruitType).color;
                
                // Create particle burst
                createParticleBurst(worldPos, fruitColor, gsap);
                
                // Pop animation
                const currentScale = mesh.scale.x;
                gsap.to(mesh.scale, {
                    x: currentScale * 1.3,
                    y: currentScale * 1.3,
                    z: currentScale * 1.3,
                    duration: 0.1,
                    ease: "power2.out",
                    onComplete: () => {
                        containerModel.remove(mesh);
                        disposeFruitMesh(mesh);
                    }
                });
                
                fruitMeshes.delete(id);
            }
        }
        
        // Calculate and add score
        if (msg.mergeEvents && msg.mergeEvents.length > 0) {
            for (const mergeEvent of msg.mergeEvents) {
                const points = GameState.calculateMergeScore(mergeEvent.resultingFruitType);
                GameState.addScore(points);
            }
            updateScoreDisplay(GameState.getScore());
        }
    });
}

// ========================================
// XR SESSION HANDLERS
// ========================================
function onXRSessionStart() {
    GameState.resetGameState();
    updateScoreDisplay(0);
    resetScoreCache();
    resetTimeCache();
    restartInProgress = false;
    
    // Update visuals
    updateDropSphere(GameState.getCurrentFruitType());
    updateNextFruitPreview(GameState.getNextFruitType());
    
    // Show drop sphere (initially visible)
    setTimeout(() => showDropVisuals(getGSAP()), 100);
}

function onXRSessionEnd() {
    GameState.setGameStartTime(null);
}

// ========================================
// GAME LOGIC
// ========================================
let restartInProgress = false;

function handleSpawn() {
    if (GameState.isGameOverState()) return;
    
    const currentTime = Date.now();
    
    // Prevent spawning right after XR session starts
    if (getXRSessionTime() < 500) return;
    
    // Check cooldown
    if (currentTime - GameState.getLastSpawnTime() < SPAWN_COOLDOWN) return;
    
    GameState.setLastSpawnTime(currentTime);
    
    // Hide drop visuals
    hideDropVisuals();
    
    // Get spawn position
    const worldPos = getDropSpherePosition();
    const local = worldToContainer(worldPos, containerModel);
    
    // Create a temporary visual mesh at the spawn point to bridge until physics responds
    const spawnType = GameState.getCurrentFruitType();
    const spawnRadius = GameState.getCurrentFruitRadius();
    pendingSpawnMesh = createFruitMesh(spawnType, spawnRadius);
    pendingSpawnMesh.userData.fruitType = spawnType;
    pendingSpawnMesh.position.set(local.x, local.y, 0);
    containerModel.add(pendingSpawnMesh);
    
    // Spawn fruit in physics
    const fruitConfig = getFruitConfig(spawnType);
    spawnFruit(
        local.x,
        local.y,
        spawnRadius,
        spawnType,
        fruitConfig.restitution
    );
    
    // Rotate fruits
    GameState.rotateFruits();
    updateDropSphere(GameState.getCurrentFruitType());
    updateNextFruitPreview(GameState.getNextFruitType());
    
    // Show new drop sphere after delay
    setTimeout(() => {
        if (!GameState.isGameOverState()) {
            showDropVisuals(getGSAP());
        }
    }, 600);
}

function handleGameOver() {
    if (GameState.isGameOverState() && !isPanelVisible() && !restartInProgress) {
        // Trigger game over UI (only once)
        hideDropVisuals();
        showGameOverPanel(camera, GameState.getScore(), getGSAP());
    }
}

function handleRestart() {
    console.log('=== RESTARTING GAME ===');
    restartInProgress = true;
    
    const meshArray = Array.from(fruitMeshes.values());
    
    if (meshArray.length > 0) {
        animateStaggerScaleDown(meshArray, 0.01, 0.2, cleanupAndResetGame);
    } else {
        cleanupAndResetGame();
    }
}

function cleanupAndResetGame() {
    // Clean up meshes
    fruitMeshes.forEach((mesh) => {
        containerModel.remove(mesh);
        disposeFruitMesh(mesh);
    });
    fruitMeshes.clear();
    
    // Clear physics
    clearPhysics();
    
    // Reset game state
    GameState.resetGameState();
    updateScoreDisplay(0);
    updateTimeDisplay(0);
    resetScoreCache();
    resetTimeCache();
    
    // Update visuals
    updateDropSphere(GameState.getCurrentFruitType());
    updateNextFruitPreview(GameState.getNextFruitType());
    
    // Show drop sphere
    hideDropVisuals();
    setTimeout(() => {
        showDropVisuals(getGSAP());
        restartInProgress = false;
    }, 100);
    
    console.log('Game restarted successfully!');
}

// ========================================
// INPUT HANDLING
// ========================================
function handleInput() {
    // Update hand joints
    updateHandJoints();
    
    // Detect pinches
    const leftPinch = detectLeftPinch();
    const rightPinch = detectRightPinch();
    
    // Handle left pinch
    if (leftPinch.isPinching && !GameState.isGameOverState()) {
        if (leftPinch.justStarted) {
            resetHandTracking(true, leftPinch.position);
        }
        handlePinchMovement(true, leftPinch.position, 1.0);
    } else if (leftPinch.justReleased) {
        handleSpawn();
    }
    
    // Handle right pinch
    if (rightPinch.isPinching && !GameState.isGameOverState()) {
        if (rightPinch.justStarted) {
            resetHandTracking(false, rightPinch.position);
        }
        handlePinchMovement(false, rightPinch.position, 1.0);
    } else if (rightPinch.justReleased) {
        handleSpawn();
    }
    
    // Handle button press (game over)
    if (GameState.isGameOverState() && isPanelVisible()) {
        const button = getButton();
        if (button) {
            const buttonWorldPos = new THREE.Vector3();
            button.getWorldPosition(buttonWorldPos);
            
            const buttonState = detectButtonPress(button, buttonWorldPos, 0.18, 0.06);
            
            if ((buttonState.leftJustPressed || buttonState.rightJustPressed) && !buttonPressed) {
                const currentTime = Date.now();
                if (currentTime - lastButtonPressTime >= 1000) {
                    buttonPressed = true;
                    lastButtonPressTime = currentTime;
                    animateButtonPress(getGSAP());
                }
            }
            
            if (!buttonState.anyPressed && buttonPressed) {
                buttonPressed = false;
                animateButtonRelease(getGSAP());
                
                // Restart game after delay
                setTimeout(() => {
                    hideGameOverPanel(getGSAP(), handleRestart);
                }, 300);
            }
        }
    }
}

// ========================================
// ANIMATION LOOP
// ========================================
function animate() {
    const delta = clock.getDelta();
    updateGSAP(delta);
    
    // Step physics
    stepPhysics(delta, 1);
    
    // Update time display
    GameState.updateElapsedTime();
    updateTimeDisplay(GameState.getElapsedSeconds());
    
    // Handle input
    handleInput();
    
    // Check game over condition
    handleGameOver();
    
    // Update drop sphere visuals (vertical line follows drop sphere)
    updateDropVisualsPosition();
    
    // Auto-position composition
    positionCompositionAtHeadHeight(baseComposition, camera);
    
    // Update cloud position and pulse
    if (cloudPlaceholder) {
        const dropSpherePos = getDropSpherePosition();
        const localPos = worldToContainer(dropSpherePos, containerModel);
        cloudPlaceholder.position.x = localPos.x;
        
        const time = clock.getElapsedTime();
        const pulseSpeed = 9.0;
        const scale = PERFORMANCE.cloudModelScale * (0.975 + 0.025 * Math.sin(time * pulseSpeed));
        cloudPlaceholder.scale.setScalar(scale);
    }
    
    // Render
    renderer.render(scene, camera);
}

// ========================================
// START GAME
// ========================================
init().catch(error => {
    console.error('Failed to initialize game:', error);
});

