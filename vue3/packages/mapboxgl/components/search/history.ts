export const HISTORY_MAX_COUNT_MIN = 1
export const HISTORY_MAX_COUNT_MAX = 10

export function normalizeHistoryMaxCount(value: number | string | null | undefined) {
  const count = Number(value ?? HISTORY_MAX_COUNT_MAX)
  if (!Number.isInteger(count)) {
    return HISTORY_MAX_COUNT_MAX
  }
  return Math.min(Math.max(count, HISTORY_MAX_COUNT_MIN), HISTORY_MAX_COUNT_MAX)
}

export function isValidHistoryMaxCount(value: number | string) {
  return normalizeHistoryMaxCount(value) === Number(value)
}

export function getDisplayedHistory(
  records: string[],
  newestFirst: boolean,
  historyMaxCount: number | string | null | undefined
) {
  const limitedRecords = records.slice(0, normalizeHistoryMaxCount(historyMaxCount))
  return newestFirst ? limitedRecords : limitedRecords.slice().reverse()
}
