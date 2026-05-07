import { calcSongRating, getGrade, getLamp } from './rating'

const CONST = 14.0

describe('calcSongRating', () => {
  test('score 1010000 → const + 2.15', () => {
    expect(calcSongRating(1_010_000, CONST)).toBeCloseTo(16.15)
  })
  test('score 1009000 → const + 2.15', () => {
    expect(calcSongRating(1_009_000, CONST)).toBeCloseTo(16.15)
  })
  test('score 1007500 → const + 2.00', () => {
    expect(calcSongRating(1_007_500, CONST)).toBeCloseTo(16.00)
  })
  test('score 1005000 → const + 1.50', () => {
    expect(calcSongRating(1_005_000, CONST)).toBeCloseTo(15.50)
  })
  test('score 1000000 → const + 1.00', () => {
    expect(calcSongRating(1_000_000, CONST)).toBeCloseTo(15.00)
  })
  test('score 975000 → const + 0.00', () => {
    expect(calcSongRating(975_000, CONST)).toBeCloseTo(14.00)
  })
  test('score 500000 → proportional', () => {
    expect(calcSongRating(500_000, CONST)).toBeCloseTo(14.0 * (500_000 / 975_000))
  })
  test('score 0 → 0', () => {
    expect(calcSongRating(0, CONST)).toBe(0)
  })
})

describe('getGrade', () => {
  test('1010000 → AJC', () => expect(getGrade(1_010_000)).toBe('AJC'))
  test('1009000 → SSS+', () => expect(getGrade(1_009_000)).toBe('SSS+'))
  test('1007500 → SSS', () => expect(getGrade(1_007_500)).toBe('SSS'))
  test('1005000 → SS+', () => expect(getGrade(1_005_000)).toBe('SS+'))
  test('1000000 → SS', () => expect(getGrade(1_000_000)).toBe('SS'))
  test('985000 → S+', () => expect(getGrade(985_000)).toBe('S+'))
  test('970000 → S', () => expect(getGrade(970_000)).toBe('S'))
  test('940000 → AAA', () => expect(getGrade(940_000)).toBe('AAA'))
  test('900000 → AA', () => expect(getGrade(900_000)).toBe('AA'))
  test('800000 → A', () => expect(getGrade(800_000)).toBe('A'))
  test('799999 → BBB', () => expect(getGrade(799_999)).toBe('BBB'))
})

describe('getLamp', () => {
  test('1010000 → AJC regardless of flags', () => expect(getLamp(1_010_000, false, false)).toBe('AJC'))
  test('AJ flag → AJ', () => expect(getLamp(1_000_000, true, true)).toBe('AJ'))
  test('FC flag only → FC', () => expect(getLamp(1_000_000, true, false)).toBe('FC'))
  test('no flags → NONE', () => expect(getLamp(1_000_000, false, false)).toBe('NONE'))
})
