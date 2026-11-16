/**
 * NextGen Main Application Controller & Orchestrator (Mobile & Desktop)
 * Integra de forma sinérgica Lenis, GSAP ScrollTrigger, Canvas Scroller, Auth y Comments
 */

const NextGenApp = (function () {
  'use strict';

  /**
   * Global Toast Notification Manager
   */
  function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const colors = {
      success: 'border-emerald-500/40 bg-emerald-950/90 text-emerald-200 shadow-emerald-500/10',
      error: 'border-red-500/40 bg-red-950/90 text-red-200 shadow-red-500/10',
      warning: 'border-amber-500/40 bg-amber-950/90 text-amber-200 shadow-amber-500/10',
      info: 'border-cyan-500/40 bg-slate-900/95 text-cyan-200 shadow-cyan-500/10'
    };

    const icons = {
      success: '<svg class="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>',
      error: '<svg class="w-4 h-4 sm:w-5 sm:h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>',
      warning: '<svg class="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>',
      info: '<svg class="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
    };

    toast.className = `flex items-center gap-2.5 sm:gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl border backdrop-blur-xl shadow-xl transition-all duration-300 transform translate-y-4 opacity-0 text-xs sm:text-sm font-medium ${colors[type] || colors.info}`;
    toast.innerHTML = `
      ${icons[type] || icons.info}
      <div class="flex-1">${message}</div>
      <button class="text-white/40 hover:text-white transition-colors p-1" onclick="this.parentElement.remove()">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    setTimeout(() => {
      toast.classList.add('translate-y-4', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  /**
   * Bind mobile menu drawer toggle
   */
  function bindMobileMenu() {
    const toggleBtn = document.getElementById('btn-mobile-menu-toggle');
    const drawer = document.getElementById('mobile-menu-drawer');
    const iconOpen = document.getElementById('icon-mobile-menu-open');
    const iconClose = document.getElementById('icon-mobile-menu-close');

    if (toggleBtn && drawer) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = drawer.classList.contains('hidden');
        if (isHidden) {
          drawer.classList.remove('hidden');
          iconOpen?.classList.add('hidden');
          iconClose?.classList.remove('hidden');
        } else {
          drawer.classList.add('hidden');
          iconOpen?.classList.remove('hidden');
          iconClose?.classList.add('hidden');
        }
      });

      // Close drawer when clicking any link
      drawer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          drawer.classList.add('hidden');
          iconOpen?.classList.remove('hidden');
          iconClose?.classList.add('hidden');
        });
      });

      // Close drawer when clicking outside
      document.addEventListener('click', (e) => {
        if (!drawer.contains(e.target) && !toggleBtn.contains(e.target) && !drawer.classList.contains('hidden')) {
          drawer.classList.add('hidden');
          iconOpen?.classList.remove('hidden');
          iconClose?.classList.add('hidden');
        }
      });
    }
  }

  /**
   * Bind smooth scroll triggers to navigation links
   */
  function bindNavigationLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId && targetId !== '#') {
          e.preventDefault();
          const isMobile = window.innerWidth < 768;
          ScrollEngine.scrollTo(targetId, { duration: 0.8, offset: isMobile ? -50 : -70 });
        }
      });
    });
  }

  /**
   * Application Bootstrapper
   */
  async function bootstrap() {
    console.info('[NextGenApp] Inicializando plataforma NextGen v2.5...');

    // 1. Initialize Lenis + GSAP synchronization engine
    ScrollEngine.init();

    // 2. Initialize Apple-style Canvas Scroller (pins 350vh, 80 frames, HiDPI Retina)
    await CanvasScroller.init({
      containerId: 'apple-canvas-container',
      canvasId: 'apple-scrub-canvas'
    });

    // 3. Initialize cinematic staggers, parallax and clip-path animations
    NextGenAnimations.init();

    // 4. Initialize Security and Authentication with json-server & fallback
    NextGenAuth.init();

    // 5. Initialize Interactive Comments Plaza (CRUD)
    NextGenComments.init();

    // 6. Initialize Real-time Telemetry HUD & Interactive Engineering Labs
    NextGenTelemetry.init();

    // 7. Bind navigation anchors and mobile menu
    bindNavigationLinks();
    bindMobileMenu();

    console.info('[NextGenApp] Plataforma NextGen operativa en Desktop y Móviles.');
  }

  // Self-start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

  return {
    showToast,
    bootstrap
  };
})();

// Export globally
window.NextGenApp = NextGenApp;
