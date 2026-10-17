import React, { useEffect, useState } from 'react';
import { ThrowableEvent, ThrowableItem } from '../types/game';
import { sounds } from '../utils/sounds';

interface ThrowablesOverlayProps {
  lastThrowable?: ThrowableEvent;
  seatCoordinates: Record<number, { x: number; y: number }>;
  onThrow: (targetSeat: number, item: ThrowableItem) => void;
  selectedTargetSeat?: number;
}

export const ThrowablesOverlay: React.FC<ThrowablesOverlayProps> = ({
  lastThrowable,
  seatCoordinates,
  onThrow,
  selectedTargetSeat
}) => {
  const [animatingItem, setAnimatingItem] = useState<{
    item: ThrowableItem;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    id: number;
  } | null>(null);

  const [splatAt, setSplatAt] = useState<{ x: number; y: number; item: ThrowableItem } | null>(null);

  useEffect(() => {
    if (!lastThrowable) return;

    const fromCoord = seatCoordinates[lastThrowable.from_seat];
    const toCoord = seatCoordinates[lastThrowable.to_seat];
    if (!fromCoord || !toCoord) return;

    setAnimatingItem({
      item: lastThrowable.item,
      fromX: fromCoord.x,
      fromY: fromCoord.y,
      toX: toCoord.x,
      toY: toCoord.y,
      id: Date.now()
    });

    // Splat effect after 600ms flight
    const timer = setTimeout(() => {
      setAnimatingItem(null);
      setSplatAt({ x: toCoord.x, y: toCoord.y, item: lastThrowable.item });
      sounds.playSplat();

      // Clear splat after 1.2s
      setTimeout(() => {
        setSplatAt(null);
      }, 1200);
    }, 600);

    return () => clearTimeout(timer);
  }, [lastThrowable, seatCoordinates]);

  const items: Array<{ type: ThrowableItem; icon: string; label: string }> = [
    { type: 'tomato', icon: '🍅', label: 'Помидор' },
    { type: 'clown', icon: '🤡', label: 'Клоун' },
    { type: 'rose', icon: '🌹', label: 'Роза' },
    { type: 'loupe', icon: '🔍', label: 'Лупа' },
  ];

  return (
    <>
      {/* Floating Throwables Toolbar if a target seat is selected */}
      {selectedTargetSeat && (
        <div className="absolute top-16 right-3 z-30 flex flex-col gap-1.5 p-1.5 rounded-2xl bg-[#0D1119]/90 border border-[#D4AF37]/30 shadow-luxury backdrop-blur-md animate-fade-in">
          <span className="text-[9px] font-mono text-[#D4AF37] text-center font-bold">
            БРОСИТЬ
          </span>
          {items.map((i) => (
            <button
              key={i.type}
              type="button"
              onClick={() => onThrow(selectedTargetSeat, i.type)}
              title={i.label}
              className="w-8 h-8 rounded-xl bg-[#141A26] border border-white/10 hover:border-[#D4AF37] flex items-center justify-center text-sm transition-transform active:scale-90"
            >
              {i.icon}
            </button>
          ))}
        </div>
      )}

      {/* Flying Projectile Animation */}
      {animatingItem && (
        <div
          className="absolute z-40 text-2xl pointer-events-none transition-all duration-600 ease-out"
          style={{
            left: `${animatingItem.toX}%`,
            top: `${animatingItem.toY}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {items.find((i) => i.type === animatingItem.item)?.icon || '🍅'}
        </div>
      )}

      {/* Splat Impact Effect */}
      {splatAt && (
        <div
          className="absolute z-40 pointer-events-none flex items-center justify-center animate-ping"
          style={{
            left: `${splatAt.x}%`,
            top: `${splatAt.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <span className="text-3xl filter drop-shadow-lg">
            {splatAt.item === 'tomato' ? '💥' : splatAt.item === 'rose' ? '✨' : '💨'}
          </span>
        </div>
      )}
    </>
  );
};
