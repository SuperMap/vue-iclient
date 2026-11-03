import { mount } from '@vue/test-utils';
import ImageRenderer from '../subs/ImageRenderer.vue';
import { loadSpriteImage } from '../subs/sprite';

// 雪碧图改为内存中构造，不走网络与 new Image
jest.mock('../subs/sprite', () => ({
  loadSpriteImage: jest.fn(),
  loadSpriteMeta: jest.fn()
}));

const mockedLoadSpriteImage = loadSpriteImage;

// 通过 drawImage 调用参数断言图案的裁剪与落位
function createMockContext() {
  return {
    globalAlpha: 1,
    fillStyle: null,
    globalCompositeOperation: 'source-over',
    drawImage: jest.fn(),
    fillRect: jest.fn(),
    createPattern: jest.fn()
  };
}

function createMockCanvas(ctx) {
  const canvas = { style: {}, width: 0, height: 0, getContext: jest.fn(() => ctx) };
  return canvas;
}

let mockContext;
let canvas;
let getElementByIdBak;
let wrapper;

beforeEach(() => {
  mockContext = createMockContext();
  canvas = createMockCanvas(mockContext);
  getElementByIdBak = document.getElementById;
  document.getElementById = jest.fn(() => canvas);
});

afterEach(() => {
  document.getElementById = getElementByIdBak;
  mockedLoadSpriteImage.mockReset();
  if (wrapper) {
    wrapper.destroy();
    wrapper = null;
  }
});

const SPRITE_URL = 'http://localhost:8080/iportal/web/maps/1866201310/sprites/sprite.png';

function buildStyle(sprite, legendWidth = 100, legendHeight = 10) {
  return {
    style: {
      type: 'image',
      shape: 'line',
      width: legendWidth,
      height: legendHeight,
      url: SPRITE_URL,
      sprite: { sdf: false, pixelRatio: 1, x: 0, y: 0, ...sprite }
    }
  };
}

async function mountLineRenderer(styleData) {
  const fakeImage = { width: 200, height: 100 };
  mockedLoadSpriteImage.mockResolvedValue(fakeImage);
  wrapper = mount(ImageRenderer, { propsData: { styleData } });
  await new Promise(resolve => setTimeout(resolve, 0));
  return { canvas, fakeImage };
}

// drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) 调用参数中的落位部分
function getDrawImageDest(call) {
  return {
    sx: call[1],
    sy: call[2],
    sWidth: call[3],
    sHeight: call[4],
    dx: call[5],
    dy: call[6],
    dWidth: call[7],
    dHeight: call[8]
  };
}

describe('ImageRenderer 图片线符号', () => {
  it('使用外部传入的 height（10px），并按原始宽高比等比缩放图幅', async () => {
    // line-83030291: 100×32，缩放到高 10 后单幅宽 31.25
    const { canvas: legendCanvas } = await mountLineRenderer(buildStyle({ width: 100, height: 32 }));

    expect(legendCanvas.height).toBe(10);
    expect(legendCanvas.width).toBe(100);
  });

  it('x 方向只整幅重复：100px 内放得下 3 幅（第 4 幅会显示一半）时只画 3 幅', async () => {
    const { fakeImage } = await mountLineRenderer(buildStyle({ width: 100, height: 32 }));

    const calls = mockContext.drawImage.mock.calls;
    expect(calls).toHaveLength(3);
    calls.forEach(call => {
      const dest = getDrawImageDest(call);
      expect(dest.dHeight).toBe(10);
      expect(dest.dWidth).toBeCloseTo(31.25);
      expect(dest.dy).toBe(0);
    });
    expect(getDrawImageDest(calls[0]).dx).toBeCloseTo(0);
    expect(getDrawImageDest(calls[1]).dx).toBeCloseTo(31.25);
    expect(getDrawImageDest(calls[2]).dx).toBeCloseTo(62.5);
    // 源矩形取自雪碧图原符号（pixelRatio=1，原点 0,0）
    expect(calls[0][0]).toBe(fakeImage);
    expect(getDrawImageDest(calls[0]).sWidth).toBe(100);
    expect(getDrawImageDest(calls[0]).sHeight).toBe(32);
  });

  it('整幅恰好铺满 width 时（如 50×10、width=100）画 2 幅，不受浮点误差影响', async () => {
    const { canvas: legendCanvas } = await mountLineRenderer(buildStyle({ width: 50, height: 10 }));

    expect(mockContext.drawImage).toHaveBeenCalledTimes(2);
    const calls = mockContext.drawImage.mock.calls;
    expect(getDrawImageDest(calls[0]).dx).toBeCloseTo(0);
    expect(getDrawImageDest(calls[1]).dx).toBeCloseTo(50);
    expect(getDrawImageDest(calls[0]).dWidth).toBe(50);
    expect(legendCanvas.width).toBe(100);
  });

  it('单幅缩放后比 width 还宽（line-49050801: 100×9）时仍画 1 幅，避免图例空白', async () => {
    // 100×9 缩放到高 10 后单幅宽约 111.11，超出图例线长 100
    const { canvas: legendCanvas } = await mountLineRenderer(buildStyle({ width: 100, height: 9 }));

    expect(mockContext.drawImage).toHaveBeenCalledTimes(1);
    const dest = getDrawImageDest(mockContext.drawImage.mock.calls[0]);
    expect(dest.dx).toBe(0);
    expect(dest.dHeight).toBe(10);
    expect(dest.dWidth).toBeCloseTo(111.11, 1);
    // 超出部分由画布边缘自然裁切
    expect(legendCanvas.width).toBe(100);
    expect(legendCanvas.height).toBe(10);
  });

  it('带偏移的雪碧图符号：源矩形坐标随 x/y 与 pixelRatio 定位', async () => {
    // line-49050801 在雪碧图中位于 x:100, y:0
    const styleData = {
      style: {
        type: 'image',
        shape: 'line',
        width: 100,
        height: 10,
        url: SPRITE_URL,
        sprite: { sdf: false, pixelRatio: 1, x: 100, y: 0, width: 100, height: 9 }
      }
    };
    await mountLineRenderer(styleData);

    const source = getDrawImageDest(mockContext.drawImage.mock.calls[0]);
    expect(source.sx).toBe(100);
    expect(source.sy).toBe(0);
    expect(source.sWidth).toBe(100);
    expect(source.sHeight).toBe(9);
  });
});
