import type { BuddhaLevel } from '../types/database'

export interface BuddhaLevelConfig {
  level: BuddhaLevel
  label: string
  minMinutes: number
  maxMinutes: number | null
  mssRequired: number
  description: string
}

export const BUDDHA_LEVELS: BuddhaLevelConfig[] = [
  {
    level: 'seed',
    label: 'Seed',
    minMinutes: 0,
    maxMinutes: 100,
    mssRequired: 0,
    description: 'A tiny seed of stillness has been planted.',
  },
  {
    level: 'sprout',
    label: 'Sprout',
    minMinutes: 100,
    maxMinutes: 500,
    mssRequired: 50,
    description: 'Breaking through the surface. The practice is taking root.',
  },
  {
    level: 'sapling',
    label: 'Sapling',
    minMinutes: 500,
    maxMinutes: 1500,
    mssRequired: 150,
    description: 'Growing steadily. Roots deepening into the earth.',
  },
  {
    level: 'tree',
    label: 'Tree',
    minMinutes: 1500,
    maxMinutes: 5000,
    mssRequired: 300,
    description: 'Strong and grounded. Offering shade to others.',
  },
  {
    level: 'elder_tree',
    label: 'Elder Tree',
    minMinutes: 5000,
    maxMinutes: 15000,
    mssRequired: 500,
    description: 'Wisdom in the rings. Stillness runs deep.',
  },
  {
    level: 'forest',
    label: 'Forest',
    minMinutes: 15000,
    maxMinutes: 50000,
    mssRequired: 700,
    description: 'An ecosystem of peace. Life flourishes around you.',
  },
  {
    level: 'mountain',
    label: 'Mountain',
    minMinutes: 50000,
    maxMinutes: null,
    mssRequired: 900,
    description: 'Unmoved by storms. A landmark for all seekers.',
  },
  {
    level: 'sky',
    label: 'Sky',
    minMinutes: 0,       // unlocked by facilitator certification, not minutes
    maxMinutes: null,
    mssRequired: 800,
    description: 'Boundless. A certified guide for others on the path.',
  },
  {
    level: 'infinite',
    label: 'Infinite',
    minMinutes: 0,
    maxMinutes: null,
    mssRequired: 1000,
    description: 'Beyond measure. A master teacher.',
  },
]

export function getBuddhaLevel(totalMinutes: number, mss: number): BuddhaLevel {
  // Walk backwards to find the highest earned level
  const earned = [...BUDDHA_LEVELS]
    .filter(l => l.level !== 'sky' && l.level !== 'infinite')
    .reverse()
    .find(l => totalMinutes >= l.minMinutes && mss >= l.mssRequired)
  return earned?.level ?? 'seed'
}

/** The app never says 'you failed' — every session is progress. */
export const MIN_SESSION_SECONDS = 10
