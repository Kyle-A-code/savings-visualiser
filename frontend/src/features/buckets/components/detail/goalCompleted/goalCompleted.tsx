import { useEffect, useRef, useState } from "react";
import "./goalCompleted.css";

type CoinVariant = "silver" | "bronze" | "gold";

interface CoinStyle {
  rimRadius: number;
  faceRadius: number;
  rimColor: string;
  cStrokeColor: string;
  gradientStops: Array<[number, string]>;
}

interface FallingCoin {
  variant: CoinVariant;
  startX: number;
  endX: number;
  arcAmount: number;
  delayMs: number;
}

interface SpawnRange {
  min: number;
  max: number;
}

const COINS: Record<CoinVariant, CoinStyle> = {
  silver: {
    rimRadius: 10.5,
    faceRadius: 10,
    rimColor: "#8a8f95",
    cStrokeColor: "#2f2f2f",
    gradientStops: [
      [0, "#ffffff"],
      [0.2, "#f2f2f2"],
      [0.65, "#c8c8c8"],
      [1, "#8f8f8f"],
    ],
  },
  bronze: {
    rimRadius: 8.5,
    faceRadius: 8,
    rimColor: "#8a5630",
    cStrokeColor: "#5f3117",
    gradientStops: [
      [0, "#f7d9bb"],
      [0.28, "#d59a63"],
      [0.72, "#b56c3a"],
      [1, "#7f4322"],
    ],
  },
  gold: {
    rimRadius: 12.5,
    faceRadius: 12,
    rimColor: "#b8860b",
    cStrokeColor: "#6c4d00",
    gradientStops: [
      [0, "#fff7cb"],
      [0.26, "#f2d56e"],
      [0.68, "#e0b32e"],
      [1, "#a67703"],
    ],
  },
};

const SPAWN_COUNTS: Record<CoinVariant, SpawnRange> = {
  bronze: { min: 20, max: 50 },
  silver: { min: 15, max: 40 },
  gold: { min: 10, max: 30 },
};

const randomInRange = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

const randomIntInRange = (min: number, max: number) => {
  return Math.floor(randomInRange(min, max + 1));
};

const createCoinPatterns = (canvasWidth: number): FallingCoin[] => {
  const variants = Object.keys(COINS) as CoinVariant[];
  const patterns: FallingCoin[] = [];

  variants.forEach((variant) => {
    const spawnRange = SPAWN_COUNTS[variant];
    const count = randomIntInRange(spawnRange.min, spawnRange.max);

    for (let index = 0; index < count; index += 1) {
      const horizontalStart = randomInRange(
        canvasWidth * 0.2,
        canvasWidth * 0.8,
      );
      const horizontalDrift = randomInRange(
        -canvasWidth * 0.08,
        canvasWidth * 0.08,
      );
      const arcDirection = Math.random() > 0.5 ? 1 : -1;
      const arcAmount = randomInRange(canvasWidth * 0.015, canvasWidth * 0.06);

      patterns.push({
        variant,
        startX: horizontalStart,
        endX: horizontalStart + horizontalDrift,
        arcAmount: arcAmount * arcDirection,
        delayMs: randomIntInRange(0, 1200),
      });
    }
  });

  return patterns;
};

const drawCoin = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  variant: CoinVariant,
) => {
  const style = COINS[variant];
  const gradient = ctx.createRadialGradient(
    x - style.faceRadius * 0.9,
    y - style.faceRadius * 0.1,
    0,
    x,
    y,
    style.faceRadius,
  );
  style.gradientStops.forEach(([stop, color]) => {
    gradient.addColorStop(stop, color);
  });

  ctx.beginPath();
  ctx.fillStyle = style.rimColor;
  ctx.arc(x - style.rimRadius * 0.1, y, style.rimRadius, 0, 2 * Math.PI);
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = gradient;
  ctx.arc(x, y, style.faceRadius, 0, 2 * Math.PI);
  ctx.fill();

  ctx.beginPath();
  ctx.strokeStyle = style.cStrokeColor;
  ctx.lineWidth = Math.max(1, style.faceRadius * 0.1);
  ctx.lineCap = "round";
  ctx.arc(x, y, style.faceRadius * 0.38, 0.35 * Math.PI, 1.65 * Math.PI);
  ctx.stroke();
};

interface GoalCompletedProps {
  onComplete: () => void;
}

const GoalCompleted = ({ onComplete }: GoalCompletedProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const didCompleteRef = useRef(false);
  const [isExiting, setIsExiting] = useState(false);
  const EXIT_DURATION_MS = 300;

  useEffect(() => {
    if (!isExiting) return;
    const timeoutId = window.setTimeout(() => onComplete(), EXIT_DURATION_MS);
    return () => window.clearTimeout(timeoutId);
  }, [isExiting, onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = canvas?.getContext("2d");

    if (!ctx) {
      return;
    }

    const durationMs = 2000;
    let viewportWidth = 0;
    let viewportHeight = 0;
    let coinPatterns: FallingCoin[] = [];
    let startTime: number | null = null;
    let animationFrameId = 0;

    const syncCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
      canvas.style.width = `${viewportWidth}px`;
      canvas.style.height = `${viewportHeight}px`;
      canvas.width = Math.floor(viewportWidth * dpr);
      canvas.height = Math.floor(viewportHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      coinPatterns = createCoinPatterns(viewportWidth);
    };

    syncCanvasSize();
    window.addEventListener("resize", syncCanvasSize);

    const animate = (time: number) => {
      if (startTime == null) {
        startTime = time;
      }

      ctx.clearRect(0, 0, viewportWidth, viewportHeight);
      const elapsed = time - startTime;
      let hasActiveCoins = false;

      coinPatterns.forEach((coin) => {
        const style = COINS[coin.variant];
        const endY = viewportHeight + style.rimRadius * 2;
        const localStartY = -style.rimRadius * 2;
        const localElapsed = elapsed - coin.delayMs;
        const progress = Math.min(Math.max(localElapsed / durationMs, 0), 1);
        if (progress === 1 && localElapsed > durationMs) {
          return;
        }

        hasActiveCoins = true;
        const easedProgress = progress * progress;
        const y = localStartY + (endY - localStartY) * easedProgress;
        const linearX = coin.startX + (coin.endX - coin.startX) * progress;
        const arcOffsetX = Math.sin(progress * Math.PI) * coin.arcAmount;
        drawCoin(ctx, linearX + arcOffsetX, y, coin.variant);
      });

      if (hasActiveCoins) {
        animationFrameId = window.requestAnimationFrame(animate);
      } else if (!didCompleteRef.current) {
        didCompleteRef.current = true;
        setIsExiting(true);
      }
    };

    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", syncCanvasSize);
      ctx.clearRect(0, 0, viewportWidth, viewportHeight);
    };
  }, [onComplete]);

  return (
    <div className={`coin-overlay ${isExiting ? "coin-overlay-exit" : ""}`}>
      <canvas className="coin-canvas" ref={canvasRef} role="presentation" />
      <p className="coin-overlay-text">GOAL COMPLETED</p>
    </div>
  );
};

export default GoalCompleted;
