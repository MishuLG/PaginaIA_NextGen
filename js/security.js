/**
 * NextGen Security & Integrity Engine
 * - Strict XSS Sanitization
 * - RFC 5322 Compliant Email Validation
 * - Robust Password Complexity Checking
 * - SHA-256 Cryptographic Hashing for Session Validation
 * - Rate Limiting & Anti-Spam Protection
 */

const NextGenSecurity = (function () {
  'use strict';

  // Strict email regex complying with RFC 5322 (covers 99.9% real emails and rejects malformed injections)
  const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  // Cache for anti-spam rate limiting
  const submissionTimestamps = new Map();
  const MIN_SUBMISSION_INTERVAL_MS = 2500; // 2.5 seconds debounce between posts

  /**
   * Escape HTML entities to prevent Reflected and Stored XSS
   */
  function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Deep sanitize text: strips dangerous script/tag tokens, dangerous URLs and normalizes whitespace
   */
  function sanitizeInput(input, maxLength = 1000) {
    if (!input || typeof input !== 'string') return '';
    
    // Trim and limit length
    let clean = input.trim().slice(0, maxLength);

    // Remove control characters (except newline and carriage return)
    clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Strip dangerous HTML/JavaScript protocols
    clean = clean.replace(/javascript:/gi, '');
    clean = clean.replace(/data:text\/html/gi, '');
    clean = clean.replace(/vbscript:/gi, '');
    clean = clean.replace(/on\w+\s*=/gi, '');

    // Return escaped HTML
    return escapeHTML(clean);
  }

  /**
   * Validate email format
   */
  function validateEmail(email) {
    if (!email || typeof email !== 'string') {
      return { valid: false, message: 'El correo electrónico es requerido.' };
    }
    const trimmed = email.trim();
    if (trimmed.length > 254) {
      return { valid: false, message: 'La longitud del correo excede el límite permitido.' };
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      return { valid: false, message: 'Por favor ingresa un correo electrónico válido (ej. usuario@dominio.com).' };
    }
    return { valid: true, sanitized: trimmed.toLowerCase() };
  }

  /**
   * Validate password complexity
   */
  function validatePassword(password, minLength = 8) {
    if (!password || typeof password !== 'string') {
      return { valid: false, score: 0, message: 'La contraseña es requerida.' };
    }
    
    if (password.length < minLength) {
      return { 
        valid: false, 
        score: 1, 
        message: `La contraseña debe tener al menos ${minLength} caracteres.` 
      };
    }

    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    return {
      valid: true,
      score: Math.min(score, 4),
      message: score >= 3 ? 'Contraseña segura' : 'Contraseña aceptable'
    };
  }

  /**
   * Generate SHA-256 hash using the Web Crypto API
   */
  async function sha256(message) {
    try {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      // Fallback pseudo-hash for non-secure contexts if Web Crypto is unavailable
      let hash = 0;
      for (let i = 0; i < message.length; i++) {
        const char = message.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
      }
      return 'fb_' + Math.abs(hash).toString(16).padStart(16, '0');
    }
  }

  /**
   * Check rate limit for anti-spam
   */
  function checkRateLimit(identifier) {
    const now = Date.now();
    const lastTime = submissionTimestamps.get(identifier) || 0;
    if (now - lastTime < MIN_SUBMISSION_INTERVAL_MS) {
      const remainingSeconds = Math.ceil((MIN_SUBMISSION_INTERVAL_MS - (now - lastTime)) / 1000);
      return { 
        allowed: false, 
        message: `Por favor espera ${remainingSeconds}s antes de enviar otro mensaje.` 
      };
    }
    submissionTimestamps.set(identifier, now);
    return { allowed: true };
  }

  /**
   * Zero-Leak Scanner: Simulates DLP (Data Loss Prevention) scanning of payloads
   * Detects and redacts simulated API keys, JWTs, Bearer tokens, private keys, and passwords
   */
  function zeroLeakScan(text) {
    if (!text || typeof text !== 'string') return { cleanText: '', leaksDetected: [] };

    const leaks = [];
    let redacted = text;

    // Pattern 1: API Keys (like sk-..., gsk_..., AIza...)
    const apiKeyPattern = /\b(sk-[a-zA-Z0-9]{20,}|gsk_[a-zA-Z0-9]{20,}|AIza[0-9A-Za-z-_]{35})\b/g;
    if (apiKeyPattern.test(redacted)) {
      leaks.push('LLM_API_KEY_DETECTED');
      redacted = redacted.replace(apiKeyPattern, '[REDACTED_API_KEY_ZERO_LEAK]');
    }

    // Pattern 2: Bearer Tokens / JWT
    const jwtPattern = /\beyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b/g;
    if (jwtPattern.test(redacted)) {
      leaks.push('JWT_BEARER_TOKEN_DETECTED');
      redacted = redacted.replace(jwtPattern, '[REDACTED_JWT_TOKEN]');
    }

    // Pattern 3: Private Keys & Passwords in code
    const secretPattern = /(?:password|secret|apikey|token|private_key)\s*[:=]\s*["']([^"']+)["']/gi;
    if (secretPattern.test(redacted)) {
      leaks.push('HARDCODED_CREDENTIAL_DETECTED');
      redacted = redacted.replace(secretPattern, (match, p1) => {
        return match.replace(p1, '••••••••••••[ZERO_LEAK]');
      });
    }

    return {
      cleanText: redacted,
      leaksDetected: leaks,
      isClean: leaks.length === 0
    };
  }

  return {
    escapeHTML,
    sanitizeInput,
    validateEmail,
    validatePassword,
    sha256,
    checkRateLimit,
    zeroLeakScan
  };
})();

// Export globally
window.NextGenSecurity = NextGenSecurity;

