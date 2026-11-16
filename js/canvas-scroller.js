/**
 * NextGen Apple-Style Canvas Scrubbing Engine (High Performance & Mobile Responsive)
 * - Pinning de 350vh con viewport sticky 100vh / 100dvh
 * - Renderizado en Canvas 2D vinculado a GSAP ScrollTrigger con scrub: true (cero input lag)
 * - Protección contra micro-redimensionados de barra de navegación en móviles
 * - Filtrado de redibujados redundantes para garantizar 60-120 FPS estables
 * - Cache de nodos DOM para evitar layout thrashing en eventos de rueda y touch
 * - Buffer HiDPI / Retina con Math.min(window.devicePixelRatio, 2)
 * - Algoritmo dinámico contain / cover optimizado
 */

const CanvasScroller = (function () {
  'use strict';

  let containerEl = null;
  let canvasEl = null;
  let ctx = null;
  let scrollTriggerInstance = null;
  let currentFrameIndex = -1;
  let framesCache = [];
  let isReducedMotion = false;
  let resizeObserver = null;
  let cachedFit = null;
  let lastCanvasW = 0;
  let lastCanvasH = 0;

  // Key static frame to display when reduced motion is preferred
  const KEY_STATIC_FRAME = 45;

  // Cached DOM elements for the narrative cards to avoid querySelector during scroll ticks
  let narrativeCards = [];

  /**
   * Calculate contain/cover dynamic scaling and centered destination coordinates
   */
  function calculateFit(sourceWidth, sourceHeight, targetWidth, targetHeight, mode = 'cover') {
    if (cachedFit && lastCanvasW === targetWidth && lastCanvasH === targetHeight) {
      return cachedFit;
    }

    const sourceRatio = sourceWidth / sourceHeight;
    const targetRatio = targetWidth / targetHeight;
    let renderWidth, renderHeight;

    if (mode === 'cover') {
      if (targetRatio > sourceRatio) {
        renderWidth = targetWidth;
        renderHeight = targetWidth / sourceRatio;
      } else {
        renderHeight = targetHeight;
        renderWidth = targetHeight * sourceRatio;
      }
    } else { // 'contain'
      if (targetRatio > sourceRatio) {
        renderHeight = targetHeight;
        renderWidth = targetHeight * sourceRatio;
      } else {
        renderWidth = targetWidth;
        renderHeight = targetWidth / sourceRatio;
      }
    }

    const x = (targetWidth - renderWidth) / 2;
    const y = (targetHeight - renderHeight) / 2;

    cachedFit = { x, y, width: renderWidth, height: renderHeight };
    lastCanvasW = targetWidth;
    lastCanvasH = targetHeight;

    return cachedFit;
  }

  /**
   * Adjust canvas internal buffer size according to Retina/HiDPI scaling
   * with protection against mobile browser address bar height jitter
   */
  function resizeCanvas() {
    if (!canvasEl || !ctx) return;

    const rect = canvasEl.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const targetWidth = Math.floor(rect.width * dpr);
    const targetHeight = Math.floor(rect.height * dpr);

    // If only tiny height jitter on mobile touch scroll (address bar collapsing), don't trigger full canvas buffer wipe
    const isTinyMobileJitter = canvasEl.width === targetWidth && Math.abs(canvasEl.height - targetHeight) < 75;

    if (!isTinyMobileJitter && (canvasEl.width !== targetWidth || canvasEl.height !== targetHeight)) {
      canvasEl.width = targetWidth;
      canvasEl.height = targetHeight;
      cachedFit = null; // Invalidate fit cache on size change
    }

    renderFrame(currentFrameIndex >= 0 ? currentFrameIndex : 0, true);
  }

  /**
   * Render a specific frame into the Canvas with redundant draw skip
   */
  function renderFrame(index, force = false) {
    if (!ctx || !canvasEl) return;

    const targetIndex = Math.max(0, Math.min(FrameGenerator.TOTAL_FRAMES - 1, index));

    // PERFORMANCE OPTIMIZATION: If frame hasn't changed and not forced, skip redraw completely
    if (!force && targetIndex === currentFrameIndex && framesCache.length > 0) {
      return;
    }

    currentFrameIndex = targetIndex;
    const targetW = canvasEl.width;
    const targetH = canvasEl.height;

    const frameItem = framesCache[currentFrameIndex];

    if (frameItem) {
      // Direct fast GPU blit
      const fit = calculateFit(FrameGenerator.WIDTH, FrameGenerator.HEIGHT, targetW, targetH, 'cover');
      ctx.drawImage(frameItem, fit.x, fit.y, fit.width, fit.height);
    } else {
      // Fallback: draw directly on-the-fly if frame sequence is still compiling
      ctx.clearRect(0, 0, targetW, targetH);
      ctx.save();
      const scaleX = targetW / FrameGenerator.WIDTH;
      const scaleY = targetH / FrameGenerator.HEIGHT;
      const scale = Math.max(scaleX, scaleY);
      const offsetX = (targetW - FrameGenerator.WIDTH * scale) / 2;
      const offsetY = (targetH - FrameGenerator.HEIGHT * scale) / 2;
      
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);
      FrameGenerator.drawFrameToContext(ctx, currentFrameIndex);
      ctx.restore();
    }
  }

  /**
   * Update narrative cards smoothly without layout thrashing
   */
  function updateNarrativeOverlays(progress) {
    for (let i = 0; i < narrativeCards.length; i++) {
      const card = narrativeCards[i];
      if (!card.el) continue;

      const shouldBeVisible = progress >= card.start && progress <= card.end;

      if (shouldBeVisible !== card.isVisible) {
        card.isVisible = shouldBeVisible;
        if (shouldBeVisible) {
          card.el.classList.add('opacity-100', 'translate-y-0');
          card.el.classList.remove('opacity-0', 'translate-y-8', 'pointer-events-none');
        } else {
          card.el.classList.add('opacity-0', 'translate-y-8', 'pointer-events-none');
          card.el.classList.remove('opacity-100', 'translate-y-0');
        }
      }
    }
  }

  /**
   * Initialize canvas pinning and ScrollTrigger link
   */
  async function init(options = {}) {
    containerEl = document.getElementById(options.containerId || 'apple-canvas-container');
    canvasEl = document.getElementById(options.canvasId || 'apple-scrub-canvas');

    if (!containerEl || !canvasEl) {
      console.warn('[CanvasScroller] Container or canvas element not found.');
      return;
    }

    // Use desynchronized 2D context for ultra-low latency rendering
    ctx = canvasEl.getContext('2d', { alpha: false, desynchronized: true });
    isReducedMotion = ScrollEngine.isReducedMotion();

    if (isReducedMotion) {
      canvasEl.setAttribute('aria-hidden', 'true');
    }

    // Cache narrative card elements
    narrativeCards = [
      { el: document.getElementById('scrub-card-1'), start: 0.02, end: 0.26, isVisible: false },
      { el: document.getElementById('scrub-card-2'), start: 0.28, end: 0.52, isVisible: false },
      { el: document.getElementById('scrub-card-3'), start: 0.54, end: 0.76, isVisible: false },
      { el: document.getElementById('scrub-card-4'), start: 0.78, end: 0.98, isVisible: false }
    ];

    // Set up resize handler with ResizeObserver
    resizeCanvas();
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => resizeCanvas());
      resizeObserver.observe(canvasEl);
    } else {
      window.addEventListener('resize', resizeCanvas);
    }

    // If reduced motion is requested, render static representative frame and do not scrub
    if (isReducedMotion) {
      FrameGenerator.drawFrameToContext(ctx, KEY_STATIC_FRAME);
      const fallbackNarrative = document.getElementById('scrub-reduced-motion-card');
      if (fallbackNarrative) {
        fallbackNarrative.classList.remove('hidden');
      }
      return;
    }

    // Staged Preload of Frames using FrameGenerator
    const loadingBar = document.getElementById('canvas-preloader-bar');
    const loadingText = document.getElementById('canvas-preloader-text');
    const preloaderContainer = document.getElementById('canvas-preloader');

    FrameGenerator.generateFrames((progress) => {
      const pct = Math.round(progress * 100);
      if (loadingBar) loadingBar.style.width = `${pct}%`;
      if (loadingText) loadingText.textContent = `COMPILANDO SECUENCIA 2D: ${pct}%`;
    }).then((bitmaps) => {
      framesCache = bitmaps;
      if (preloaderContainer) {
        if (typeof gsap !== 'undefined') {
          gsap.to(preloaderContainer, {
            opacity: 0,
            duration: 0.35,
            onComplete: () => preloaderContainer.classList.add('hidden')
          });
        } else {
          preloaderContainer.classList.add('hidden');
        }
      }
      renderFrame(currentFrameIndex >= 0 ? currentFrameIndex : 0, true);
    });

    // Create ScrollTrigger scrubbing instance linked DIRECTLY to scroll progress (scrub: true for instant response)
    if (typeof ScrollTrigger !== 'undefined') {
      scrollTriggerInstance = ScrollTrigger.create({
        trigger: containerEl,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        fastScrollEnd: true,
        preventOverlaps: true,
        onUpdate: (self) => {
          const progress = self.progress;
          const frameIndex = Math.min(
            FrameGenerator.TOTAL_FRAMES - 1,
            Math.floor(progress * FrameGenerator.TOTAL_FRAMES)
          );
          renderFrame(frameIndex);
          updateNarrativeOverlays(progress);
        }
      });
    }
  }

  return {
    init,
    resize: resizeCanvas,
    renderFrame
  };
})();

// Export globally
window.CanvasScroller = CanvasScroller;
