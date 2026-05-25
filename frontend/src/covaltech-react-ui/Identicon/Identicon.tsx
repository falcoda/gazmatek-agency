import React, { useEffect, useRef } from "react";

interface IdenticonProps {
  seed: string;
  size?: number; // grid size (default: 8x8)
  scale?: number; // pixel scale (default: 4px)
  color?: string;
  bgColor?: string;
  spotColor?: string;
  className?: string;
}

const Identicon: React.FC<IdenticonProps> = ({
  seed,
  size = 8,
  scale = 4,
  color,
  bgColor,
  spotColor,
  className = "identicon",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    generateIdenticon();
  }, [seed, size, scale, color, bgColor, spotColor]);

  const generateIdenticon = () => {
    const randseed = new Array(4);

    function seedrand(seed: string) {
      randseed.fill(0);
      for (let i = 0; i < seed.length; i++) {
        randseed[i % 4] =
          (randseed[i % 4] << 5) - randseed[i % 4] + seed.charCodeAt(i);
      }
    }

    function rand() {
      const t = randseed[0] ^ (randseed[0] << 11);
      randseed[0] = randseed[1];
      randseed[1] = randseed[2];
      randseed[2] = randseed[3];
      randseed[3] = randseed[3] ^ (randseed[3] >> 19) ^ t ^ (t >> 8);
      return (randseed[3] >>> 0) / ((1 << 31) >>> 0);
    }

    function createColor() {
      const h = Math.floor(rand() * 360);
      const s = `${(rand() * 60 + 40).toFixed(0)}%`;
      const l = `${((rand() + rand() + rand() + rand()) * 25).toFixed(0)}%`;
      return `hsl(${h},${s},${l})`;
    }

    function createImageData(size: number) {
      const width = size;
      const height = size;
      const dataWidth = Math.ceil(width / 2);
      const mirrorWidth = width - dataWidth;
      const data: number[] = [];

      for (let y = 0; y < height; y++) {
        let row: number[] = [];
        for (let x = 0; x < dataWidth; x++) {
          row[x] = Math.floor(rand() * 2.3);
        }
        const r = row.slice(0, mirrorWidth).reverse();
        row = row.concat(r);
        data.push(...row);
      }
      return data;
    }

    function draw(
      imageData: number[],
      color: string,
      bgColor: string,
      spotColor: string,
    ) {
      const width = Math.sqrt(imageData.length);
      const sizePx = width * scale;

      const ctx = canvasRef.current!.getContext("2d")!;
      canvasRef.current!.width = sizePx;
      canvasRef.current!.height = sizePx;

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, sizePx, sizePx);

      for (let i = 0; i < imageData.length; i++) {
        const val = imageData[i];
        if (val === 0) continue;

        ctx.fillStyle = val === 1 ? color : spotColor;
        const row = Math.floor(i / width);
        const col = i % width;
        ctx.fillRect(col * scale, row * scale, scale, scale);
      }
    }

    seedrand(seed);
    const fg = color ?? createColor();
    const bg = bgColor ?? createColor();
    const spot = spotColor ?? createColor();
    const imageData = createImageData(size);
    draw(imageData, fg, bg, spot);
  };

  return <canvas ref={canvasRef} className={className} />;
};

export default Identicon;
