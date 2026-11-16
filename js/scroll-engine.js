/**
 * NextGen Scroll & Physics Engine (Ultra-Optimized)
 * Sincronización instantánea entre Lenis Smooth Scroll y GSAP ScrollTrigger
 * - Duración optimizada (0.7s) para eliminar cualquier retardo o efecto flotante
 * - Cero delay en rueda de ratón (wheel responsiveness inmediata)
 * - Ticker acoplado con lagSmoothing(0) y autoRaf: false
 */

const ScrollEngine = (function () {
  'use strict';

  let lenisInstance = null;
  let isReducedMotionActive = false;
  const subscribers = [];

  function checkReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function init() {
    isReducedMotionActive = checkReducedMotion();

    // Listen for changes in reduced-motion preference dynamically
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      try {
        mediaQuery.addEventListener('change', (e) => {
          isReducedMotionActive = e.matches;
          handleReducedMotionChange(e.matches);
        });
      } catch (err) {
        mediaQuery.addListener((e) => {
          isReducedMotionActive = e.matches;
          handleReducedMotionChange(e.matches);
        });
      }
    }

    // Register GSAP ScrollTrigger plugin
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    } else {
      console.warn('[ScrollEngine] GSAP or ScrollTrigger is not loaded yet.');
    }

    // If user prefers reduced motion, do not initialize smooth inertia scroll
    if (isReducedMotionActive) {
      console.info('[ScrollEngine] Prefers-reduced-motion is active. Inertia scroll disabled.');
      document.documentElement.classList.add('reduced-motion');
      return;
    }

    // Initialize Lenis with snappy responsiveness (0.7s duration instead of 1.15s to eliminate mouse wheel drag)
    if (typeof Lenis !== 'undefined') {
      lenisInstance = new Lenis({
        duration: 0.7, // Snappy, instant response to wheel without sluggishness
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.2,
        infinite: false,
        autoRaf: false // GSAP ticker drives the render clock
      });

      // Synchronize Lenis scroll position directly with ScrollTrigger
      if (typeof ScrollTrigger !== 'undefined') {
        lenisInstance.on('scroll', () => {
          ScrollTrigger.update();
        });
      }

      // Couple Lenis into GSAP's central high-precision ticker loop
      if (typeof gsap !== 'undefined') {
        gsap.ticker.add((time) => {
          if (lenisInstance) {
            lenisInstance.raf(time * 1000);
          }
        });

        // Set lag smoothing to 0 to prevent any stutter or desync during heavy scrubbing
        gsap.ticker.lagSmoothing(0);
      }

      console.info('[ScrollEngine] Lenis + GSAP ScrollTrigger acoplados en modo Ultra-Performance.');
    } else {
      console.warn('[ScrollEngine] Lenis library not found. Falling back to native scrolling.');
    }
  }

  function handleReducedMotionChange(reduced) {
    if (reduced) {
      document.documentElement.classList.add('reduced-motion');
      if (lenisInstance) {
        lenisInstance.destroy();
        lenisInstance = null;
      }
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.getAll().forEach(st => st.disable(false));
      }
    } else {
      document.documentElement.classList.remove('reduced-motion');
      init();
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    }
    subscribers.forEach(cb => cb({ reducedMotion: reduced }));
  }

  function onReducedMotionChange(callback) {
    if (typeof callback === 'function') {
      subscribers.push(callback);
    }
  }

  function scrollTo(target, options = {}) {
    if (lenisInstance && !isReducedMotionActive) {
      lenisInstance.scrollTo(target, {
        offset: options.offset || 0,
        duration: options.duration || 0.8,
        immediate: options.immediate || false
      });
    } else {
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (el) {
        el.scrollIntoView({ behavior: isReducedMotionActive ? 'auto' : 'smooth' });
      }
    }
  }

  return {
    init,
    scrollTo,
    getLenis: () => lenisInstance,
    isReducedMotion: () => isReducedMotionActive,
    onReducedMotionChange
  };
})();

// Export globally
window.ScrollEngine = ScrollEngine;
