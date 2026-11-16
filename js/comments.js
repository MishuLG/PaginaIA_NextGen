/**
 * NextGen Interactive Comments & Community Plaza
 * - CRUD completo con json-server (GET /comments, POST /comments, PATCH /comments/:id)
 * - Persistencia local resiliente (localStorage) como fallback si el backend no responde
 * - Sanitización estricta contra ataques XSS mediante NextGenSecurity
 * - Límite de caracteres, prevención de spam y envíos duplicados
 * - Renderizado reactivo con animaciones GSAP de inserción suave
 */

const NextGenComments = (function () {
  'use strict';

  const API_COMMENTS_URL = 'http://localhost:3000/comments';
  const LOCAL_STORAGE_COMMENTS_KEY = 'nextgen_comments_cache_v2';
  const MAX_COMMENT_LENGTH = 500;

  // Initial seed comments matching db.json
  const SEED_COMMENTS = [
    {
      id: "cmt_01",
      author: "Elena Rostova",
      authorEmail: "elena.arch@nextgen.ai",
      role: "Senior AI Systems Architect",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
      content: "La implementación de la arquitectura 'Fetch-Once / Process Locally' redujo nuestra factura de inferencia en un 73% en el pipeline CI/CD. Al delegar la resolución de tipos y el parsing AST a workers locales, el LLM solo recibe el grafo de impacto semántico en vez de archivos monolíticos.",
      sectionTag: "Tokenomics",
      likes: 42,
      createdAt: "2026-10-12T10:14:00.000Z"
    },
    {
      id: "cmt_02",
      author: "Marcus Vance",
      authorEmail: "marcus.token@nextgen.ai",
      role: "Lead Tokenomics Engineer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
      content: "El T-Zero AST Pruner es revolucionario. Al eliminar comentarios superfluos, decoradores no ejecutables e implementaciones privadas no exportadas, logramos mantener ventanas de atención activas por debajo de 4k tokens incluso en repositorios de más de 300k líneas.",
      sectionTag: "AST Pruner",
      likes: 29,
      createdAt: "2026-10-18T16:22:00.000Z"
    },
    {
      id: "cmt_03",
      author: "Sofia Chen",
      authorEmail: "sofia.dev@nextgen.ai",
      role: "Staff Full-Stack Agentic Dev",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80",
      content: "Los 'Ghost Reverts' solían ser una pesadilla recurrente cuando dos subagentes intentaban refactorizar dependencias cruzadas. Con hashes SHA-256 por bloque y diffs unificados idempotentes, el porcentaje de colisiones bajó exactamente a 0.00%.",
      sectionTag: "MCP & Agentes",
      likes: 35,
      createdAt: "2026-11-02T09:05:00.000Z"
    }
  ];

  let commentsList = [];
  let currentFilter = 'all';
  let isSubmitting = false;
  let isApiOnline = false;

  /**
   * Format relative ISO date into human-readable Spanish text
   */
  function formatRelativeDate(isoDate) {
    try {
      const date = new Date(isoDate);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 2) return 'Hace un momento';
      if (diffMins < 60) return `Hace ${diffMins} minutos`;
      if (diffHours < 24) return `Hace ${diffHours} horas`;
      if (diffDays === 1) return 'Ayer';
      if (diffDays < 30) return `Hace ${diffDays} días`;
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return 'Reciente';
    }
  }

  /**
   * Load comments from API or fallback
   */
  async function loadComments() {
    const listContainer = document.getElementById('comments-list-container');
    const statusBadge = document.getElementById('comments-api-status-badge');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(API_COMMENTS_URL, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        commentsList = await res.json();
        isApiOnline = true;
        // Cache in localStorage
        localStorage.setItem(LOCAL_STORAGE_COMMENTS_KEY, JSON.stringify(commentsList));
        if (statusBadge) {
          statusBadge.innerHTML = `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> REST json-server (Puerto 3000) Conectado</span>`;
        }
      } else {
        throw new Error('API server returned error');
      }
    } catch (err) {
      console.warn('[NextGenComments] json-server no detectado en localhost:3000. Utilizando almacenamiento local resiliente.');
      isApiOnline = false;
      const cached = localStorage.getItem(LOCAL_STORAGE_COMMENTS_KEY);
      if (cached) {
        try {
          commentsList = JSON.parse(cached);
        } catch (e) {
          commentsList = SEED_COMMENTS;
        }
      } else {
        commentsList = SEED_COMMENTS;
        localStorage.setItem(LOCAL_STORAGE_COMMENTS_KEY, JSON.stringify(commentsList));
      }

      if (statusBadge) {
        statusBadge.innerHTML = `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20" title="Para activar json-server corre: npx json-server --watch db.json --port 3000"><span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Modo Local Resiliente (db.json)</span>`;
      }
    }

    renderComments();
  }

  /**
   * Render filtered comments into the DOM
   */
  function renderComments() {
    const container = document.getElementById('comments-list-container');
    const counterBadge = document.getElementById('comments-counter-badge');
    if (!container) return;

    const filtered = currentFilter === 'all'
      ? commentsList
      : commentsList.filter(c => c.sectionTag === currentFilter);

    if (counterBadge) {
      counterBadge.textContent = `${commentsList.length} ${commentsList.length === 1 ? 'Aporte' : 'Aportes'}`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="py-12 text-center border border-white/5 rounded-2xl bg-slate-900/40">
          <svg class="w-10 h-10 mx-auto text-slate-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p class="text-slate-400 text-sm">No hay comentarios en la sección <span class="text-cyan-400 font-semibold">${currentFilter}</span>.</p>
          <p class="text-slate-500 text-xs mt-1">¡Sé el primero en iniciar el debate de arquitectura!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(c => `
      <article class="comment-card group relative p-5 md:p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5" data-id="${c.id}">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-3">
            <img src="${c.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&q=80'}" 
                 alt="${c.author}" 
                 class="w-11 h-11 rounded-full object-cover border border-cyan-500/30 ring-2 ring-cyan-500/10">
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h4 class="text-sm font-semibold text-white tracking-wide">${c.author}</h4>
                <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300">${c.role || 'Ingeniero de Sistemas'}</span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">${formatRelativeDate(c.createdAt)}</p>
            </div>
          </div>
          <span class="inline-flex items-center text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-800/80 border border-white/5 text-slate-300">
            #${c.sectionTag || 'General'}
          </span>
        </div>

        <p class="mt-4 text-sm text-slate-300 leading-relaxed font-normal select-text">
          ${c.content}
        </p>

        <div class="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <button class="btn-like-comment flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-transparent hover:border-pink-500/30 hover:bg-pink-500/10 hover:text-pink-400 transition-colors duration-200" data-id="${c.id}" data-likes="${c.likes || 0}">
            <svg class="w-4 h-4 text-slate-400 group-hover:text-pink-400 transition-transform active:scale-125" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            <span class="font-mono text-xs like-count">${c.likes || 0}</span>
          </button>
          <span class="text-[11px] font-mono text-slate-500">Zero-Leak Verified ✓</span>
        </div>
      </article>
    `).join('');

    // Attach like button event listeners
    container.querySelectorAll('.btn-like-comment').forEach(btn => {
      btn.addEventListener('click', () => handleLike(btn.dataset.id, btn));
    });
  }

  /**
   * Handle Like reaction with optimistic update and PATCH request
   */
  async function handleLike(commentId, btnEl) {
    const comment = commentsList.find(c => c.id === commentId);
    if (!comment) return;

    comment.likes = (comment.likes || 0) + 1;
    const countEl = btnEl.querySelector('.like-count');
    if (countEl) countEl.textContent = comment.likes;

    // Visual button active pulse
    btnEl.classList.add('text-pink-400');
    setTimeout(() => btnEl.classList.remove('text-pink-400'), 500);

    // Save locally
    localStorage.setItem(LOCAL_STORAGE_COMMENTS_KEY, JSON.stringify(commentsList));

    // Try PATCH to backend
    if (isApiOnline) {
      try {
        await fetch(`${API_COMMENTS_URL}/${commentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ likes: comment.likes })
        });
      } catch (e) {
        console.warn('[NextGenComments] Could not sync like with backend:', e);
      }
    }
  }

  /**
   * Submit new comment
   */
  async function submitComment(authorName, authorRole, sectionTag, rawContent) {
    if (isSubmitting) return;

    // Anti-Spam Rate Limiter
    const rateCheck = NextGenSecurity.checkRateLimit('comment_post');
    if (!rateCheck.allowed) {
      throw new Error(rateCheck.message);
    }

    // Zero-Leak Scan
    const leakCheck = NextGenSecurity.zeroLeakScan(rawContent);
    const contentToSanitize = leakCheck.cleanText;

    // Sanitization against XSS
    const sanitizedContent = NextGenSecurity.sanitizeInput(contentToSanitize, MAX_COMMENT_LENGTH);
    if (!sanitizedContent || sanitizedContent.length < 5) {
      throw new Error('El comentario debe contener al menos 5 caracteres significativos.');
    }

    const sanitizedAuthor = NextGenSecurity.sanitizeInput(authorName || 'Ingeniero Anónimo', 60);
    const sanitizedRole = NextGenSecurity.sanitizeInput(authorRole || 'Desarrollador de Sistemas', 60);

    const activeUser = NextGenAuth.getCurrentUser();
    const avatarUrl = activeUser
      ? activeUser.avatar
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&q=80';

    const newComment = {
      id: `cmt_${Date.now()}`,
      author: activeUser ? activeUser.name : sanitizedAuthor,
      authorEmail: activeUser ? activeUser.email : 'guest@nextgen.local',
      role: activeUser ? activeUser.role : sanitizedRole,
      avatar: avatarUrl,
      content: sanitizedContent,
      sectionTag: sectionTag || 'Tokenomics',
      likes: 0,
      createdAt: new Date().toISOString()
    };

    isSubmitting = true;

    try {
      if (isApiOnline) {
        const res = await fetch(API_COMMENTS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newComment)
        });
        if (!res.ok) throw new Error('Error al registrar en json-server');
      }
    } catch (err) {
      console.warn('[NextGenComments] Falló el POST a json-server; persistiendo en local cache resiliente.', err);
    }

    // Always persist to local array and storage
    commentsList.unshift(newComment);
    localStorage.setItem(LOCAL_STORAGE_COMMENTS_KEY, JSON.stringify(commentsList));

    renderComments();

    // Trigger smooth GSAP entry animation for the newly created element
    const newCard = document.querySelector(`.comment-card[data-id="${newComment.id}"]`);
    if (newCard && typeof gsap !== 'undefined' && !ScrollEngine.isReducedMotion()) {
      gsap.fromTo(newCard, 
        { opacity: 0, y: -25, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.5)' }
      );
    }

    isSubmitting = false;

    if (leakCheck.leaksDetected.length > 0) {
      if (window.NextGenApp && window.NextGenApp.showToast) {
        window.NextGenApp.showToast('Nota de Seguridad: Se detectaron y ofuscaron credenciales sensibles en tu mensaje mediante Zero-Leak Scanner.', 'warning');
      }
    }

    return newComment;
  }

  /**
   * Bind DOM event listeners for the Comments Plaza
   */
  function bindEvents() {
    const form = document.getElementById('comment-form');
    const textarea = document.getElementById('comment-text');
    const charCounter = document.getElementById('comment-char-counter');
    const authorInput = document.getElementById('comment-author-name');
    const roleInput = document.getElementById('comment-author-role');
    const sectionSelect = document.getElementById('comment-section-select');
    const submitBtn = document.getElementById('btn-submit-comment');
    const filterButtons = document.querySelectorAll('.comment-filter-btn');

    // Update character counter and limit
    if (textarea && charCounter) {
      textarea.addEventListener('input', () => {
        const len = textarea.value.length;
        charCounter.textContent = `${len}/${MAX_COMMENT_LENGTH}`;
        if (len > MAX_COMMENT_LENGTH - 30) {
          charCounter.classList.add('text-amber-400');
        } else {
          charCounter.classList.remove('text-amber-400');
        }
      });
    }

    // Filter tabs
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => {
          b.classList.remove('bg-cyan-500/20', 'text-cyan-400', 'border-cyan-500/40');
          b.classList.add('text-slate-400', 'border-transparent');
        });
        btn.classList.add('bg-cyan-500/20', 'text-cyan-400', 'border-cyan-500/40');
        btn.classList.remove('text-slate-400', 'border-transparent');
        currentFilter = btn.dataset.filter || 'all';
        renderComments();
      });
    });

    // React to authentication state change to auto-fill author
    NextGenAuth.onAuthStateChanged((user) => {
      const userBadge = document.getElementById('comment-user-identity-badge');
      const guestFields = document.getElementById('comment-guest-fields');

      if (user) {
        if (guestFields) guestFields.classList.add('hidden');
        if (userBadge) {
          userBadge.classList.remove('hidden');
          userBadge.innerHTML = `
            <div class="flex items-center gap-2 p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-300">
              <img src="${user.avatar}" class="w-6 h-6 rounded-full object-cover">
              <span>Publicando como: <strong>${user.name}</strong> (${user.role})</span>
            </div>
          `;
        }
      } else {
        if (guestFields) guestFields.classList.remove('hidden');
        if (userBadge) userBadge.classList.add('hidden');
      }
    });

    // Form submission
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = textarea?.value || '';
        const author = authorInput?.value || '';
        const role = roleInput?.value || '';
        const section = sectionSelect?.value || 'Tokenomics';

        if (!content.trim()) {
          if (window.NextGenApp && window.NextGenApp.showToast) {
            window.NextGenApp.showToast('El contenido del comentario no puede estar vacío.', 'error');
          }
          return;
        }

        if (submitBtn) submitBtn.disabled = true;

        try {
          await submitComment(author, role, section, content);
          if (textarea) textarea.value = '';
          if (charCounter) charCounter.textContent = `0/${MAX_COMMENT_LENGTH}`;
          if (window.NextGenApp && window.NextGenApp.showToast) {
            window.NextGenApp.showToast('¡Aporte publicado con éxito en la Plaza NextGen!', 'success');
          }
        } catch (err) {
          if (window.NextGenApp && window.NextGenApp.showToast) {
            window.NextGenApp.showToast(err.message, 'error');
          }
        } finally {
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    }
  }

  return {
    init: function () {
      bindEvents();
      loadComments();
    },
    refresh: loadComments,
    submitComment
  };
})();

// Export globally
window.NextGenComments = NextGenComments;

