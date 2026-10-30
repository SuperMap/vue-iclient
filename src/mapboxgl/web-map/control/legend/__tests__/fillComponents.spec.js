import { mount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import StyleRenderer from '../subs/StyleRenderer.vue';
import ImageRenderer from '../subs/ImageRenderer.vue';
import StyleItem from '../subs/StyleItem.vue';
import StyleField from '../subs/StyleField.vue';
import { loadSpriteImage, loadSpriteMeta } from '../subs/sprite';
import zhLocale from 'vue-iclient/src/common/_lang/zh';
import enLocale from 'vue-iclient/src/common/_lang/en';

// 雪碧图加载与 DOM/网络耦合，统一 mock 为可控 Promise
jest.mock('../subs/sprite', () => ({
  loadSpriteImage: jest.fn(),
  loadSpriteMeta: jest.fn()
}));

function createMockCanvas() {
  const strokes = [];
  const imageDraws = [];
  const ctx = {
    globalAlpha: 1,
    lineWidth: 0,
    strokeStyle: null,
    lineJoin: null,
    beginPath: jest.fn(),
    rect: jest.fn(),
    setLineDash: jest.fn(),
    setTransform: jest.fn(),
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    stroke: jest.fn(() => {
      strokes.push({
        globalAlpha: ctx.globalAlpha,
        lineWidth: ctx.lineWidth,
        strokeStyle: ctx.strokeStyle,
        lineJoin: ctx.lineJoin
      });
    }),
    drawImage: jest.fn((...args) => imageDraws.push(args)),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn()
  };
  const canvas = { width: 0, height: 0, style: {}, getContext: jest.fn(() => ctx) };
  return { canvas, ctx, strokes, imageDraws };
}

describe('legend fill components', () => {
  let wrapper;

  beforeEach(() => {
    // mounted 中默认会取雪碧图，给一个成功的默认值，各用例可覆盖。
    // 雪碧图源需为真实 canvas 元素（jest-canvas-mock 的 drawImage 校验源类型）
    const defaultImage = document.createElement('canvas');
    defaultImage.width = 32;
    defaultImage.height = 32;
    loadSpriteImage.mockReset();
    loadSpriteMeta.mockReset();
    loadSpriteImage.mockResolvedValue(defaultImage);
    // 默认空元数据：图片 id 找不到时安全跳过，不抛错
    loadSpriteMeta.mockResolvedValue({});
  });

  afterEach(async () => {
    await flushPromises();
    if (wrapper) {
      wrapper.destroy();
      wrapper = null;
    }
  });

  it('uses ordered stops when a color gradient has named endpoints', () => {
    wrapper = mount(StyleRenderer, {
      propsData: {
        styleData: {
          style: {
            type: 'style',
            shape: 'point',
            colors: [
              { key: 'sourceColor', value: '#D53E4F' },
              { key: 'targetColor', value: '#3288BD' }
            ]
          },
          styleField: 'color'
        }
      }
    });

    expect(wrapper.vm.palette).toEqual([
      { color: '#D53E4F', offset: '0.00' },
      { color: '#3288BD', offset: '1.00' }
    ]);
    // Test setup returns i18n keys; the production locale resolves them to translated labels.
    expect(wrapper.vm.range).toEqual({ min: 'legend.sourceColor', max: 'legend.targetColor' });
    expect([zhLocale.legend.sourceColor, zhLocale.legend.targetColor]).toEqual(['底部颜色', '顶部颜色']);
    expect([enLocale.legend.sourceColor, enLocale.legend.targetColor]).toEqual(['Bottom Color', 'Top Color']);
    expect(wrapper.vm.linearColorStyle.backgroundImage).toBe('linear-gradient(90deg, #D53E4F,#3288BD)');
  });

  it('preserves numeric and ordinary named gradient endpoints', async () => {
    wrapper = mount(StyleRenderer, {
      propsData: {
        styleData: {
          style: { type: 'style', shape: 'point', colors: [{ key: 0, value: '#000' }, { key: 100, value: '#fff' }] },
          styleField: 'color'
        }
      }
    });
    expect(wrapper.vm.range).toEqual({ min: 0, max: 100 });
    expect(wrapper.vm.palette.map(stop => stop.offset)).toEqual(['0.00', '1.00']);
    await wrapper.setProps({ styleData: {
      style: { type: 'style', shape: 'point', colors: [{ key: 'sourceColor', value: '#000' }, { key: 'other', value: '#fff' }] },
      styleField: 'color'
    } });
    expect(wrapper.vm.range).toEqual({ min: 'sourceColor', max: 'other' });
  });

  describe('StyleRenderer.drawFillRect', () => {
    it('按 dpr 设置画布，先填充底色再同步绘制纯色轮廓', () => {
      const { canvas, ctx, strokes } = createMockCanvas();
      document.getElementById = jest.fn(() => canvas);
      wrapper = mount(StyleRenderer, {
        propsData: {
          styleData: {
            style: {
              type: 'fill',
              shape: 'rectangle',
              width: '20',
              height: '20',
              color: '#FF0000',
              opacity: 0.8,
              outlineStyle: 'solid',
              outlineColor: '#00FF00',
              outlineWidth: '2'
            }
          }
        }
      });
      // 线宽 2 → padding 1，画布外扩为 22，底色落在中心 20x20 填充区
      expect(canvas.width).toBe(22);
      expect(canvas.height).toBe(22);
      expect(canvas.style.width).toBe('22px');
      expect(ctx.setTransform).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0);
      expect(ctx.fillRect).toHaveBeenCalledWith(1, 1, 20, 20);
      expect(strokes.length).toBe(1);
      expect(strokes[0].strokeStyle).toBe('#00FF00');
      expect(strokes[0].lineWidth).toBe(2);
      // 轮廓不透明度独立于填充 opacity：纯色层自身 opacity 1、无整体 outlineOpacity → 1
      expect(strokes[0].globalAlpha).toBe(1);
    });

    it('宽度被单独提取时，其它分组未挂宽度：符号按默认宽度绘制 1px，画布外扩为 22', () => {
      const { canvas, strokes } = createMockCanvas();
      document.getElementById = jest.fn(() => canvas);
      wrapper = mount(StyleRenderer, {
        propsData: {
          styleData: {
            style: {
              type: 'fill',
              shape: 'rectangle',
              width: '20',
              height: '20',
              color: '#FF0000',
              outlineSymbolsContent: {
                symbolId: 'line-driven-sym',
                style: { paint: { 'line-width': 8, 'line-color': '#000000' } }
              }
            }
          },
          outlineWidthDriven: true
        }
      });
      // 默认宽度 0.5 → padding 1、画布 22，底色在中心填充区
      expect(canvas.width).toBe(22);
      expect(canvas.style.width).toBe('22px');
      expect(strokes.length).toBe(1);
      expect(strokes[0].lineWidth).toBe(1);
    });

    it('宽度未单独提取时符号保持自身宽度（线宽 8 → 画布 28、描边 8px）', () => {
      const { canvas, strokes } = createMockCanvas();
      document.getElementById = jest.fn(() => canvas);
      wrapper = mount(StyleRenderer, {
        propsData: {
          styleData: {
            style: {
              type: 'fill',
              shape: 'rectangle',
              width: '20',
              height: '20',
              color: '#FF0000',
              outlineSymbolsContent: {
                symbolId: 'line-not-driven-sym',
                style: { paint: { 'line-width': 8, 'line-color': '#000000' } }
              }
            }
          },
          outlineWidthDriven: false
        }
      });
      expect(canvas.width).toBe(28);
      expect(strokes[0].lineWidth).toBe(8);
    });

    it('宽度被单独提取时，宽度分组自身分段项挂有分段宽度，仍按真实宽度绘制', () => {
      const { canvas, strokes } = createMockCanvas();
      document.getElementById = jest.fn(() => canvas);
      wrapper = mount(StyleRenderer, {
        propsData: {
          styleData: {
            style: {
              type: 'fill',
              shape: 'rectangle',
              width: '20',
              height: '20',
              color: '#FF0000',
              outlineStyle: 'solid',
              outlineColor: '#000000',
              outlineWidth: 12,
              outlineSymbolsContent: {
                symbolId: 'line-driven-width-sym',
                style: { paint: { 'line-width': 2, 'line-color': '#FF0000' } }
              }
            }
          },
          outlineWidthDriven: true
        }
      });
      // 半幅笔刷 6 → 画布 32，描边 12px
      expect(canvas.width).toBe(32);
      expect(strokes[0].lineWidth).toBe(12);
    });

    it('outlineWidthDriven 为 true 时雪碧图重绘按默认宽度取图块（带宽 1px，每边 10 个）', async () => {
      const { canvas, imageDraws } = createMockCanvas();
      document.getElementById = jest.fn(() => canvas);
      const outlineSprites = { 'tex-id': { x: 0, y: 0, width: 8, height: 4, pixelRatio: 1 } };
      const spriteCanvas = document.createElement('canvas');
      spriteCanvas.width = 100;
      spriteCanvas.height = 100;
      loadSpriteImage.mockResolvedValue(spriteCanvas);
      wrapper = mount(StyleRenderer, {
        propsData: {
          styleData: {
            style: {
              type: 'fill',
              shape: 'rectangle',
              width: '20',
              height: '20',
              color: '#FF0000',
              url: 'sprite.png',
              outlineSprites,
              outlineSymbolsContent: {
                symbolId: 'line-driven-pattern',
                style: { paint: { 'line-width': 4, 'line-pattern': 'tex-id' } }
              }
            }
          },
          outlineWidthDriven: true
        }
      });
      await flushPromises();
      // 默认宽度 0.5 → 绘制带宽 1，8x4 图块等比为 2x1，边长 20 每边 10 个共 40 次 drawImage
      expect(imageDraws.length).toBe(40);
    });

    it('无轮廓时只填充底色不描边', () => {
      const { canvas, ctx, strokes } = createMockCanvas();
      document.getElementById = jest.fn(() => canvas);
      wrapper = mount(StyleRenderer, {
        propsData: {
          styleData: {
            style: { type: 'fill', shape: 'rectangle', width: '20', height: '20', color: '#FF0000' }
          }
        }
      });
      expect(ctx.fillRect).toHaveBeenCalled();
      expect(strokes).toEqual([]);
    });

    it('shape 为 fill 时走同一绘制路径', () => {
      const { canvas, ctx } = createMockCanvas();
      document.getElementById = jest.fn(() => canvas);
      wrapper = mount(StyleRenderer, {
        propsData: {
          styleData: {
            style: {
              type: 'fill',
              shape: 'fill',
              width: '20',
              height: '20',
              color: '#FF0000',
              outlineStyle: 'solid',
              outlineColor: '#000000',
              outlineWidth: 1
            }
          }
        }
      });
      expect(ctx.fillRect).toHaveBeenCalled();
    });

    it('dpr 为 2 时画布物理像素翻倍，CSS 尺寸保持不变', () => {
      Object.defineProperty(window, 'devicePixelRatio', { configurable: true, get: () => 2 });
      const { canvas, ctx } = createMockCanvas();
      document.getElementById = jest.fn(() => canvas);
      wrapper = mount(StyleRenderer, {
        propsData: {
          styleData: {
            style: { type: 'fill', shape: 'rectangle', width: '20', height: '20', color: '#FF0000' }
          }
        }
      });
      expect(canvas.width).toBe(40);
      expect(canvas.height).toBe(40);
      expect(canvas.style.width).toBe('20px');
      expect(ctx.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
      Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 1 });
    });

    it('附带 outlineSprites 元数据时，雪碧图就绪后清空重绘图片轮廓', async () => {
      const { canvas, ctx, imageDraws } = createMockCanvas();
      document.getElementById = jest.fn(() => canvas);
      const outlineSprites = { 'tex-id': { x: 0, y: 0, width: 8, height: 4, pixelRatio: 1 } };
      const spriteCanvas = document.createElement('canvas');
      spriteCanvas.width = 100;
      spriteCanvas.height = 100;
      loadSpriteImage.mockResolvedValue(spriteCanvas);
      wrapper = mount(StyleRenderer, {
        propsData: {
          styleData: {
            style: {
              type: 'fill',
              shape: 'rectangle',
              width: '20',
              height: '20',
              color: '#FF0000',
              url: 'sprite.png',
              outlineSprites,
              outlineSymbolsContent: {
                symbolId: 'line-pattern-1',
                style: { paint: { 'line-width': 4, 'line-pattern': 'tex-id' } }
              }
            }
          }
        }
      });
      // 同步阶段没有取图方式，图片层跳过
      expect(imageDraws.length).toBe(0);
      await flushPromises();
      expect(ctx.clearRect).toHaveBeenCalled();
      // 重绘后：图案 8x4 按带宽 4 等比取宽 8，inset=2、描边边长 20，每边 2 个共 8 次 drawImage
      expect(imageDraws.length).toBe(8);
    });

    it('未附带 outlineSprites 时请求 sprite.json，成功后用元数据重绘', async () => {
      const { canvas, imageDraws } = createMockCanvas();
      document.getElementById = jest.fn(() => canvas);
      const spriteCanvas = document.createElement('canvas');
      spriteCanvas.width = 100;
      spriteCanvas.height = 100;
      loadSpriteImage.mockResolvedValue(spriteCanvas);
      loadSpriteMeta.mockResolvedValue({ 'tex-id': { x: 0, y: 0, width: 8, height: 4 } });
      wrapper = mount(StyleRenderer, {
        propsData: {
          styleData: {
            style: {
              type: 'fill',
              shape: 'rectangle',
              width: '20',
              height: '20',
              color: '#FF0000',
              url: 'sprite.png',
              outlineSymbolsContent: {
                symbolId: 'line-pattern-2',
                style: { paint: { 'line-width': 4, 'line-pattern': 'tex-id' } }
              }
            }
          }
        }
      });
      await flushPromises();
      expect(loadSpriteMeta).toHaveBeenCalledWith('sprite.png');
      expect(imageDraws.length).toBe(8);
    });

    it('sprite.json 请求失败时不重绘图片轮廓', async () => {
      const { canvas, imageDraws } = createMockCanvas();
      document.getElementById = jest.fn(() => canvas);
      const spriteCanvas = document.createElement('canvas');
      spriteCanvas.width = 100;
      spriteCanvas.height = 100;
      loadSpriteImage.mockResolvedValue(spriteCanvas);
      loadSpriteMeta.mockRejectedValue(new Error('404'));
      wrapper = mount(StyleRenderer, {
        propsData: {
          styleData: {
            style: {
              type: 'fill',
              shape: 'rectangle',
              width: '20',
              height: '20',
              color: '#FF0000',
              url: 'sprite.png',
              outlineSymbolsContent: {
                symbolId: 'line-pattern-3',
                style: { paint: { 'line-width': 4, 'line-pattern': 'tex-id' } }
              }
            }
          }
        }
      });
      await flushPromises();
      expect(imageDraws.length).toBe(0);
    });

    it('雪碧图加载失败时不重绘且不抛错', async () => {
      const { canvas, ctx, imageDraws } = createMockCanvas();
      document.getElementById = jest.fn(() => canvas);
      loadSpriteImage.mockRejectedValue(new Error('load error'));
      wrapper = mount(StyleRenderer, {
        propsData: {
          styleData: {
            style: {
              type: 'fill',
              shape: 'rectangle',
              width: '20',
              height: '20',
              color: '#FF0000',
              url: 'sprite.png',
              outlineSymbolsContent: {
                symbolId: 'line-pattern-4',
                style: { paint: { 'line-width': 4, 'line-pattern': 'tex-id' } }
              }
            }
          }
        }
      });
      await flushPromises();
      expect(imageDraws.length).toBe(0);
      expect(ctx.clearRect).not.toHaveBeenCalled();
    });

    it('组件已销毁后雪碧图才就绪时不重绘', async () => {
      const { canvas, ctx } = createMockCanvas();
      document.getElementById = jest.fn(() => canvas);
      const outlineSprites = { 'tex-id': { x: 0, y: 0, width: 8, height: 4 } };
      const spriteCanvas = document.createElement('canvas');
      spriteCanvas.width = 100;
      spriteCanvas.height = 100;
      loadSpriteImage.mockResolvedValue(spriteCanvas);
      wrapper = mount(StyleRenderer, {
        propsData: {
          styleData: {
            style: {
              type: 'fill',
              shape: 'rectangle',
              width: '20',
              height: '20',
              color: '#FF0000',
              url: 'sprite.png',
              outlineSprites,
              outlineSymbolsContent: {
                symbolId: 'line-pattern-5',
                style: { paint: { 'line-width': 4, 'line-pattern': 'tex-id' } }
              }
            }
          }
        }
      });
      wrapper.destroy();
      wrapper = null;
      await flushPromises();
      expect(ctx.clearRect).not.toHaveBeenCalled();
    });

    it('无 url 时不请求雪碧图', () => {
      const { canvas } = createMockCanvas();
      document.getElementById = jest.fn(() => canvas);
      wrapper = mount(StyleRenderer, {
        propsData: {
          styleData: {
            style: {
              type: 'fill',
              shape: 'rectangle',
              width: '20',
              height: '20',
              color: '#FF0000',
              outlineSymbolsContent: {
                symbolId: 'line-pattern-6',
                style: { paint: { 'line-width': 4, 'line-pattern': 'tex-id' } }
              }
            }
          }
        }
      });
      expect(loadSpriteImage).not.toHaveBeenCalled();
    });

    it('paintFillBase 按给定不透明度填充底色并恢复 globalAlpha', () => {
      const { canvas, ctx } = createMockCanvas();
      document.getElementById = jest.fn(() => canvas);
      wrapper = mount(StyleRenderer, {
        propsData: {
          styleData: {
            style: { type: 'fill', shape: 'rectangle', width: '20', height: '20', color: '#FF0000' }
          }
        }
      });
      wrapper.vm.paintFillBase(ctx, 20, 0, '#123456', 0.5);
      expect(ctx.fillStyle).toBe('#123456');
      expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 20, 20);
      expect(ctx.globalAlpha).toBe(1);
    });
  });

  describe('ImageRenderer', () => {
    it('mounted 雪碧图加载成功后绘制图片', async () => {
      const { canvas, ctx } = createMockCanvas();
      document.getElementById = jest.fn(() => canvas);
      loadSpriteImage.mockResolvedValue({ width: 32, height: 32 });
      wrapper = mount(ImageRenderer, {
        propsData: {
          styleData: {
            style: {
              type: 'image',
              shape: 'POINT',
              fontSize: 35,
              color: '#EE4D5A',
              opacity: 0.9,
              url: 'sprite.png',
              sprite: { sdf: false, width: 32, height: 32 }
            }
          }
        }
      });
      await flushPromises();
      expect(ctx.drawImage).toHaveBeenCalled();
    });

    it('rectangle 图片轮廓且附带 outlineSprites 时，雪碧图就绪后铺设轮廓', async () => {
      const { canvas, imageDraws } = createMockCanvas();
      document.getElementById = jest.fn(() => canvas);
      const outlineSprites = { 'tex-id': { x: 0, y: 0, width: 8, height: 4, pixelRatio: 1 } };
      const spriteCanvas = document.createElement('canvas');
      spriteCanvas.width = 100;
      spriteCanvas.height = 100;
      loadSpriteImage.mockResolvedValue(spriteCanvas);
      wrapper = mount(ImageRenderer, {
        propsData: {
          styleData: {
            style: {
              type: 'image',
              shape: 'rectangle',
              width: 20,
              height: 20,
              url: 'sprite.png',
              sprite: { x: 0, y: 0, width: 8, height: 4 },
              backgroundColor: '#FF0000',
              outlineSprites,
              outlineSymbolsContent: {
                symbolId: 'line-img-1',
                style: { paint: { 'line-width': 4, 'line-pattern': 'tex-id' } }
              }
            }
          }
        }
      });
      await flushPromises();
      // 主图 drawImage 1 次 + 轮廓 8 次（8x4 图案、inset=2、每边 2 个）
      expect(imageDraws.length).toBe(9);
    });

    it('未附带 outlineSprites 时请求 sprite.json，成功后用元数据绘制', async () => {
      const { canvas, imageDraws } = createMockCanvas();
      document.getElementById = jest.fn(() => canvas);
      const spriteCanvas = document.createElement('canvas');
      spriteCanvas.width = 100;
      spriteCanvas.height = 100;
      loadSpriteImage.mockResolvedValue(spriteCanvas);
      loadSpriteMeta.mockResolvedValue({ 'tex-id': { x: 0, y: 0, width: 8, height: 4 } });
      wrapper = mount(ImageRenderer, {
        propsData: {
          styleData: {
            style: {
              type: 'image',
              shape: 'rectangle',
              width: 20,
              height: 20,
              url: 'sprite.png',
              sprite: { x: 0, y: 0, width: 8, height: 4 },
              backgroundColor: '#FF0000',
              outlineSymbolsContent: {
                symbolId: 'line-img-2',
                style: { paint: { 'line-width': 4, 'line-pattern': 'tex-id' } }
              }
            }
          }
        }
      });
      await flushPromises();
      expect(loadSpriteMeta).toHaveBeenCalledWith('sprite.png');
      expect(imageDraws.length).toBe(9);
    });

    it('sprite.json 加载失败时退化为不带元数据绘制', async () => {
      const { canvas, ctx } = createMockCanvas();
      document.getElementById = jest.fn(() => canvas);
      const spriteCanvas = document.createElement('canvas');
      spriteCanvas.width = 100;
      spriteCanvas.height = 100;
      loadSpriteImage.mockResolvedValue(spriteCanvas);
      loadSpriteMeta.mockRejectedValue(new Error('404'));
      wrapper = mount(ImageRenderer, {
        propsData: {
          styleData: {
            style: {
              type: 'image',
              shape: 'rectangle',
              width: 20,
              height: 20,
              url: 'sprite.png',
              sprite: { x: 0, y: 0, width: 8, height: 4 },
              backgroundColor: '#FF0000',
              outlineSymbolsContent: {
                symbolId: 'line-img-3',
                style: { paint: { 'line-width': 4, 'line-pattern': 'tex-id' } }
              }
            }
          }
        }
      });
      await flushPromises();
      // 填充图片本身仍绘制一次（非 repeat），图片轮廓层跳过
      expect(ctx.drawImage).toHaveBeenCalledTimes(1);
    });

    it('雪碧图加载失败时不绘制且不抛错', async () => {
      const { canvas, ctx } = createMockCanvas();
      document.getElementById = jest.fn(() => canvas);
      loadSpriteImage.mockRejectedValue(new Error('load error'));
      wrapper = mount(ImageRenderer, {
        propsData: {
          styleData: {
            style: {
              type: 'image',
              shape: 'POINT',
              fontSize: 35,
              url: 'sprite.png',
              sprite: { sdf: false, width: 32, height: 32 }
            }
          }
        }
      });
      await flushPromises();
      expect(ctx.drawImage).not.toHaveBeenCalled();
    });

    it('drawImage：rectangle 纯色轮廓随图片填充一起绘制', () => {
      const { canvas, strokes } = createMockCanvas();
      document.getElementById = jest.fn(() => canvas);
      wrapper = mount(ImageRenderer, {
        propsData: {
          styleData: {
            style: {
              type: 'image',
              shape: 'rectangle',
              width: 20,
              height: 20,
              url: 'sprite.png',
              sprite: { x: 0, y: 0, width: 8, height: 4 },
              backgroundColor: '#FF0000',
              outlineStyle: 'solid',
              outlineColor: '#0000FF',
              outlineWidth: 2
            }
          }
        }
      });
      // 不等待 mounted 的异步绘制，直接手动调用验证轮廓路径
      wrapper.vm.drawImage({ width: 100, height: 100 });
      expect(strokes.length).toBe(1);
      expect(strokes[0].strokeStyle).toBe('#0000FF');
      expect(strokes[0].lineWidth).toBe(2);
    });

    it('drawImage：outlineWidthDriven 为 true 且未挂宽度时，符号按默认宽度 1px 绘制', () => {
      const { canvas, strokes, imageDraws } = createMockCanvas();
      document.getElementById = jest.fn(() => canvas);
      wrapper = mount(ImageRenderer, {
        propsData: {
          styleData: {
            style: {
              type: 'image',
              shape: 'rectangle',
              width: 20,
              height: 20,
              url: 'sprite.png',
              sprite: { x: 0, y: 0, width: 8, height: 4 },
              backgroundColor: '#FF0000',
              outlineSymbolsContent: {
                symbolId: 'line-driven-img-sym',
                style: { paint: { 'line-width': 8, 'line-color': '#000000' } }
              }
            }
          },
          outlineWidthDriven: true
        }
      });
      wrapper.vm.drawImage({ width: 100, height: 100 });
      // 默认宽度 0.5 → padding 1、画布 22，主图片落在中心填充区
      expect(canvas.width).toBe(22);
      expect(imageDraws.length).toBe(1);
      expect(imageDraws[0].slice(-4)).toEqual([1, 1, 20, 20]);
      expect(strokes[0].lineWidth).toBe(1);
    });

    it('drawImage：非 rectangle 形状不绘制轮廓', () => {
      const { canvas, strokes } = createMockCanvas();
      document.getElementById = jest.fn(() => canvas);
      wrapper = mount(ImageRenderer, {
        propsData: {
          styleData: {
            style: {
              type: 'image',
              shape: 'POINT',
              fontSize: 35,
              url: 'sprite.png',
              sprite: { sdf: false, width: 32, height: 32 },
              outlineStyle: 'solid',
              outlineColor: '#0000FF',
              outlineWidth: 2
            }
          }
        }
      });
      wrapper.vm.drawImage({ width: 32, height: 32 });
      expect(strokes).toEqual([]);
    });

    it('hasImageOutline：非矩形/矢量符号为 false，矩形图片符号为 true', () => {
      const { canvas } = createMockCanvas();
      document.getElementById = jest.fn(() => canvas);
      const imageSymbol = {
        symbolId: 'line-sym',
        style: { paint: { 'line-width': 4, 'line-pattern': 'tex-id' } }
      };
      const vectorSymbol = {
        symbolId: 'line-sym',
        style: { paint: { 'line-width': 2, 'line-color': '#000000' } }
      };
      const mountImage = style => {
        if (wrapper) {
          wrapper.destroy();
        }
        wrapper = mount(ImageRenderer, { propsData: { styleData: { style } } });
        return wrapper.vm;
      };
      const pointVm = mountImage({
        type: 'image', shape: 'POINT', fontSize: 35, url: 'sprite.png',
        sprite: { width: 32, height: 32 }, outlineSymbolsContent: imageSymbol
      });
      expect(pointVm.hasImageOutline).toBe(false);
      const vectorVm = mountImage({
        type: 'image', shape: 'rectangle', width: 20, height: 20, url: 'sprite.png',
        sprite: {}, outlineSymbolsContent: vectorSymbol
      });
      expect(vectorVm.hasImageOutline).toBe(false);
      const imageVm = mountImage({
        type: 'image', shape: 'rectangle', width: 20, height: 20, url: 'sprite.png',
        sprite: {}, outlineSymbolsContent: imageSymbol
      });
      expect(imageVm.hasImageOutline).toBe(true);
      // outlineSprites 不进入 cssStyle
      expect(imageVm.cssStyle.outlineSprites).toBeUndefined();
    });
  });

  describe('StyleItem', () => {
    it('默认 outlineWidthDriven 为 false', () => {
      const { canvas } = createMockCanvas();
      document.getElementById = jest.fn(() => canvas);
      const styleData = {
        style: { type: 'fill', shape: 'rectangle', width: '20', height: '20', color: '#FF0000' }
      };
      wrapper = mount(StyleItem, { propsData: { styleData } });
      expect(wrapper.find(StyleRenderer).props('outlineWidthDriven')).toBe(false);
    });

    it('outlineWidthDriven 透传给 StyleRenderer', () => {
      const { canvas } = createMockCanvas();
      document.getElementById = jest.fn(() => canvas);
      const styleData = {
        style: { type: 'fill', shape: 'rectangle', width: '20', height: '20', color: '#FF0000' }
      };
      wrapper = mount(StyleItem, { propsData: { styleData, outlineWidthDriven: true } });
      expect(wrapper.find(StyleRenderer).props('outlineWidthDriven')).toBe(true);
    });

    it('outlineWidthDriven 透传给 ImageRenderer', () => {
      const { canvas } = createMockCanvas();
      document.getElementById = jest.fn(() => canvas);
      const styleData = {
        style: { type: 'image', shape: 'POINT', fontSize: 10, url: 'sprite.png', sprite: { width: 10, height: 10 } }
      };
      wrapper = mount(StyleItem, { propsData: { styleData, outlineWidthDriven: true } });
      expect(wrapper.find(ImageRenderer).props('outlineWidthDriven')).toBe(true);
    });
  });

  describe('StyleField 新增字段', () => {
    it('styleField 为 outlineSymbolsContent 时拼接轮廓线符号标签', () => {
      const tMock = jest.fn(msg => msg);
      wrapper = mount(StyleField, {
        propsData: { styleField: 'outlineSymbolsContent', themeField: '符号A' },
        mocks: { $t: tMock }
      });
      expect(tMock).toHaveBeenCalledWith('legend.outlineSymbolsContent');
      expect(tMock).toHaveBeenCalledWith(
        'legend.parentheses',
        expect.objectContaining({ tips: 'legend.outlineSymbolsContent' })
      );
    });

    it('styleField 为 outlineOpacity 时拼接轮廓线不透明度标签', () => {
      const tMock = jest.fn(msg => msg);
      wrapper = mount(StyleField, {
        propsData: { styleField: 'outlineOpacity', themeField: '0.5' },
        mocks: { $t: tMock }
      });
      expect(tMock).toHaveBeenCalledWith('legend.outlineOpacity');
      expect(tMock).toHaveBeenCalledWith(
        'legend.parentheses',
        expect.objectContaining({ tips: 'legend.outlineOpacity' })
      );
    });
  });
});
