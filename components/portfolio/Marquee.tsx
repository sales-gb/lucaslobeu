import { ReactNode } from 'react';

interface MarqueeProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export default function Marquee({ children, speed = 35, className }: MarqueeProps) {
  return (
    <div
      className={className}
      style={{ overflow: 'hidden', display: 'flex' }}
      aria-hidden="true"
    >
      <div
        style={{
          display: 'flex',
          whiteSpace: 'nowrap',
          animation: `ll-marquee ${speed}s linear infinite`,
          willChange: 'transform',
        }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
