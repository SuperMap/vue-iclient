import { describe, expect, it } from 'vitest'
import { normalizeQueryParameter, switchQueryMode, updateQueryExpression } from '../utils'

describe('query utils', () => {
  it('uses the SQL default expression during initialization', () => {
    const queryParameter = normalizeQueryParameter({
      name: 'test-layer',
      queryMode: 'SQL',
      sqlDefault: 'SmID > 10',
      keywordDefault: 'road'
    })

    expect(queryParameter.attributeFilter).toBe('SmID > 10')
  })

  it('uses the keyword default expression during initialization', () => {
    const queryParameter = normalizeQueryParameter({
      name: 'test-layer',
      queryMode: 'KEYWORD',
      sqlDefault: 'SmID > 10',
      keywordDefault: 'road'
    })

    expect(queryParameter.attributeFilter).toBe('road')
  })

  it('switches the input expression with query mode', () => {
    const sqlQueryParameter = normalizeQueryParameter({
      name: 'test-layer',
      queryMode: 'SQL',
      sqlDefault: 'SmID > 10',
      keywordDefault: 'road'
    })

    const keywordQueryParameter = switchQueryMode(sqlQueryParameter, 'KEYWORD')

    expect(keywordQueryParameter.attributeFilter).toBe('road')
  })

  it('persists input changes back to the active default expression', () => {
    const keywordQueryParameter = normalizeQueryParameter({
      name: 'test-layer',
      queryMode: 'KEYWORD',
      sqlDefault: 'SmID > 10',
      keywordDefault: 'road'
    })

    const updatedQueryParameter = updateQueryExpression(keywordQueryParameter, 'river')

    expect(updatedQueryParameter.attributeFilter).toBe('river')
    expect(updatedQueryParameter.keywordDefault).toBe('river')
    expect(updatedQueryParameter.sqlDefault).toBe('SmID > 10')
  })
})
