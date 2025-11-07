import gsap from 'gsap';

/**
 * Initialize GSAP ticker with Three.js clock
 * @param {THREE.Clock} clock - Three.js clock instance
 */
export function initGSAP(clock) {
    // GSAP will handle its own ticker
    console.log('GSAP initialized');
}

/**
 * Update GSAP ticker (call in animation loop)
 * @param {number} delta - Delta time
 */
export function updateGSAP(delta) {
    gsap.ticker.tick(delta);
}

/**
 * Animate scale up (pop in)
 * @param {THREE.Object3D} object - Object to animate
 * @param {number} targetScale - Target scale
 * @param {number} duration - Animation duration
 * @param {string} ease - GSAP ease
 * @returns {gsap.core.Tween}
 */
export function animateScaleUp(object, targetScale = 1, duration = 0.3, ease = "back.out(1.7)") {
    return gsap.to(object.scale, {
        x: targetScale,
        y: targetScale,
        z: targetScale,
        duration,
        ease
    });
}

/**
 * Animate scale down (pop out)
 * @param {THREE.Object3D} object - Object to animate
 * @param {number} duration - Animation duration
 * @param {string} ease - GSAP ease
 * @returns {gsap.core.Tween}
 */
export function animateScaleDown(object, duration = 0.3, ease = "back.in(1.7)") {
    return gsap.to(object.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration,
        ease
    });
}

/**
 * Animate pop (scale up then back to original)
 * @param {THREE.Object3D} object - Object to animate
 * @param {number} popScale - Peak scale multiplier
 * @param {number} duration - Animation duration
 * @returns {gsap.core.Tween}
 */
export function animatePop(object, popScale = 1.3, duration = 0.1) {
    const currentScale = object.scale.x;
    return gsap.to(object.scale, {
        x: currentScale * popScale,
        y: currentScale * popScale,
        z: currentScale * popScale,
        duration,
        ease: "power2.out",
        yoyo: true,
        repeat: 1
    });
}

/**
 * Animate fade in
 * @param {THREE.Material} material - Material to animate
 * @param {number} targetOpacity - Target opacity
 * @param {number} duration - Animation duration
 * @returns {gsap.core.Tween}
 */
export function animateFadeIn(material, targetOpacity = 1, duration = 0.3) {
    return gsap.to(material, {
        opacity: targetOpacity,
        duration,
        ease: "power2.out"
    });
}

/**
 * Animate fade out
 * @param {THREE.Material} material - Material to animate
 * @param {number} duration - Animation duration
 * @returns {gsap.core.Tween}
 */
export function animateFadeOut(material, duration = 0.3) {
    return gsap.to(material, {
        opacity: 0,
        duration,
        ease: "power2.in"
    });
}

/**
 * Animate stagger scale down (for multiple objects)
 * @param {Array<THREE.Object3D>} objects - Objects to animate
 * @param {number} stagger - Stagger delay
 * @param {number} duration - Animation duration
 * @param {Function} onComplete - Callback when all animations complete
 * @returns {gsap.core.Timeline}
 */
export function animateStaggerScaleDown(objects, stagger = 0.01, duration = 0.2, onComplete = null) {
    return gsap.to(objects.map(obj => obj.scale), {
        x: 0,
        y: 0,
        z: 0,
        duration,
        stagger,
        ease: "power2.in",
        onComplete
    });
}

/**
 * Get GSAP instance
 * @returns {gsap}
 */
export function getGSAP() {
    return gsap;
}

