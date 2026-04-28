export interface DirectoryTreeFetcherOptions {
  requestInit?: RequestInit
  serviceProxyUrlPrefix?: string | (() => unknown)
}

export type DirectoryTreeFetcher = (url: string) => Promise<any>

function getServiceProxyUrlPrefix(serviceProxyUrlPrefix: DirectoryTreeFetcherOptions['serviceProxyUrlPrefix']): string | undefined {
  const value = typeof serviceProxyUrlPrefix === 'function' ? serviceProxyUrlPrefix() : serviceProxyUrlPrefix
  return typeof value === 'string' && value.trim() ? value.trim().replace(/\/+$/, '') : undefined
}

function isInTheSameDomain(url: string): boolean {
  if (!url) {
    return true
  }
  if (url.indexOf('//') === -1) {
    return true
  }
  if (typeof window === 'undefined') {
    return false
  }
  try {
    return new URL(window.location.href).origin === new URL(url, window.location.href).origin
  } catch {
    return false
  }
}

function isIportalProxyServiceUrl(url: string, serviceProxyUrlPrefix: DirectoryTreeFetcherOptions['serviceProxyUrlPrefix']): boolean {
  const proxyPrefix = getServiceProxyUrlPrefix(serviceProxyUrlPrefix)
  if (!url || !proxyPrefix) {
    return false
  }

  const trimmedUrl = url.trim()
  if (trimmedUrl === proxyPrefix || trimmedUrl.startsWith(`${proxyPrefix}/`)) {
    return true
  }

  if (typeof window === 'undefined') {
    return false
  }

  try {
    const targetUrl = new URL(trimmedUrl, window.location.href)
    const proxyUrl = new URL(proxyPrefix, window.location.href)
    const targetPath = targetUrl.pathname.replace(/\/+$/, '')
    const proxyPath = proxyUrl.pathname.replace(/\/+$/, '')
    if (targetUrl.href.includes(`${proxyPrefix}/`)) {
      return true
    }
    return (
      targetUrl.origin === proxyUrl.origin &&
      (targetPath === proxyPath || targetPath.startsWith(`${proxyPath}/`))
    )
  } catch {
    return false
  }
}

function shouldIncludeCredentials(url: string, serviceProxyUrlPrefix: DirectoryTreeFetcherOptions['serviceProxyUrlPrefix']): boolean {
  return isInTheSameDomain(url) || isIportalProxyServiceUrl(url, serviceProxyUrlPrefix)
}

export function createDirectoryTreeFetcher(options: DirectoryTreeFetcherOptions = {}): DirectoryTreeFetcher {
  return async (url: string) => {
    const response = await fetch(url, {
      ...options.requestInit,
      credentials: shouldIncludeCredentials(url, options.serviceProxyUrlPrefix) ? 'include' : 'same-origin'
    })
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`)
    }
    return response.json()
  }
}

export const defaultDirectoryTreeFetcher = createDirectoryTreeFetcher()
