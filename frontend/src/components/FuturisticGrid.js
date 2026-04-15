import { useRef, useEffect } from 'react';

const GRID_SIZE = 40;
const NODE_RADIUS = 2;
const LINE_WIDTH = 0.5;

export default function FuturisticGrid({ scrollProgress = 0 }) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const nodesRef = useRef([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      generateNodes(canvas.width, canvas.height);
    };

    const generateNodes = (w, h) => {
      const nodes = [];
      const cols = Math.ceil(w / GRID_SIZE) + 1;
      const rows = Math.ceil(h / GRID_SIZE) + 1;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          nodes.push({
            baseX: i * GRID_SIZE,
            baseY: j * GRID_SIZE,
            x: i * GRID_SIZE,
            y: j * GRID_SIZE,
            vx: 0,
            vy: 0,
            phase: Math.random() * Math.PI * 2,
            speed: 0.3 + Math.random() * 0.5,
            amplitude: 3 + Math.random() * 8,
          });
        }
      }
      nodesRef.current = nodes;
    };

    const draw = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      const nodes = nodesRef.current;
      const scrollOffset = scrollProgress * 200;

      // Update node positions with wave animation
      for (const node of nodes) {
        const wave1 = Math.sin(t * node.speed + node.phase + scrollOffset * 0.01) * node.amplitude;
        const wave2 = Math.cos(t * node.speed * 0.7 + node.phase * 1.3) * node.amplitude * 0.5;
        node.x = node.baseX + wave1;
        node.y = node.baseY + wave2 - scrollOffset * 0.3;
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < GRID_SIZE * 1.6) {
            const alpha = Math.max(0, (1 - dist / (GRID_SIZE * 1.6))) * 0.12;
            const pulse = Math.sin(t * 0.8 + i * 0.1) * 0.5 + 0.5;
            
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(212, 175, 55, ${alpha * (0.4 + pulse * 0.6)})`;
            ctx.lineWidth = LINE_WIDTH;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.x < -20 || node.x > w + 20 || node.y < -20 || node.y > h + 20) continue;
        
        const pulse = Math.sin(t * 1.2 + node.phase) * 0.5 + 0.5;
        const nodeAlpha = 0.15 + pulse * 0.25;
        
        // Glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_RADIUS * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${nodeAlpha * 0.15})`;
        ctx.fill();
        
        // Core
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${nodeAlpha})`;
        ctx.fill();
      }

      // Draw moving highlight "puzzle pieces" - futuristic stick connections
      const puzzlePieces = 5;
      for (let p = 0; p < puzzlePieces; p++) {
        const offset = (t * 30 + p * w / puzzlePieces) % (w + 200) - 100;
        const yBase = h * (0.2 + p * 0.15);
        const yOffset = Math.sin(t * 0.5 + p * 2) * 50;

        // Hexagonal puzzle piece shape
        const size = 15 + Math.sin(t + p) * 5;
        const cx = offset;
        const cy = yBase + yOffset;
        
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t * 0.3 + p);
        
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const angle = (Math.PI * 2 / 6) * k - Math.PI / 6;
          const sx = Math.cos(angle) * size;
          const sy = Math.sin(angle) * size;
          if (k === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(212, 175, 55, 0.15)`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = `rgba(212, 175, 55, 0.03)`;
        ctx.fill();

        // Inner pattern
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const angle = (Math.PI * 2 / 6) * k;
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle) * size * 0.6, Math.sin(angle) * size * 0.6);
        }
        ctx.strokeStyle = `rgba(184, 115, 51, 0.1)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        ctx.restore();

        // Trail lines connecting puzzle pieces
        if (p > 0) {
          const prevOffset = (t * 30 + (p - 1) * w / puzzlePieces) % (w + 200) - 100;
          const prevY = h * (0.2 + (p - 1) * 0.15) + Math.sin(t * 0.5 + (p - 1) * 2) * 50;
          
          ctx.beginPath();
          ctx.moveTo(prevOffset, prevY);
          ctx.quadraticCurveTo(
            (prevOffset + offset) / 2,
            (prevY + cy) / 2 + Math.sin(t + p) * 30,
            offset,
            cy
          );
          ctx.strokeStyle = `rgba(212, 175, 55, 0.06)`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [scrollProgress]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.6,
      }}
    />
  );
}
