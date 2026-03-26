export interface DirectoryTreeFetcherOptions {
  requestInit?: RequestInit
}

export type DirectoryTreeFetcher = (url: string) => Promise<any>

export function createDirectoryTreeFetcher(options: DirectoryTreeFetcherOptions = {}): DirectoryTreeFetcher {
  return async (url: string) => {
    const response = options.requestInit ? await fetch(url, options.requestInit) : await fetch(url)
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`)
    }
    return response.json()
  }
}

export const defaultDirectoryTreeFetcher = createDirectoryTreeFetcher()
