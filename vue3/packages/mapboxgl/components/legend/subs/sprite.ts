/**
 * 图例雪碧图加载工具：线符号 / 面轮廓符号的图片图案都取自 webmap 同一张雪碧图，
 * 图例绘制与 map 实例解耦，只需雪碧图地址（sprite.png）即可：
 * - loadSpriteImage：加载整张雪碧图，用于按坐标裁剪图案；
 * - loadSpriteMeta：加载同名 sprite.json，定位各图案在雪碧图中的坐标。
 * 两者均按 url 缓存 Promise，失败不缓存以便重试。
 */

export interface SpriteMetaEntry {
  x: number
  y: number
  width: number
  height: number
  pixelRatio?: number
  sdf?: boolean
  [prop: string]: unknown
}

export type SpriteMeta = Record<string, SpriteMetaEntry>

const spriteImageCache = new Map<string, Promise<HTMLImageElement>>()
const spriteMetaCache = new Map<string, Promise<SpriteMeta>>()
// 已就绪的资源单独留一份，供同步绘制阶段直接取用（避免首屏只能等异步回调）
const readySpriteImages = new Map<string, HTMLImageElement>()
const readySpriteMetas = new Map<string, SpriteMeta>()

/**
 * 已经加载完成的雪碧图（同步）。未加载完成时返回 undefined，用于图例首帧直接绘制图片轮廓
 */
export function getLoadedSpriteImage(url: string): HTMLImageElement | undefined {
  return url ? readySpriteImages.get(url) : undefined
}

/**
 * 已经加载完成的雪碧图元数据（同步）
 */
export function getLoadedSpriteMeta(url: string): SpriteMeta | undefined {
  return url ? readySpriteMetas.get(url) : undefined
}

export function loadSpriteImage(url: string): Promise<HTMLImageElement> {
  // 地址缺失时直接失败，避免 img.src 为空串既不触发 load 也不触发 error，调用方永远等不到回调
  if (!url) {
    return Promise.reject(new Error('sprite url is empty'))
  }
  if (spriteImageCache.has(url)) {
    return spriteImageCache.get(url) as Promise<HTMLImageElement>
  }
  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      readySpriteImages.set(url, img)
      resolve(img)
    }
    img.onerror = reject
    img.src = url
  })
  spriteImageCache.set(url, promise)
  promise.catch(() => spriteImageCache.delete(url))
  return promise
}

/**
 * sprite.json 候选地址：不同数据源的雪碧图地址形态不一致（带 .png / 不带扩展名 / 带查询串），
 * 依次尝试，兼容 iPortal、地图服务以及样式里直接给出的 sprite 前缀
 */
export function getSpriteMetaUrls(url: string): string[] {
  if (!url) {
    return []
  }
  const candidates: string[] = []
  if (/\.png($|\?)/.test(url)) {
    candidates.push(url.replace(/\.png($|\?)/, '.json$1'))
  }
  // 形如 .../sprites/sprite 或 .../sprites/sprite.png?v=1 时补上 .json
  const stripped = url.replace(/(\.png)?(\?.*)?$/, '')
  if (stripped) {
    candidates.push(`${stripped}.json`)
  }
  return candidates.filter((item, index) => item && candidates.indexOf(item) === index)
}

export function loadSpriteMeta(url: string): Promise<SpriteMeta> {
  if (spriteMetaCache.has(url)) {
    return spriteMetaCache.get(url) as Promise<SpriteMeta>
  }
  const jsonUrls = getSpriteMetaUrls(url)
  const promise = (async () => {
    let lastError: unknown
    for (const jsonUrl of jsonUrls) {
      try {
        const res = await fetch(jsonUrl)
        if (!res.ok) {
          lastError = new Error(`load sprite meta failed: ${res.status}`)
          continue
        }
        const meta = (await res.json()) as SpriteMeta
        readySpriteMetas.set(url, meta)
        return meta
      } catch (e) {
        lastError = e
      }
    }
    throw lastError || new Error('load sprite meta failed')
  })()
  spriteMetaCache.set(url, promise)
  promise.catch(() => spriteMetaCache.delete(url))
  return promise
}
