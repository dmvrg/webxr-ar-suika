// ========================================
// CONTAINER CONFIGURATION
// ========================================
export const CONTAINER_CONFIG = {
    width: 0.5,   // meters
    height: 0.6,  // meters
    depth: 0.28,   // meters
    gravity: -9.8 // m/s²
};

// ========================================
// PHYSICS & SPAWN CONFIGURATION
// ========================================
export const SPAWN_COOLDOWN = 500; // milliseconds
export const FIXED_TIMESTEP = 1/120;

// ========================================
// GAME OVER DETECTION
// ========================================
export const DANGER_LINE_PERCENTAGE = 0.94;
export const DANGER_TIMEOUT = 3000; // 3 seconds above line = game over
export const NUM_COLUMNS = 5; // Divide container into 5 columns for coverage check
export const MIN_COLUMNS_FOR_GAMEOVER = 4; // Need 4 out of 5 columns filled to trigger game over

// ========================================
// SCORING SYSTEM
// ========================================
export const COMBO_WINDOW = 2000; // 2 seconds to maintain combo

// ========================================
// PARTICLE SYSTEM
// ========================================
export const PARTICLE_POOL_SIZE = 60; // 6 merges worth (10 particles each)
export const PARTICLES_PER_BURST = 10;

// ========================================
// BUTTON & INTERACTION
// ========================================
export const BUTTON_COOLDOWN = 1000; // 1 second cooldown between presses

// ========================================
// UI CONFIGURATION
// ========================================
export const UI_CONFIG = {
    // Info bubbles
    infoBubbleRadius: 0.08,
    infoBubble0Position: { x: -0.18, y: 0.55, z: 0 },
    infoBubble1Position: { x: 0, y: 0.55, z: 0 },
    infoBubble2Position: { x: 0.18, y: 0.55, z: 0 },
    
    // End panel
    endPanelWidth: 0.33,
    endPanelAspectRatio: 360 / 418, // height / width
    
    // Button
    buttonWidth: 0.18,
    buttonAspectRatio: 76 / 218, // height / width
    
    // Text sizes
    scoreFontSize: 0.03,
    timeFontSize: 0.03,
    gameOverFontSize: 0.035,
    endPanelScoreFontSize: 0.045,
    pointsLabelFontSize: 0.0175,
    
    // Danger line
    dangerLineOpacity: 0.5,
    dangerLineColor: 0xff4444,
    
    // Vertical guide line
    verticalLineHeight: 0.645,
    verticalLineWidth: 0.0035,
    verticalLineOpacity: 0.6
};

// ========================================
// MODEL PATHS
// ========================================
export const MODEL_PATHS = {
    fruits: (index) => `/static/fruit_${index}.glb`,
    container: '/static/container.glb',
    cloud: '/static/cloud.glb',
    font: '/static/fonts/nunito-extrabold.json',
    panelTexture: '/static/UI_PANEL-REF.png',
    buttonTexture: '/static/UI_BUTTON.png'
};

// ========================================
// SHADER PATHS
// ========================================
export const SHADER_PATHS = {
    fresnelVertex: '/static/shaders/fresnel_vertex.glsl',
    fresnelFragment: '/static/shaders/fresnel_fragment.glsl'
};

// ========================================
// PERFORMANCE SETTINGS
// ========================================
export const PERFORMANCE = {
    maxPixelRatio: 1.0, // Cap for mobile VR performance
    sphereSegments: 12, // Reduced for mobile VR
    containerModelScale: 0.5,
    cloudModelScale: 0.05
};

