/**
 * SuperMap3D 影像 / 地形 / S3M 走引擎自身请求，不会自动带 BuilderX 登录 cookie。
 * portalproxy 跨域时，先把 host:port 加入 TrustedServers，引擎才会 withCredentials。
 * Credential / IPORTAL_KEY 是可选补充：只有调用方显式传入 key 时才拼 ?key=。
 * @see http://support.supermap.com.cn:8090/webgl/docs/Documentation/Credential.html
 */

const PORTAL_PROXY_RE = /\/portalproxy(?:\/|$)/i

export interface SuperMap3DServiceCredential {
  /** 密钥或令牌 */
  value?: string
  /** IPORTAL_KEY: "key"；ISERVER_TOKEN: "token"；也可自定义 */
  type?: string
  /** 写入 keymap 的服务 URL，供 addTokenWithKey 精确匹配 */
  rooturl?: string
}

let registeredIportalKey: string | undefined
const WINDOW_IPORTAL_KEY = '__SUPERMAP3D_IPORTAL_KEY__'

export function isIportalProxyUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') {
    return false
  }
  return PORTAL_PROXY_RE.test(url.trim())
}

export function registerSuperMap3DIportalKey(key?: string | null): void {
  const next = typeof key === 'string' ? key.trim() : ''
  registeredIportalKey = next || undefined
  if (typeof window === 'undefined') {
    return
  }
  if (registeredIportalKey) {
    ;(window as any)[WINDOW_IPORTAL_KEY] = registeredIportalKey
  } else {
    delete (window as any)[WINDOW_IPORTAL_KEY]
  }
}

export function getSuperMap3DIportalKey(): string | undefined {
  if (registeredIportalKey) {
    return registeredIportalKey
  }
  if (typeof window === 'undefined') {
    return undefined
  }
  const fromWindow = (window as any)[WINDOW_IPORTAL_KEY]
  return typeof fromWindow === 'string' && fromWindow.trim() ? fromWindow.trim() : undefined
}

export function getCredentialRootUrl(url: string): string {
  const trimmed = url.trim()
  const portalMatch = trimmed.match(/^(https?:\/\/[^/?#]+\/portalproxy)/i)
  if (portalMatch) {
    return portalMatch[1]
  }
  try {
    const base =
      typeof window !== 'undefined' && window.location?.href ? window.location.href : 'http://localhost'
    return new URL(trimmed, base).origin
  } catch {
    return trimmed
  }
}

function getSuperMap3D(): any {
  return typeof window !== 'undefined' ? (window as any).SuperMap3D : undefined
}

/**
 * 把 portalproxy 主机加入 TrustedServers，让 SuperMap3D 跨域请求带上当前页登录 cookie。
 * 这不是另配一把密钥，只是打开引擎的 withCredentials。
 */
export function enableSuperMap3DProxyCookies(url?: string | null): boolean {
  if (!isIportalProxyUrl(url)) {
    return false
  }
  const SuperMap3D = getSuperMap3D()
  if (!SuperMap3D?.TrustedServers?.add) {
    return false
  }
  try {
    const base =
      typeof window !== 'undefined' && window.location?.href ? window.location.href : 'http://localhost'
    const parsed = new URL(url as string, base)
    const port = parsed.port || (parsed.protocol === 'https:' ? '443' : '80')
    if (typeof SuperMap3D.TrustedServers.contains === 'function' && SuperMap3D.TrustedServers.contains(url)) {
      return true
    }
    SuperMap3D.TrustedServers.add(parsed.hostname, port)
    return true
  } catch {
    return false
  }
}

/**
 * 加载 portalproxy / 受保护服务前准备鉴权：优先带登录 cookie，有显式 key 时再写 Credential。
 */
export function prepareSuperMap3DServiceAuth(
  url?: string | null,
  credential?: SuperMap3DServiceCredential | null,
  fallbackValue?: string
): boolean {
  const cookies = enableSuperMap3DProxyCookies(url)
  const cred = applySuperMap3DCredential(url, credential, fallbackValue)
  return cookies || cred
}

function getIportalKeyType(SuperMap3D: any): string {
  return SuperMap3D?.CredentialType?.IPORTAL_KEY || 'key'
}

function getIserverTokenType(SuperMap3D: any): string {
  return SuperMap3D?.CredentialType?.ISERVER_TOKEN || 'token'
}

function uniqueUrls(urls: Array<string | undefined>): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  urls.forEach(url => {
    const next = typeof url === 'string' ? url.trim() : ''
    if (!next || seen.has(next)) {
      return
    }
    seen.add(next)
    result.push(next)
  })
  return result
}

/**
 * REST 地图走 name/value；S3M / rest/data 可再写入 keymap 精确匹配。
 */
function writeSimpleCredential(
  SuperMap3D: any,
  type: string,
  value: string,
  keymapUrls: string[]
): boolean {
  if (!SuperMap3D?.Credential) {
    return false
  }
  const credential = new SuperMap3D.Credential(value, type)
  if (typeof credential.addCredential === 'function' && keymapUrls.length) {
    credential.addCredential(
      keymapUrls.map(rooturl => ({
        rooturl,
        type,
        value
      }))
    )
  }
  SuperMap3D.Credential.CREDENTIAL = credential
  return true
}

/**
 * 写入 SuperMap3D.Credential.CREDENTIAL。
 * portalproxy 默认 IPORTAL_KEY（?key=）；直连 iServer 默认 token。
 * 无可用 value 时不改动现有 Credential。
 */
export function applySuperMap3DCredential(
  url?: string | null,
  credential?: SuperMap3DServiceCredential | null,
  fallbackValue?: string
): boolean {
  if (!url || typeof url !== 'string') {
    return false
  }
  const SuperMap3D = getSuperMap3D()
  if (!SuperMap3D?.Credential) {
    return false
  }
  const trimmedUrl = url.trim()
  const isProxy = isIportalProxyUrl(trimmedUrl)
  const value = (
    credential?.value ||
    fallbackValue ||
    (isProxy ? getSuperMap3DIportalKey() : undefined) ||
    ''
  ).trim()
  if (!value) {
    return false
  }
  const type =
    credential?.type || (isProxy ? getIportalKeyType(SuperMap3D) : getIserverTokenType(SuperMap3D))
  const rooturl = credential?.rooturl || getCredentialRootUrl(trimmedUrl)
  return writeSimpleCredential(SuperMap3D, type, value, uniqueUrls([trimmedUrl, rooturl]))
}
