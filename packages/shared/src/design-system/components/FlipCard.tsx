import { useState } from 'react';
import { DRAMS, SPACING, TYPOGRAPHY, RADIUS } from '../tokens';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react';

/**
 * DRAMS Flip Card
 * "Less, but better" — 3D flip card for revealing additional content
 *
 * Purpose: Display condensed info on front, detailed specs on back
 * States: default, flipped, flipping
 */

export interface DramsFlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  height?: number;
  onFlipChange?: (isFlipped: boolean) => void;
}

const CONTAINER_STYLE = {
  perspective: '1000px',
  width: '100%',
};

const CARD_STYLE = {
  position: 'relative' as const,
  width: '100%',
  transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
  transformStyle: 'preserve-3d' as const,
  cursor: 'pointer',
};

const FACE_STYLE = {
  position: 'absolute' as const,
  width: '100%',
  height: '100%',
  backfaceVisibility: 'hidden' as const,
  borderRadius: RADIUS.card,
  overflow: 'hidden' as const,
  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
};

const FRONT_STYLE = {
  ...FACE_STYLE,
  background: 'white',
};

const BACK_STYLE = {
  ...FACE_STYLE,
  background: DRAMS.grayTrack,
  transform: 'rotateY(180deg)',
  padding: SPACING.xl,
  display: 'flex',
  flexDirection: 'column' as const,
  justifyContent: 'center',
};

const HINT_STYLE = {
  textAlign: 'center' as const,
  ...TYPOGRAPHY.bodySmall,
  color: DRAMS.textLight,
  padding: SPACING.lg,
  background: DRAMS.grayTrack,
};

const SPEC_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: SPACING.md,
  padding: `${SPACING.sm} 0`,
};

const SPEC_DOT_STYLE = {
  width: '8px',
  height: '8px',
  borderRadius: RADIUS.circle,
  background: DRAMS.orange,
  flexShrink: 0,
};

const SPEC_TEXT_STYLE = {
  ...TYPOGRAPHY.body,
  color: DRAMS.textDark,
};

export interface DramsFlipCardSpec {
  label: string;
  value: string;
}

export interface DramsFlipCardFrontProps {
  title?: string;
  subtitle?: string;
  stats?: Array<{ label: string; value: string }>;
  hint?: string;
}

export interface DramsFlipCardBackProps {
  title?: string;
  specs?: DramsFlipCardSpec[];
}

// Front Content Component
export function FlipCardFront({ title, subtitle, stats, hint = 'Click to see specs' }: DramsFlipCardFrontProps) {
  return (
    <React.Fragment>
      {title || subtitle || stats ? (
        <div style={{ padding: SPACING.lg }}>
          {title && (
            <h3 style={{ ...TYPOGRAPHY.h4, color: DRAMS.textDark, marginBottom: SPACING.xs }}>
              {title}
            </h3>
          )}
          {subtitle && (
            <div style={{ ...TYPOGRAPHY.bodySmall, color: DRAMS.textLight, marginBottom: SPACING.sm }}>
              {subtitle}
            </div>
          )}
        </div>
      ) : null}

      {stats && (
        <div style={{ padding: `0 ${SPACING.lg} ${SPACING.lg}` }}>
          {stats.map((stat, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: `${SPACING.md} 0`,
                borderBottom: index < stats.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
              }}
            >
              <span style={{ ...TYPOGRAPHY.body, color: DRAMS.textLight }}>{stat.label}</span>
              <span style={{ ...TYPOGRAPHY.body, fontWeight: 500, color: DRAMS.textDark }}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={HINT_STYLE}>{hint}</div>
    </React.Fragment>
  );
}

// Back Content Component
export function FlipCardBack({ title = 'Specifications', specs }: DramsFlipCardBackProps) {
  return (
    <React.Fragment>
      {title && (
        <h3 style={{ ...TYPOGRAPHY.h4, color: DRAMS.textDark, marginBottom: SPACING.lg, textAlign: 'center' }}>
          {title}
        </h3>
      )}
      {specs && (
        <div>
          {specs.map((spec, index) => (
            <div key={index} style={SPEC_STYLE}>
              <div style={SPEC_DOT_STYLE} />
              <span style={SPEC_TEXT_STYLE}>{spec.label}: {spec.value}</span>
            </div>
          ))}
        </div>
      )}
    </React.Fragment>
  );
}

// Main Flip Card Component
export function DramsFlipCard({ front, back, height = 240, onFlipChange }: DramsFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  const handleFlip = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    const newFlippedState = !isFlipped;
    setIsFlipped(newFlippedState);
    onFlipChange?.(newFlippedState);
    setTimeout(() => setIsFlipping(false), 600);
  };

  return (
    <div style={{ ...CONTAINER_STYLE, height: `${height}px` }}>
      <div
        style={{
          ...CARD_STYLE,
          transform: isFlipped ? 'rotateY(180deg)' : 'none',
          pointerEvents: isFlipping ? 'none' : 'auto',
        }}
        onClick={handleFlip}
      >
        <div style={{ ...FRONT_STYLE, height: `${height}px` }}>{front}</div>
        <div style={{ ...BACK_STYLE, height: `${height}px` }}>{back}</div>
      </div>
    </div>
  );
}
