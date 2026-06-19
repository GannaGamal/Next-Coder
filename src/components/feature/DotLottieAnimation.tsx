// src/components/feature/DotLottieAnimation.tsx
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

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
  return (
    <DotLottieReact
      src={src}
      loop={loop}
      autoplay={autoplay}
      className={className}
    />
  );
};

export default DotLottieAnimation;