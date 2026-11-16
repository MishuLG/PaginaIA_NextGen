/**
 * NextGen Cinematic Animations & Typography Reveals (High-Performance)
 * - Tiempos y curvas de aceleración optimizados para cero latencia visual
 * - Disparo temprano (start: 'top 93%') para eliminar retrasos al hacer scroll con la rueda
 * - fastScrollEnd y preventOverlaps activados para evitar acumulación de tweens
 * - Revelados escalonados fluidos y hardware acceleration friendly
 */

const NextGenAnimations = (function () {
  'use strict';

  function init() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('[NextGenAnimations] GSAP or ScrollTrigger not available.');
      return;
    }

    const isReduced = ScrollEngine.isReducedMotion();
    if (isReduced) {
      document.querySelectorAll('.reveal-on-scroll, .stagger-text, .clip-reveal').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.clipPath = 'none';
      });
      return;
    }

    // 1. Hero Stagger Animations (Snappy initial load)
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    heroTl
      .fromTo(
        '#hero-badge',
        { opacity: 0, y: -15, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, delay: 0.1 }
      )
      .fromTo(
        '.hero-title-line',
        { opacity: 0, y: 40, skewY: 2 },
        { opacity: 1, y: 0, skewY: 0, duration: 0.8, stagger: 0.1 },
        '-=0.4'
      )
      .fromTo(
        '#hero-description',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        '-=0.5'
      )
      .fromTo(
        '.hero-cta-btn',
        { opacity: 0, y: 15, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08 },
        '-=0.5'
      )
      .fromTo(
        '#hero-telemetry-hud',
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.6 },
        '-=0.4'
      );

    // 2. Section Headers Stagger & Lines Reveal (Early trigger for zero scroll lag)
    document.querySelectorAll('.section-header').forEach(header => {
      const badge = header.querySelector('.section-badge');
      const title = header.querySelector('.section-title');
      const desc = header.querySelector('.section-desc');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: header,
          start: 'top 93%', // Triggers instantly as soon as the top enters near viewport bottom
          toggleActions: 'play none none none',
          fastScrollEnd: true,
          preventOverlaps: true
        }
      });

      if (badge) {
        tl.fromTo(badge, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.5)' });
      }
      if (title) {
        tl.fromTo(title, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.25');
      }
      if (desc) {
        tl.fromTo(desc, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, '-=0.3');
      }
    });

    // 3. Clip-Path Diagonal Reveals for Educational Diagrams & Cards
    document.querySelectorAll('.clip-reveal').forEach(el => {
      gsap.fromTo(
        el,
        {
          clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
          opacity: 0,
          y: 25
        },
        {
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 92%',
            toggleActions: 'play none none none',
            fastScrollEnd: true,
            preventOverlaps: true
          }
        }
      );
    });

    // 4. Staggered Feature Cards with Snappy Entry
    document.querySelectorAll('.stagger-cards-grid').forEach(grid => {
      const cards = grid.querySelectorAll('.stagger-card');
      gsap.fromTo(
        cards,
        { opacity: 0, y: 30, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          stagger: 0.08, // Fast, crisp stagger
          ease: 'power2.out',
          scrollTrigger: {
            trigger: grid,
            start: 'top 90%',
            toggleActions: 'play none none none',
            fastScrollEnd: true,
            preventOverlaps: true
          }
        }
      );
    });

    // 5. Parallax Depth on Background Glow Orbs (GPU Transform Optimized)
    document.querySelectorAll('.parallax-orb').forEach((orb, i) => {
      const speed = parseFloat(orb.dataset.speed || (i % 2 === 0 ? '0.15' : '-0.15'));
      gsap.to(orb, {
        y: () => speed * 200,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true
        }
      });
    });

    // 6. Interactive Card Mouse Glow Follower (Throttled with requestAnimationFrame)
    document.querySelectorAll('.interactive-glow-card').forEach(card => {
      let isGlowScheduled = false;
      let lastX = 0;
      let lastY = 0;

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;

        if (!isGlowScheduled) {
          isGlowScheduled = true;
          requestAnimationFrame(() => {
            card.style.setProperty('--mouse-x', `${lastX}px`);
            card.style.setProperty('--mouse-y', `${lastY}px`);
            isGlowScheduled = false;
          });
        }
      }, { passive: true });
    });
  }

  return {
    init
  };
})();

// Export globally
window.NextGenAnimations = NextGenAnimations;
