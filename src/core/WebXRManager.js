import { XRButton } from 'three/addons/webxr/XRButton.js';

let xrButton = null;
let webxrSupported = false;
let xrSessionStartTime = null;
let compositionPositioned = false;

// Callbacks
let onSessionStartCallback = null;
let onSessionEndCallback = null;

/**
 * Initialize WebXR
 * @param {THREE.WebGLRenderer} renderer - Three.js renderer
 * @param {Function} onSessionStart - Callback when XR session starts
 * @param {Function} onSessionEnd - Callback when XR session ends
 */
export function initWebXR(renderer, onSessionStart = null, onSessionEnd = null) {
    onSessionStartCallback = onSessionStart;
    onSessionEndCallback = onSessionEnd;
    
    // Create XR button but hide it
    xrButton = XRButton.createButton(renderer, { 'optionalFeatures': ['hand-tracking'] });
    xrButton.style.display = 'none';
    document.body.appendChild(xrButton);
    
    // Get error message element
    const errorMessage = document.getElementById('webxr-error');
    
    // Check WebXR support
    if (navigator.xr) {
        navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
            webxrSupported = supported;
            if (!supported) {
                console.log('WebXR immersive-vr not supported on this device/browser');
            }
        }).catch((error) => {
            console.error('Error checking WebXR support:', error);
            webxrSupported = false;
        });
    } else {
        console.log('navigator.xr not available');
    }
    
    // Make entire page clickable for entering WebXR
    document.body.style.cursor = 'pointer';
    document.body.addEventListener('click', () => {
        if (!navigator.xr || !webxrSupported) {
            showWebXRError(errorMessage);
        } else {
            xrButton.click();
        }
    });
    
    // Add visual feedback
    document.body.style.transition = 'background-color 0.3s ease';
    document.body.addEventListener('mouseenter', () => {
        document.body.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
    });
    document.body.addEventListener('mouseleave', () => {
        document.body.style.backgroundColor = '';
    });
    
    // Track XR session state
    renderer.xr.addEventListener('sessionstart', () => {
        xrSessionStartTime = Date.now();
        compositionPositioned = false;
        document.body.classList.add('xr-presenting');
        
        if (onSessionStartCallback) {
            onSessionStartCallback();
        }
    });
    
    renderer.xr.addEventListener('sessionend', () => {
        xrSessionStartTime = null;
        compositionPositioned = false;
        document.body.classList.remove('xr-presenting');
        
        if (onSessionEndCallback) {
            onSessionEndCallback();
        }
    });
    
    console.log('WebXR initialized');
}

/**
 * Show WebXR error message
 * @param {HTMLElement} errorMessage - Error message element
 */
function showWebXRError(errorMessage) {
    if (errorMessage) {
        errorMessage.style.display = 'block';
        document.body.classList.add('webxr-error');
        document.body.style.cursor = 'default';
    }
}

/**
 * Auto-position composition at user's head height
 * @param {THREE.Object3D} baseComposition - Base composition object
 * @param {THREE.Camera} camera - Camera reference
 */
export function positionCompositionAtHeadHeight(baseComposition, camera) {
    if (compositionPositioned || !xrSessionStartTime) return;
    
    // Wait 1 second after WebXR session starts
    const elapsedTime = Date.now() - xrSessionStartTime;
    if (elapsedTime < 1000) {
        return;
    }
    
    // Get user's head position
    const headHeight = camera.position.y;
    const headDistance = camera.position.z;
    
    // Position composition below head height, in front of user
    baseComposition.position.set(0, headHeight - 0.2, headDistance - 1.85);
    
    compositionPositioned = true;
    console.log('Composition positioned at head height');
}

/**
 * Check if in XR session
 * @returns {boolean}
 */
export function isInXRSession() {
    return xrSessionStartTime !== null;
}

/**
 * Get time since XR session started
 * @returns {number} Time in milliseconds
 */
export function getXRSessionTime() {
    if (!xrSessionStartTime) return 0;
    return Date.now() - xrSessionStartTime;
}

/**
 * Reset composition positioning (for next session)
 */
export function resetCompositionPositioning() {
    compositionPositioned = false;
}

