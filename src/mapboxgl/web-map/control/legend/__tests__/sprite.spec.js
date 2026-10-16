import { loadSpriteImage, loadSpriteMeta } from '../subs/sprite';

describe('sprite', () => {
  describe('loadSpriteImage', () => {
    let createdImages;
    const ImageBak = global.Image;

    beforeEach(() => {
      createdImages = [];
      global.Image = class MockImage {
        constructor() {
          createdImages.push(this);
        }
      };
    });

    afterEach(() => {
      global.Image = ImageBak;
    });

    it('加载成功时 resolve 图片，并按 url 缓存同一个 Promise', async () => {
      const url = 'sprite-load-success.png';
      const promise1 = loadSpriteImage(url);
      const promise2 = loadSpriteImage(url);
      expect(promise1).toBe(promise2);
      expect(createdImages.length).toBe(1);
      const img = createdImages[0];
      expect(img.src).toBe(url);
      img.onload(img);
      await expect(promise1).resolves.toBe(img);
      // 加载完成后再次调用仍命中缓存，不再创建图片
      const promise3 = loadSpriteImage(url);
      expect(promise3).toBe(promise1);
      expect(createdImages.length).toBe(1);
    });

    it('加载失败时 reject 且不缓存，可重新加载', async () => {
      const url = 'sprite-load-fail.png';
      const promise1 = loadSpriteImage(url);
      const error = new Error('load failed');
      createdImages[0].onerror(error);
      await expect(promise1).rejects.toBe(error);
      // 失败后缓存被清除，重新调用会创建新图片
      const promise2 = loadSpriteImage(url);
      expect(promise2).not.toBe(promise1);
      expect(createdImages.length).toBe(2);
      createdImages[1].onload(createdImages[1]);
      await expect(promise2).resolves.toBe(createdImages[1]);
    });
  });

  describe('loadSpriteMeta', () => {
    const fetchBak = global.fetch;
    let fetchMock;

    beforeEach(() => {
      fetchMock = jest.fn();
      global.fetch = fetchMock;
    });

    afterEach(() => {
      global.fetch = fetchBak;
    });

    it('将同名 .png 地址替换为 .json 请求并返回元数据', async () => {
      const meta = { 'icon-id': { x: 1, y: 2, width: 8, height: 8 } };
      fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve(meta) });
      const result = await loadSpriteMeta('http://example.com/sprite.png');
      expect(fetchMock).toHaveBeenCalledWith('http://example.com/sprite.json');
      expect(result).toEqual(meta);
    });

    it('替换扩展名时保留 query string', async () => {
      fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
      await loadSpriteMeta('http://example.com/sprite.png?token=abc&v=1');
      expect(fetchMock).toHaveBeenCalledWith('http://example.com/sprite.json?token=abc&v=1');
    });

    it('按 url 缓存同一个 Promise，不重复请求', () => {
      fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
      const promise1 = loadSpriteMeta('sprite-meta-cache.png');
      const promise2 = loadSpriteMeta('sprite-meta-cache.png');
      expect(promise1).toBe(promise2);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('响应非 2xx 时抛出包含状态码的错误', async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 404 });
      await expect(loadSpriteMeta('sprite-meta-404.png')).rejects.toThrow('404');
    });

    it('请求失败后不缓存，可重新请求', async () => {
      fetchMock
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ retried: true }) });
      const promise1 = loadSpriteMeta('sprite-meta-retry.png');
      await expect(promise1).rejects.toThrow('500');
      const promise2 = loadSpriteMeta('sprite-meta-retry.png');
      await expect(promise2).resolves.toEqual({ retried: true });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });
});
