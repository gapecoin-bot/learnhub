'use client';
import { useEffect, useRef } from 'react';

export default function WebPattern() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // ── Hex geometry ──────────────────────────────────────────────────────────
    const R      = 14;                        // grid radius (spacing)
    const r      = R - 1.5;                   // draw radius (gap between hexes)
    const HEX_W  = Math.sqrt(3) * R;          // pointy-top: col spacing
    const HEX_H  = 2 * R;                     // pointy-top: full height
    const ROW_H  = HEX_H * 0.75;             // row spacing

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      draw();
    };

    // ── Collect exclusion zones from rendered UI elements ────────────────────
    const getZones = () => {
      const pad = 16;
      const zones = [];
      const sel = [
        'aside',
        '[class*="rounded-xl"]',
        '[class*="rounded-2xl"]',
        '[class*="rounded-lg"]',
      ];
      sel.forEach(s => {
        document.querySelectorAll(s).forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.width > 24 && rect.height > 24) {
            zones.push({
              x:  rect.left   - pad,
              y:  rect.top    - pad,
              x2: rect.right  + pad,
              y2: rect.bottom + pad,
            });
          }
        });
      });
      return zones;
    };

    const isExcluded = (cx, cy, zones) => {
      for (const z of zones) {
        if (cx >= z.x && cx <= z.x2 && cy >= z.y && cy <= z.y2) return true;
      }
      return false;
    };

    // ── Draw one pointy-top hexagon ──────────────────────────────────────────
    const drawHex = (cx, cy) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 180) * (60 * i - 30); // pointy-top
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(66, 133, 244, 0.08)';
      ctx.lineWidth   = 0.8;

      const zones = getZones();
      const cols  = Math.ceil(canvas.width  / HEX_W) + 2;
      const rows  = Math.ceil(canvas.height / ROW_H) + 2;

      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const cx = col * HEX_W + (row % 2 === 1 ? HEX_W / 2 : 0);
          const cy = row * ROW_H;
          if (!isExcluded(cx, cy, zones)) {
            drawHex(cx, cy);
          }
        }
      }
    };

    resize();
    window.addEventListener('resize', resize);

    // ── Redraw after DOM elements settle ─────────────────────────────────────
    const t1 = setTimeout(draw, 150);
    const t2 = setTimeout(draw, 500);

    return () => {
      window.removeEventListener('resize', resize);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}