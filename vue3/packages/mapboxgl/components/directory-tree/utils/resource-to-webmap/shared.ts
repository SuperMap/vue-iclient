import type { ServiceType } from '../../types'
import { defaultDirectoryTreeFetcher } from '../fetcher'

const MAP_SERVICE_TYPES = new Set<ServiceType>(['MAP', 'SINGLE_MAP'])
const DATA_SERVICE_TYPES = new Set<ServiceType>(['DATA', 'DATASET'])
const VECTOR_MAP_SERVICE_TYPES = new Set<ServiceType>(['VECTOR_MAP', 'SINGLE_VECTOR_MAP'])

export function defaultFetcher(url: string): Promise<any> {
  return defaultDirectoryTreeFetcher(url)
}

export function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === 'object' ? (value as Record<string, any>) : {}
}

export function normalizePortalDataType(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }
  const normalized = value.trim().toUpperCase()
  return normalized || undefined
}

export function normalizeServiceType(value: unknown): ServiceType | undefined {
  if (typeof value !== 'string') {
    return undefined
  }
  const normalized = value.trim().toUpperCase().replace(/[\s-]+/g, '_')
  if (!normalized) {
    return undefined
  }
  return normalized as ServiceType
}

export function isMapServiceType(serviceType: string | undefined): serviceType is ServiceType {
  return MAP_SERVICE_TYPES.has(serviceType as ServiceType)
}

export function isDataServiceType(serviceType: string | undefined): serviceType is ServiceType {
  return DATA_SERVICE_TYPES.has(serviceType as ServiceType)
}

export function isVectorMapServiceType(serviceType: string | undefined): serviceType is ServiceType {
  return VECTOR_MAP_SERVICE_TYPES.has(serviceType as ServiceType)
}

export function normalizeBaseUrl(iportalUrl: string): string {
  return iportalUrl.endsWith('/') ? iportalUrl.slice(0, -1) : iportalUrl
}

export function splitUrlQuery(url: string): { base: string; query: string } {
  const index = url.indexOf('?')
  if (index < 0) {
    return {
      base: url,
      query: ''
    }
  }
  return {
    base: url.slice(0, index),
    query: url.slice(index + 1)
  }
}

export function appendPath(url: string, segment: string): string {
  const { base, query } = splitUrlQuery(url)
  const normalizedBase = base.replace(/\/+$/, '')
  const normalizedSegment = segment.replace(/^\/+/, '')
  const nextBase = `${normalizedBase}/${normalizedSegment}`
  return query ? `${nextBase}?${query}` : nextBase
}

export function normalizeVectorStyleUrl(address: string | undefined): string | undefined {
  if (!address) {
    return undefined
  }
  if (/\/root\.json(?:$|\?)/i.test(address)) {
    return address
  }
  if (/\/resources\/styles(?:\/)?(?:\?|$)/i.test(address)) {
    return appendPath(address, 'root.json')
  }
  if (/\/VectorTileServer(?:\/)?(?:\?|$)/i.test(address)) {
    return appendPath(address, 'resources/styles/root.json')
  }
  return address
}

export function normalizeProjection(projection: unknown): string | null {
  const toEpsgProjection = (value: number | string): string | null => {
    const code = typeof value === 'number' ? value : Number.parseInt(value, 10)
    if (!Number.isInteger(code) || code <= 0) {
      return null
    }
    return `EPSG:${code}`
  }

  if (projection == null || projection === '') {
    return null
  }
  if (typeof projection === 'number' && Number.isFinite(projection)) {
    return toEpsgProjection(projection)
  }
  if (typeof projection !== 'string') {
    return null
  }

  const trimmed = projection.trim()
  if (!trimmed) {
    return null
  }
  if (/^EPSG:\d+$/i.test(trimmed)) {
    return toEpsgProjection(trimmed.replace(/^EPSG:/i, ''))
  }
  if (/^\d+$/.test(trimmed)) {
    return toEpsgProjection(trimmed)
  }

  const epsgMatch = trimmed.match(/EPSG(?::|::)(\d+)/i)
  if (epsgMatch) {
    return toEpsgProjection(epsgMatch[1])
  }

  return trimmed.toUpperCase()
}
