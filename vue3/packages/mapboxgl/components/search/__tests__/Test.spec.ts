import {
  getDisplayedHistory,
  HISTORY_MAX_COUNT_MAX,
  HISTORY_MAX_COUNT_MIN,
  normalizeHistoryMaxCount
} from '../history'
import { searchProps } from '../types'

describe('SmSearch historyMaxCount', () => {
  const validator = searchProps().historyMaxCount.validator

  it('accepts values from 1 to 10', () => {
    expect(validator(HISTORY_MAX_COUNT_MIN)).toBe(true)
    expect(validator(HISTORY_MAX_COUNT_MAX)).toBe(true)
    expect(validator('5')).toBe(true)
  })

  it('rejects out-of-range or non-integer values', () => {
    expect(validator(0)).toBe(false)
    expect(validator(11)).toBe(false)
    expect(validator(1.5)).toBe(false)
    expect(validator('abc')).toBe(false)
  })

  it('limits displayed history to the configured count', () => {
    expect(getDisplayedHistory(['d', 'c', 'b', 'a'], true, 2)).toEqual(['d', 'c'])
  })

  it('keeps the latest records when rendering oldest first', () => {
    expect(getDisplayedHistory(['d', 'c', 'b', 'a'], false, 2)).toEqual(['c', 'd'])
  })

  it('normalizes invalid values to the default limit', () => {
    expect(normalizeHistoryMaxCount(undefined)).toBe(HISTORY_MAX_COUNT_MAX)
    expect(normalizeHistoryMaxCount('abc')).toBe(HISTORY_MAX_COUNT_MAX)
  })
})
