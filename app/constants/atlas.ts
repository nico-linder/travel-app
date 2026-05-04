// Atlas design tokens — editorial dusk
// Shared color, type, radius, and shadow tokens used across the app.
// Source of truth lives here; constants/theme.ts re-exports the subset
// that React Navigation expects.

import { Platform } from 'react-native';

export const Atlas = {
  // Surfaces
  ink:        '#0E0C0A', // primary background — warm near-black
  ink2:       '#161310', // surface 1 — cards
  ink3:       '#221E19', // surface 2 — elevated / chips
  hairline:   '#2A2520', // divider / border
  hairline2:  '#3A332C', // hover / focused border

  // Type
  paper:      '#F5EFE6', // primary text — warm off-white
  paperDim:   '#C9C0B2', // secondary text
  paperMute:  '#8A8275', // tertiary / labels
  paperFaint: '#5A5448', // disabled

  // Accents
  amber:      '#E8A85C', // primary accent — golden hour
  amberDeep:  '#C8853A', // pressed
  amberSoft:  'rgba(232, 168, 92, 0.12)',
  amberLine:  'rgba(232, 168, 92, 0.28)',

  teal:       '#4FB3A9', // secondary — ocean (locked-in / consensus)
  tealSoft:   'rgba(79, 179, 169, 0.12)',
  tealLine:   'rgba(79, 179, 169, 0.28)',

  rust:       '#C45D3A', // tertiary — clay/earth, sparingly
  rustSoft:   'rgba(196, 93, 58, 0.12)',

  // Status
  red:        '#D9534F',
  redSoft:    'rgba(217, 83, 79, 0.12)',
  green:      '#7FB069',

  // Avatar rotation (matches the design bundle)
  avatarPalette: ['#C45D3A', '#4FB3A9', '#E8A85C', '#8A8275'] as const,

  // Inverse text on amber surfaces
  inkOnAmber: '#1A1410',
} as const;

// Radii
export const Radii = {
  r1: 8,
  r2: 12,
  r3: 18,
  r4: 24,
  r5: 32,
  pill: 999,
} as const;

// Shadows — warm, layered. Use shadowColor: '#000' on surfaces; the amber glow
// is the only colored shadow (apply manually on primary CTA).
export const Shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 32,
    elevation: 8,
  },
  deep: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.55,
    shadowRadius: 48,
    elevation: 14,
  },
  amberGlow: {
    shadowColor: Atlas.amber,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 6,
  },
} as const;

// Typography
// Headlines use a serif; body uses the platform sans. We don't ship custom
// font files, so we map each role to the best available system font per
// platform. On web (Expo Web), DM Serif Display will load if Google Fonts is
// linked; otherwise Georgia is an excellent fallback that sets the same tone.
export const Fonts = {
  serif: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    web: "'DM Serif Display', 'Cormorant Garamond', Georgia, 'Times New Roman', serif",
    default: 'serif',
  }) as string,
  sans: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    web: "Geist, Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    default: 'System',
  }) as string,
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    web: "'JetBrains Mono', 'Geist Mono', ui-monospace, Menlo, monospace",
    default: 'monospace',
  }) as string,
};

// Eyebrow — small tracked uppercase label used across screens.
// Pair with a serif headline + 14–16px body line to get the Atlas rhythm.
export const eyebrow = {
  fontFamily: Fonts.sans,
  fontSize: 11,
  fontWeight: '600' as const,
  letterSpacing: 1.8,
  textTransform: 'uppercase' as const,
  color: Atlas.paperMute,
};

// Display headline — used for hero titles, place names, big numbers.
export const display = (size: number) => ({
  fontFamily: Fonts.serif,
  fontSize: size,
  fontWeight: '400' as const,
  letterSpacing: -size * 0.025,
  color: Atlas.paper,
  lineHeight: size * 1.02,
});

// The amber-italic accent word inside a serif headline.
export const accentWord = {
  fontFamily: Fonts.serif,
  fontStyle: 'italic' as const,
  color: Atlas.amber,
};

// Tag tone palette (matches the design bundle's <Tag tone="…"> primitive)
export const tagTones = {
  amber: { bg: Atlas.amberSoft, border: Atlas.amberLine, color: Atlas.amber },
  teal:  { bg: Atlas.tealSoft, border: Atlas.tealLine,  color: Atlas.teal },
  rust:  { bg: Atlas.rustSoft, border: 'rgba(196, 93, 58, 0.28)', color: Atlas.rust },
  paper: { bg: 'rgba(245, 239, 230, 0.08)', border: 'rgba(245, 239, 230, 0.16)', color: Atlas.paperDim },
} as const;

export type TagTone = keyof typeof tagTones;
