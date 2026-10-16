/**
 * 图例雪碧图加载工具：线符号 / 面轮廓符号的图片图案都取自 webmap 同一张雪碧图，
 * 图例绘制与 map 实例解耦，只需雪碧图地址（sprite.png）即可：
 * - loadSpriteImage：加载整张雪碧图，用于按坐标裁剪图案；
 * - loadSpriteMeta：加载同名 sprite.json，定位各图案在雪碧图中的坐标。
 * 两者均按 url 缓存 Promise，失败不缓存以便重试。
 */

const spriteImageCache = new Map();
const spriteMetaCache = new Map();

export function loadSpriteImage(url) {
  if (spriteImageCache.has(url)) {
    return spriteImageCache.get(url);
  }
  const promise = new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
  spriteImageCache.set(url, promise);
  promise.catch(() => spriteImageCache.delete(url));
  return promise;
}

export function loadSpriteMeta(url) {
  if (spriteMetaCache.has(url)) {
    return spriteMetaCache.get(url);
  }
  const jsonUrl = url.replace(/\.png($|\?)/, '.json$1');
  const promise = fetch(jsonUrl).then(res => {
    if (!res.ok) {
      throw new Error(`load sprite meta failed: ${res.status}`);
    }
    return res.json();
  });
  spriteMetaCache.set(url, promise);
  promise.catch(() => spriteMetaCache.delete(url));
  return promise;
}
