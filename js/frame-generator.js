/**
 * NextGen Neural Frame Sequence Generator
 * Genera una secuencia de 80 fotogramas cinemáticos de ultra-alta definición
 * utilizando OffscreenCanvas y createImageBitmap() para un scrubbing fluido a 60 FPS
 * estilo Apple Hardware Showcase.
 */

const FrameGenerator = (function () {
  'use strict';

  const TOTAL_FRAMES = 80;
  const WIDTH = 1280;
  const HEIGHT = 720;
  const frames = [];
  let isGenerating = false;
  let isReady = false;

  /**
   * Renderiza el contenido matemático/vectorial del fotograma 'index' en un canvas offscreen
   */
  function drawFrame(ctx, index) {
    const progress = index / (TOTAL_FRAMES - 1); // 0.0 to 1.0
    const w = WIDTH;
    const h = HEIGHT;
    const cx = w / 2;
    const cy = h / 2;

    // Clear background with deep quantum dark gradient
    const bgGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, w * 0.7);
    bgGrad.addColorStop(0, '#0a0d16');
    bgGrad.addColorStop(0.5, '#06080d');
    bgGrad.addColorStop(1, '#020305');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 1. Perspective Horizon & Grid Lines (receding to vanishing point)
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
    ctx.lineWidth = 1;
    const vanishY = cy + 40;
    // Radial grid rays
    for (let angle = -Math.PI; angle <= 0; angle += Math.PI / 18) {
      const rayX = cx + Math.cos(angle) * (w * 0.9);
      const rayY = vanishY + Math.sin(angle) * (h * 0.8);
      ctx.beginPath();
      ctx.moveTo(cx, vanishY);
      ctx.lineTo(rayX, rayY);
      ctx.stroke();
    }
    // Horizontal curved depth rings
    for (let r = 80; r < 500; r += 50) {
      ctx.beginPath();
      ctx.ellipse(cx, vanishY + 30, r * 1.8, r * 0.55, 0, 0, Math.PI);
      ctx.stroke();
    }
    ctx.restore();

    // PHASE DETERMINATION
    // Phase 1 (0.00 - 0.28): Chaotic Monolithic Token Burst
    // Phase 2 (0.28 - 0.55): T-Zero AST Pruning & Slicing Plane (-94.4%)
    // Phase 3 (0.55 - 0.78): Stratified Context Shields & Contracted Schemas
    // Phase 4 (0.78 - 1.00): MCP Agent Swarm & Autonomous Telemetry

    const phase = progress < 0.28 ? 1 : progress < 0.55 ? 2 : progress < 0.78 ? 3 : 4;

    // Draw ambient energy dust / particle stream
    ctx.save();
    const particleCount = 45;
    for (let i = 0; i < particleCount; i++) {
      const seed = (i * 9301 + 49297) % 233280;
      const rnd1 = seed / 233280;
      const rnd2 = ((seed * 9301 + 49297) % 233280) / 233280;
      
      const orbitSpeed = (0.5 + rnd1) * (progress * 8);
      const angle = rnd1 * Math.PI * 2 + orbitSpeed;
      const distance = 90 + rnd2 * 280 * (1 - progress * 0.3);
      
      const px = cx + Math.cos(angle) * distance * 1.3;
      const py = cy + Math.sin(angle) * (distance * 0.7);

      let pColor = 'rgba(239, 68, 68, 0.4)'; // red for phase 1
      if (progress >= 0.28 && progress < 0.55) {
        pColor = rnd1 > 0.4 ? 'rgba(6, 182, 212, 0.6)' : 'rgba(245, 158, 11, 0.4)';
      } else if (progress >= 0.55) {
        pColor = rnd1 > 0.5 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(139, 92, 246, 0.6)';
      }

      ctx.fillStyle = pColor;
      ctx.beginPath();
      ctx.arc(px, py, 1.2 + rnd2 * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 2. CENTRAL NEURAL CORE RENDERING
    ctx.save();
    const pulse = Math.sin(index * 0.2) * 8;
    const coreRadius = 75 + pulse;

    // Glow backing
    const coreGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, coreRadius * 2.5);
    if (phase === 1) {
      coreGlow.addColorStop(0, 'rgba(239, 68, 68, 0.25)');
      coreGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.1)');
      coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else if (phase === 2) {
      coreGlow.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
      coreGlow.addColorStop(0.5, 'rgba(59, 130, 246, 0.15)');
      coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else if (phase === 3) {
      coreGlow.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
      coreGlow.addColorStop(0.5, 'rgba(6, 182, 212, 0.2)');
      coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else {
      coreGlow.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
      coreGlow.addColorStop(0.4, 'rgba(6, 182, 212, 0.25)');
      coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }
    ctx.fillStyle = coreGlow;
    ctx.fillRect(cx - coreRadius * 2.5, cy - coreRadius * 2.5, coreRadius * 5, coreRadius * 5);

    // Dynamic Central Rotating Rings
    const rotationAngle = (index / TOTAL_FRAMES) * Math.PI * 4;

    // Ring 1 (Inner Quantum Core)
    ctx.strokeStyle = phase === 1 ? '#ef4444' : phase === 2 ? '#06b6d4' : '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(cx, cy, coreRadius, coreRadius * 0.45, rotationAngle, 0, Math.PI * 2);
    ctx.stroke();

    // Ring 2 (Middle Orthogonal Ring)
    ctx.strokeStyle = phase === 1 ? '#f59e0b' : phase <= 3 ? '#8b5cf6' : '#00f0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, coreRadius * 1.35, coreRadius * 0.6, -rotationAngle * 0.7, 0, Math.PI * 2);
    ctx.stroke();

    // Ring 3 (Outer Telemetry Ring with Tick marks)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, coreRadius * 1.7, 0, Math.PI * 2);
    ctx.stroke();

    // Render radial tick marks around Outer Telemetry Ring
    const numTicks = 32;
    for (let t = 0; t < numTicks; t++) {
      const a = (t / numTicks) * Math.PI * 2 + rotationAngle * 0.2;
      const innerR = coreRadius * 1.66;
      const outerR = t % 4 === 0 ? coreRadius * 1.78 : coreRadius * 1.73;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * innerR, cy + Math.sin(a) * innerR);
      ctx.lineTo(cx + Math.cos(a) * outerR, cy + Math.sin(a) * outerR);
      ctx.strokeStyle = t % 4 === 0 ? 'rgba(0, 240, 255, 0.8)' : 'rgba(255, 255, 255, 0.25)';
      ctx.stroke();
    }

    // 3. PHASE-SPECIFIC VISUAL ARCHITECTURE
    if (phase === 1) {
      // PHASE 1: Chaotic Monolithic Token Bloat
      ctx.font = 'bold 13px monospace';
      ctx.fillStyle = '#ef4444';
      ctx.fillText('[ALERT] MONOLITHIC CONTEXT BLOAT', cx - 120, cy - coreRadius * 2);

      // Render floating chaotic token badges
      const tokenList = ['128,400 TOKENS', 'RAW_FILE_DUMP', 'RECURSIVE_IMPORT_BLOB', 'ATTENTION_SPIKE: +420%'];
      tokenList.forEach((txt, i) => {
        const offX = cx + (i % 2 === 0 ? -240 : 160) + Math.sin(index * 0.3 + i) * 15;
        const offY = cy + (i < 2 ? -100 : 90) + Math.cos(index * 0.2 + i) * 15;
        
        ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(offX, offY, 170, 26, 4) : ctx.rect(offX, offY, 170, 26);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fca5a5';
        ctx.fillText(txt, offX + 10, offY + 17);
      });

    } else if (phase === 2) {
      // PHASE 2: T-Zero AST Pruning & Slicing Plane
      const sliceProgress = (progress - 0.28) / (0.55 - 0.28);
      const laserY = cy - 140 + sliceProgress * 280;

      // Cyan Horizontal Slicing Laser Beam
      const laserGrad = ctx.createLinearGradient(cx - 350, laserY, cx + 350, laserY);
      laserGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
      laserGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.95)');
      laserGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.strokeStyle = laserGrad;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx - 350, laserY);
      ctx.lineTo(cx + 350, laserY);
      ctx.stroke();

      // Slicing particles burst
      ctx.fillStyle = '#00f0ff';
      for (let p = 0; p < 12; p++) {
        const px = cx - 200 + p * 35 + Math.sin(p + index) * 10;
        ctx.fillRect(px, laserY - 4 + Math.cos(p * index) * 8, 3, 3);
      }

      // AST Hierarchy Visual Tree
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
      ctx.lineWidth = 1.5;
      const rootY = cy - 80;
      // Root Node
      ctx.strokeRect(cx - 40, rootY, 80, 22);
      ctx.fillStyle = '#e0f2fe';
      ctx.font = '11px monospace';
      ctx.fillText('AST_ROOT', cx - 28, rootY + 15);

      // Children Nodes
      [-120, 0, 120].forEach((dx, idx) => {
        const childY = cy - 10;
        ctx.beginPath();
        ctx.moveTo(cx, rootY + 22);
        ctx.lineTo(cx + dx, childY);
        ctx.stroke();

        ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.fillRect(cx + dx - 35, childY, 70, 20);
        ctx.strokeRect(cx + dx - 35, childY, 70, 20);
        ctx.fillStyle = '#bae6fd';
        const labels = ['INTERFACE', 'EXPORT_TYP', 'DELTA_DIFF'];
        ctx.fillText(labels[idx], cx + dx - 30, childY + 14);
      });

      // Metric Badge
      ctx.fillStyle = 'rgba(6, 182, 212, 0.9)';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('T-ZERO AST PRUNER: -94.4% TOKENS', cx - 135, cy + coreRadius * 1.95);

    } else if (phase === 3) {
      // PHASE 3: Context Stratification Shields L1, L2, L3
      const shieldProgress = (progress - 0.55) / (0.78 - 0.55);

      // Draw 3 Concentric Hexagonal Layers
      const layers = [
        { name: 'L1: SYSTEM INVARIANTS', color: '#8b5cf6', radius: coreRadius * 1.1 },
        { name: 'L2: DYNAMIC AST SCHEMAS', color: '#06b6d4', radius: coreRadius * 1.45 },
        { name: 'L3: EPHEMERAL RAG CACHE', color: '#10b981', radius: coreRadius * 1.8 }
      ];

      layers.forEach((layer, idx) => {
        ctx.strokeStyle = layer.color;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let side = 0; side < 6; side++) {
          const a = (side / 6) * Math.PI * 2 + (idx % 2 === 0 ? rotationAngle * 0.4 : -rotationAngle * 0.4);
          const hx = cx + Math.cos(a) * layer.radius;
          const hy = cy + Math.sin(a) * (layer.radius * 0.65);
          if (side === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.stroke();
      });

      // HUD Status
      ctx.fillStyle = '#a78bfa';
      ctx.font = 'bold 13px monospace';
      ctx.fillText('CONTRACTED SCHEMAS [STRICT ZOD/PYDANTIC]', cx - 150, cy - coreRadius * 2);
      ctx.fillStyle = '#34d399';
      ctx.fillText('ZERO-LEAK BOUNDARY ACTIVE // PASS', cx - 130, cy + coreRadius * 2.1);

    } else {
      // PHASE 4: MCP Swarm & Telemetry Mesh
      const swarmProgress = (progress - 0.78) / (1.00 - 0.78);

      // 4 Orbital Satellite Agents
      const agents = [
        { name: 'AST-Linter', role: 'Deterministic Pruner', angle: rotationAngle * 1.2 },
        { name: 'MCP-Broker', role: 'StdIO/SSE Server', angle: rotationAngle * 1.2 + Math.PI * 0.5 },
        { name: 'Zero-Leak', role: 'Sanitizer Guard', angle: rotationAngle * 1.2 + Math.PI },
        { name: 'Orchestrator', role: 'Consensus Node', angle: rotationAngle * 1.2 + Math.PI * 1.5 }
      ];

      agents.forEach((ag, i) => {
        const orbitRx = coreRadius * 2.2;
        const orbitRy = coreRadius * 0.85;
        const ax = cx + Math.cos(ag.angle) * orbitRx;
        const ay = cy + Math.sin(ag.angle) * orbitRy;

        // Laser connection from Core to Agent Node
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ax, ay);
        ctx.stroke();
        ctx.setLineDash([]);

        // Agent satellite node
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ax, ay, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Node center indicator
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(ax, ay, 5, 0, Math.PI * 2);
        ctx.fill();

        // Tag label
        ctx.font = '10px monospace';
        ctx.fillStyle = '#6ee7b7';
        ctx.fillText(ag.name, ax - 25, ay - 24);
      });

      // Status Badges
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('MCP PROTOCOL: AUTONOMOUS AGENT MESH ACTIVE', cx - 180, cy - coreRadius * 2.1);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px monospace';
      ctx.fillText('ZERO GHOST REVERTS • SHA-256 IDEMPOTENCY ENFORCED', cx - 165, cy + coreRadius * 2.15);
    }

    // 4. Global HUD Top & Bottom Bar Overlay
    ctx.restore();
    ctx.save();
    
    // Top border line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.moveTo(40, 40);
    ctx.lineTo(w - 40, 40);
    ctx.stroke();

    // Top HUD texts
    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText('NEXTGEN AI ARCHITECTURE // SCRUBBING ENGINE', 40, 30);
    ctx.fillText(`FRAME ${String(index + 1).padStart(2, '0')}/${TOTAL_FRAMES} [PROGRESS: ${Math.round(progress * 100)}%]`, w - 240, 30);

    // Bottom scrubber progress indicator
    const barWidth = w - 80;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(40, h - 35, barWidth, 3);
    
    const activeGrad = ctx.createLinearGradient(40, 0, 40 + barWidth * progress, 0);
    activeGrad.addColorStop(0, '#00f0ff');
    activeGrad.addColorStop(1, '#10b981');
    ctx.fillStyle = activeGrad;
    ctx.fillRect(40, h - 35, barWidth * progress, 3);

    ctx.restore();
  }

  /**
   * Genera asíncronamente los 80 fotogramas convirtiéndolos a ImageBitmaps
   */
  async function generateFrames(onProgress) {
    if (isReady) return frames;
    if (isGenerating) return null;
    isGenerating = true;

    const offscreen = typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(WIDTH, HEIGHT)
      : document.createElement('canvas');
    
    offscreen.width = WIDTH;
    offscreen.height = HEIGHT;
    const ctx = offscreen.getContext('2d');

    const canCreateBitmap = typeof window.createImageBitmap === 'function';

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      drawFrame(ctx, i);

      if (canCreateBitmap) {
        try {
          const bitmap = await window.createImageBitmap(offscreen);
          frames.push(bitmap);
        } catch (e) {
          // Fallback: Clone into standalone canvas
          const fallbackCanvas = document.createElement('canvas');
          fallbackCanvas.width = WIDTH;
          fallbackCanvas.height = HEIGHT;
          const fbCtx = fallbackCanvas.getContext('2d');
          fbCtx.drawImage(offscreen, 0, 0);
          frames.push(fallbackCanvas);
        }
      } else {
        const fallbackCanvas = document.createElement('canvas');
        fallbackCanvas.width = WIDTH;
        fallbackCanvas.height = HEIGHT;
        const fbCtx = fallbackCanvas.getContext('2d');
        fbCtx.drawImage(offscreen, 0, 0);
        frames.push(fallbackCanvas);
      }

      if (typeof onProgress === 'function') {
        onProgress((i + 1) / TOTAL_FRAMES);
      }

      // Small yield every 10 frames to keep main thread completely unblocked
      if (i % 10 === 0) {
        await new Promise(r => setTimeout(r, 0));
      }
    }

    isReady = true;
    isGenerating = false;
    return frames;
  }

  return {
    generateFrames,
    drawFrameToContext: (targetCtx, index) => drawFrame(targetCtx, index),
    getFrames: () => frames,
    isReady: () => isReady,
    TOTAL_FRAMES,
    WIDTH,
    HEIGHT
  };
})();

// Export globally
window.FrameGenerator = FrameGenerator;

