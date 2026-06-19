// src/components/common/DotLottieAnimation.tsx
import { useEffect, useRef } from "react";
import { DotLottie } from "@lottiefiles/dotlottie-web";

interface DotLottieAnimationProps {
  src: string;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
}

const DotLottieAnimation = ({
  src,
  className = "",
  loop = true,
  autoplay = true,
}: DotLottieAnimationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const dotLottie = new DotLottie({
      autoplay,
      loop,
      canvas: canvasRef.current,
      src,
    });

    return () => {
      dotLottie.destroy();
    };
  }, [src, loop, autoplay]);

  return <canvas ref={canvasRef} className={className} />;
};

export default DotLottieAnimation;