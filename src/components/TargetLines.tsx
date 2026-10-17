import React from 'react';
import { TargetVector } from '../types/game';

interface TargetLinesProps {
  targets: TargetVector[];
  seatCoordinates: Record<number, { x: number; y: number }>;
}

export const TargetLines: React.FC<TargetLinesProps> = ({ targets, seatCoordinates }) => {
  if (!targets || targets.length === 0) return null;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
      <defs>
        {/* Golden laser gradient */}
        <linearGradient id="target-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF2A55" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FF8FA5" stopOpacity="1" />
        </linearGradient>

        {/* Crimson laser gradient */}
        <linearGradient id="target-crimson-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF2A55" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#A3122F" stopOpacity="0.6" />
        </linearGradient>

        {/* Arrow marker */}
        <marker
          id="arrow-crimson"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 8 5 L 0 9 z" fill="#DC2626" />
        </marker>

        <marker
          id="arrow-gold"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 8 5 L 0 9 z" fill="#FF2A55" />
        </marker>
      </defs>

      {targets.map((t, idx) => {
        const fromCoord = seatCoordinates[t.from_seat];
        const toCoord = seatCoordinates[t.to_seat];
        if (!fromCoord || !toCoord) return null;

        return (
          <g key={`target-${idx}-${t.from_seat}-${t.to_seat}`}>
            {/* Outer glow line */}
            <line
              x1={`${fromCoord.x}%`}
              y1={`${fromCoord.y}%`}
              x2={`${toCoord.x}%`}
              y2={`${toCoord.y}%`}
              stroke="rgba(255, 42, 85, 0.4)"
              strokeWidth="4"
              strokeDasharray="6 4"
            />
            {/* Crisp dashed laser vector */}
            <line
              x1={`${fromCoord.x}%`}
              y1={`${fromCoord.y}%`}
              x2={`${toCoord.x}%`}
              y2={`${toCoord.y}%`}
              stroke="url(#target-crimson-grad)"
              strokeWidth="2"
              strokeDasharray="5 3"
              markerEnd="url(#arrow-crimson)"
              className="animate-pulse"
            />
          </g>
        );
      })}
    </svg>
  );
};
