import type { Lamp } from '@/types'

export function calcSongRating(score: number, chartConst: number): number {
  if (score >= 1_009_000) return chartConst + 2.15
  if (score >= 1_007_500) return chartConst + 2.00 + (score - 1_007_500) / 10_000
  if (score >= 1_005_000) return chartConst + 1.50 + (score - 1_005_000) /  2_500 * 0.50
  if (score >= 1_000_000) return chartConst + 1.00 + (score - 1_000_000) /  5_000 * 0.50
  if (score >=   975_000) return chartConst +        (score -   975_000) / 25_000
  return Math.max(0, chartConst * (score / 975_000))
}

export function getGrade(score: number): string {
  if (score >= 1_010_000) return 'AJC'
  if (score >= 1_009_000) return 'SSS+'
  if (score >= 1_007_500) return 'SSS'
  if (score >= 1_005_000) return 'SS+'
  if (score >= 1_000_000) return 'SS'
  if (score >=   985_000) return 'S+'
  if (score >=   970_000) return 'S'
  if (score >=   940_000) return 'AAA'
  if (score >=   900_000) return 'AA'
  if (score >=   800_000) return 'A'
  return 'BBB'
}

export function getLamp(score: number, fc: boolean, aj: boolean): Lamp {
  if (score >= 1_010_000) return 'AJC'
  if (aj) return 'AJ'
  if (fc) return 'FC'
  return 'NONE'
}
