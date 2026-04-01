/**
 * Game of Meditation — Design System
 *
 * Inspired by stillness: deep forest greens, mountain mists, dawn light.
 * Calm on the surface. Infinite underneath.
 */

export const theme = {
  colors: {
    // Backgrounds — deep, restful
    background: '#0d1f0d',
    surface: '#152815',
    surfaceElevated: '#1c3320',

    // Primary — life green, like a forest at dawn
    primary: '#4caf6e',
    primaryDark: '#388e50',
    primaryLight: '#a5d6b5',

    // Text
    textPrimary: '#f0f7f0',
    textSecondary: '#8ab898',
    textMuted: '#4d6b55',

    // Accents
    gold: '#c9a84c',       // Buddha level rewards
    sky: '#7ab8d4',        // Calm, breath
    lotus: '#c47fa8',      // Wisdom, depth

    // Feedback
    success: '#4caf6e',
    warning: '#e8b84b',
    error: '#d9534f',

    // UI
    border: '#1e3d24',
    divider: '#1a3020',
    overlay: 'rgba(0,0,0,0.6)',
  },

  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 32,
      '4xl': 40,
      '5xl': 52,
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },

  radii: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
} as const

export type Theme = typeof theme
