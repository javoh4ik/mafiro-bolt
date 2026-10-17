export interface AvatarGradient {
  from: string;
  to: string;
  glow: string;
}

const GRADIENTS: AvatarGradient[] = [
  { from: '#8B5CF6', to: '#4338CA', glow: 'rgba(139, 92, 246, 0.45)' },
  { from: '#F43F5E', to: '#BE185D', glow: 'rgba(244, 63, 94, 0.45)' },
  { from: '#34D399', to: '#0F766E', glow: 'rgba(52, 211, 153, 0.4)' },
  { from: '#FBBF24', to: '#EA580C', glow: 'rgba(251, 191, 36, 0.4)' },
  { from: '#38BDF8', to: '#1D4ED8', glow: 'rgba(56, 189, 248, 0.4)' },
  { from: '#E879F9', to: '#7E22CE', glow: 'rgba(232, 121, 249, 0.4)' },
  { from: '#FB7185', to: '#9F1239', glow: 'rgba(251, 113, 133, 0.4)' },
  { from: '#4ADE80', to: '#15803D', glow: 'rgba(74, 222, 128, 0.4)' }
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getAvatarGradient(seed: string): AvatarGradient {
  return GRADIENTS[hashString(seed || 'x') % GRADIENTS.length];
}

export function getInitials(name: string): string {
  const cleaned = (name || '').replace(/[^\p{L}\p{N} ]/gu, ' ').trim();
  if (!cleaned) return '?';
  const parts = cleaned.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return cleaned.slice(0, 2).toUpperCase();
}
