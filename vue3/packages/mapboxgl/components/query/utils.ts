import type { QueryParameter } from 'vue-iclient-controllers-mapboxgl/src/QueryViewModel'

export type QueryParameterWithDefaults = QueryParameter & {
  sqlDefault?: string
  keywordDefault?: string
}

export function getQueryExpressionByMode(queryParameter: QueryParameterWithDefaults) {
  if (queryParameter.queryMode === 'KEYWORD') {
    return queryParameter.keywordDefault ?? queryParameter.attributeFilter ?? ''
  }
  return queryParameter.sqlDefault ?? queryParameter.attributeFilter ?? ''
}

export function normalizeQueryParameter(queryParameter: QueryParameterWithDefaults) {
  const queryMode = queryParameter.queryMode || 'SQL'
  const nextQueryParameter = {
    ...queryParameter,
    queryMode
  }
  return {
    ...nextQueryParameter,
    attributeFilter: getQueryExpressionByMode(nextQueryParameter)
  }
}

export function switchQueryMode(
  queryParameter: QueryParameterWithDefaults,
  queryMode: QueryParameter['queryMode']
) {
  return normalizeQueryParameter({
    ...queryParameter,
    queryMode
  })
}

export function updateQueryExpression(queryParameter: QueryParameterWithDefaults, value: string) {
  if (queryParameter.queryMode === 'KEYWORD') {
    return {
      ...queryParameter,
      attributeFilter: value,
      keywordDefault: value
    }
  }
  return {
    ...queryParameter,
    attributeFilter: value,
    sqlDefault: value
  }
}
