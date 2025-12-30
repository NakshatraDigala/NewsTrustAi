import { cn } from "@/lib/utils";
import { TrustLevel } from "@/types/news";

interface TrustIndicatorProps {
  level: TrustLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const levelConfig = {
  true: {
    label: 'Likely True',
    bgColor: 'bg-trust-true',
    glowClass: 'trust-glow-true',
    pulseColor: 'bg-trust-true-glow',
  },
  suspicious: {
    label: 'Suspicious',
    bgColor: 'bg-trust-suspicious',
    glowClass: 'trust-glow-suspicious',
    pulseColor: 'bg-trust-suspicious-glow',
  },
  false: {
    label: 'Likely False',
    bgColor: 'bg-trust-false',
    glowClass: 'trust-glow-false',
    pulseColor: 'bg-trust-false-glow',
  },
  pending: {
    label: 'Analyzing...',
    bgColor: 'bg-muted',
    glowClass: '',
    pulseColor: 'bg-muted-foreground',
  },
};

const sizeConfig = {
  sm: {
    dot: 'w-2 h-2',
    wrapper: 'gap-1.5',
    text: 'text-xs',
  },
  md: {
    dot: 'w-3 h-3',
    wrapper: 'gap-2',
    text: 'text-sm',
  },
  lg: {
    dot: 'w-4 h-4',
    wrapper: 'gap-2.5',
    text: 'text-base',
  },
};

export function TrustIndicator({ 
  level, 
  size = 'md', 
  showLabel = false,
  className 
}: TrustIndicatorProps) {
  const config = levelConfig[level];
  const sizes = sizeConfig[size];

  return (
    <div className={cn("flex items-center", sizes.wrapper, className)}>
      <div className="relative">
        {/* Glow effect */}
        {level !== 'pending' && (
          <div 
            className={cn(
              "absolute inset-0 rounded-full blur-sm opacity-60",
              config.pulseColor,
              "animate-pulse-glow"
            )} 
          />
        )}
        {/* Main dot */}
        <div 
          className={cn(
            "relative rounded-full",
            sizes.dot,
            config.bgColor,
            level !== 'pending' && config.glowClass,
            level === 'pending' && "animate-pulse"
          )} 
        />
      </div>
      {showLabel && (
        <span className={cn(
          "font-medium",
          sizes.text,
          level === 'pending' ? 'text-muted-foreground' : 'text-foreground'
        )}>
          {config.label}
        </span>
      )}
    </div>
  );
}
