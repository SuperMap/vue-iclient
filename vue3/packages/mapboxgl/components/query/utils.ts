import type { QueryParameter } from 'vue-iclient-controllers-mapboxgl/src/QueryViewModel'

export type QueryParameterWithDefaults = QueryParameter & {
  sqlDefault?: string
  keywordDefault?: string
}

type NormalizedQueryParameter = QueryParameterWithDefaults & {
  queryMode: NonNullable<QueryParameter['queryMode']>
  attributeFilter: string
}

export function getQueryExpressionByMode(queryParameter: QueryParameterWithDefaults): string {
  if (queryParameter.queryMode === 'KEYWORD') {
    return queryParameter.keywordDefault ?? queryParameter.attributeFilter ?? ''
  }
  return queryParameter.sqlDefault ?? queryParameter.attributeFilter ?? ''
}

export function normalizeQueryParameter(queryParameter: QueryParameterWithDefaults): NormalizedQueryParameter {
  const queryMode: NormalizedQueryParameter['queryMode'] = queryParameter.queryMode || 'SQL'
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
): NormalizedQueryParameter {
  return normalizeQueryParameter({
    ...queryParameter,
    queryMode
  })
}

export function updateQueryExpression(
  queryParameter: QueryParameterWithDefaults,
  value: string
): QueryParameterWithDefaults {
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
