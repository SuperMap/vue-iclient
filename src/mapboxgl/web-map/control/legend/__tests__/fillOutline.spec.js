import {
  clampOpacity,
  getFillOutlineLayers,
  getPlainOutlineLayer,
  getOutlineDrawWidth,
  getOutlinePadding,
  getFillLegendPadding,
  resolveFillOutlineLayers,
  DEFAULT_FILL_OUTLINE_WIDTH,
  drawFillOutline,
  drawFillLegendOutline,
  createOutlineTileFromSprite
} from '../subs/fillOutline';

function createMockContext() {
  const strokes = [];
  const imageDraws = [];
  const ctx = {
    globalAlpha: 1,
    lineWidth: 0,
    strokeStyle: null,
    lineJoin: null,
    beginPath: jest.fn(),
    rect: jest.fn(),
    setLineDash: jest.fn(dash => {
      ctx._lastDash = dash;
    }),
    clearRect: jest.fn(),
    stroke: jest.fn(() => {
      strokes.push({
        globalAlpha: ctx.globalAlpha,
        lineWidth: ctx.lineWidth,
        strokeStyle: ctx.strokeStyle,
        lineJoin: ctx.lineJoin,
        dash: ctx._lastDash
      });
    }),
    drawImage: jest.fn((...args) => {
      imageDraws.push(args);
    }),
    createPattern: jest.fn(() => ({ pattern: true })),
    createImageData: jest.fn((width, height) => ({ width, height, data: new Uint8ClampedArray(width * height * 4) })),
    putImageData: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn()
  };
  return { ctx, strokes, imageDraws };
}

describe('fillOutline', () => {
  describe('clampOpacity', () => {
    it('将不透明度限制在 0-1 之间', () => {
      expect(clampOpacity(-0.5)).toBe(0);
      expect(clampOpacity(1.5)).toBe(1);
      expect(clampOpacity(0.3)).toBe(0.3);
    });

    it('边界值 0 和 1 原样返回', () => {
      expect(clampOpacity(0)).toBe(0);
      expect(clampOpacity(1)).toBe(1);
    });
  });

  describe('getOutlineDrawWidth', () => {
    it('按真实线宽 1:1 四舍五入，最小为 1px（宽度分段差异由此保留）', () => {
      expect(getOutlineDrawWidth(0.2)).toBe(1);
      expect(getOutlineDrawWidth(3)).toBe(3);
      // 粗线宽不再钳制，靠画布外扩 padding 容纳
      expect(getOutlineDrawWidth(16)).toBe(16);
    });

    it('非正数宽度取 1，小数宽度四舍五入', () => {
      expect(getOutlineDrawWidth(0)).toBe(1);
      expect(getOutlineDrawWidth(-5)).toBe(1);
      expect(getOutlineDrawWidth(3.4)).toBe(3);
      expect(getOutlineDrawWidth(4)).toBe(4);
    });
  });

  describe('getOutlinePadding', () => {
    it('无轮廓层时出血位为 0', () => {
      expect(getOutlinePadding([])).toBe(0);
    });

    it('按半幅笔刷计算出血位：宽度 4 → padding 2，宽度 2 → padding 1', () => {
      expect(getOutlinePadding([getPlainOutlineLayer('#000000', 4)])).toBe(2);
      expect(getOutlinePadding([getPlainOutlineLayer('#000000', 2)])).toBe(1);
    });

    it('宽度 0.5（绘制宽 1）时出血位为 1', () => {
      expect(getOutlinePadding([getPlainOutlineLayer('#000000', 0.5)])).toBe(1);
    });

    it('取所有图层外扩量的最大值：多图层粗线决定 padding', () => {
      const layers = [
        getPlainOutlineLayer('#000000', 2),
        getPlainOutlineLayer('#FFFFFF', 12)
      ];
      expect(getOutlinePadding(layers)).toBe(6);
    });

    it('正 offset 向内减小外扩，负 offset 向外增大外扩', () => {
      const posLayer = { ...getPlainOutlineLayer('#000000', 4), offset: 2 };
      expect(getOutlinePadding([posLayer])).toBe(0);
      const negLayer = { ...getPlainOutlineLayer('#000000', 4), offset: -2 };
      expect(getOutlinePadding([negLayer])).toBe(4);
    });
  });

  describe('getFillLegendPadding', () => {
    it('纯色轮廓宽度 4 → 出血位 2', () => {
      expect(
        getFillLegendPadding({ outlineStyle: 'solid', outlineColor: '#000000', outlineWidth: 4 })
      ).toBe(2);
    });

    it('无轮廓（outlineStyle none 且无轮廓符号）→ 出血位 0', () => {
      expect(getFillLegendPadding({ outlineStyle: 'none', outlineColor: '#000000' })).toBe(0);
    });

    it('轮廓线符号按覆盖后的分段宽度计算出血位', () => {
      const styleData = {
        outlineWidth: 12,
        outlineSymbolsContent: {
          symbolId: 'line-pad',
          style: { paint: { 'line-width': 2, 'line-color': '#000000' } }
        }
      };
      expect(getFillLegendPadding(styleData)).toBe(6);
    });

    it('宽度被单独提取时，其它分组未挂宽度：符号按默认宽度 0.5 → padding 1', () => {
      const styleData = {
        outlineSymbolsContent: {
          symbolId: 'line-pad-driven',
          style: { paint: { 'line-width': 10, 'line-color': '#000000' } }
        }
      };
      // 未驱动时保持符号自身宽度 10 → padding 5
      expect(getFillLegendPadding(styleData, false)).toBe(5);
      // 驱动后其它分组回退默认宽度 → padding 1
      expect(getFillLegendPadding(styleData, true)).toBe(1);
    });
  });

  describe('resolveFillOutlineLayers', () => {
    it('默认轮廓宽度常量为 0.5，与面默认 outlineWidth 一致', () => {
      expect(DEFAULT_FILL_OUTLINE_WIDTH).toBe(0.5);
    });

    it('styleData 为空或无轮廓时 layers 为空，轮廓不透明度默认为 1', () => {
      expect(resolveFillOutlineLayers(null).layers).toEqual([]);
      expect(resolveFillOutlineLayers(null).outlineOpacity).toBe(1);
      expect(resolveFillOutlineLayers({ outlineStyle: 'none' }).layers).toEqual([]);
    });

    it('纯色轮廓归一化为单矢量图层，像素字符串宽度解析为数字', () => {
      const { layers } = resolveFillOutlineLayers({
        outlineStyle: 'solid',
        outlineColor: '#FF0000',
        outlineWidth: '4px'
      });
      expect(layers.length).toBe(1);
      expect(layers[0].color).toBe('#FF0000');
      expect(layers[0].lineWidth).toBe(4);
    });

    it('未驱动（默认/false）时符号各子层保持自身宽度，多层线符号不被压平', () => {
      const styleData = {
        outlineSymbolsContent: {
          symbolId: 'line-railway',
          style: [
            { paint: { 'line-width': 8, 'line-color': '#000000' } },
            { paint: { 'line-width': 2, 'line-color': '#FFFFFF', 'line-dasharray': [2, 2] } }
          ]
        }
      };
      expect(resolveFillOutlineLayers(styleData).layers.map(l => l.lineWidth)).toEqual([8, 2]);
      expect(resolveFillOutlineLayers(styleData, false).layers.map(l => l.lineWidth)).toEqual([8, 2]);
    });

    it('宽度被单独提取时，其它分组符号所有矢量子层统一按默认宽度 0.5', () => {
      const styleData = {
        outlineSymbolsContent: {
          symbolId: 'line-railway-driven',
          style: [
            { paint: { 'line-width': 8, 'line-color': '#000000' } },
            { paint: { 'line-width': 2, 'line-color': '#FFFFFF' } }
          ]
        }
      };
      const { layers } = resolveFillOutlineLayers(styleData, true);
      expect(layers.length).toBe(2);
      layers.forEach(layer => expect(layer.lineWidth).toBe(DEFAULT_FILL_OUTLINE_WIDTH));
    });

    it('宽度被单独提取时，图片符号子层同样按默认宽度 0.5 覆盖', () => {
      const styleData = {
        outlineSymbolsContent: {
          symbolId: 'line-img-driven',
          style: { paint: { 'line-width': 4, 'line-pattern': 'tex-id' } }
        }
      };
      const { layers } = resolveFillOutlineLayers(styleData, true);
      expect(layers[0].kind).toBe('image');
      expect(layers[0].lineWidth).toBe(DEFAULT_FILL_OUTLINE_WIDTH);
    });

    it('宽度被单独提取时，宽度分组自身分段项挂有分段宽度，按分段值解析', () => {
      const styleData = {
        outlineWidth: 12,
        outlineColor: '#FF0000',
        outlineSymbolsContent: {
          symbolId: 'line-width-segment',
          style: { paint: { 'line-width': 2, 'line-color': '#000000' } }
        }
      };
      const { layers } = resolveFillOutlineLayers(styleData, true);
      expect(layers[0].lineWidth).toBe(12);
      expect(layers[0].color).toBe('#FF0000');
    });

    it('解析轮廓整体不透明度并钳制到 0-1', () => {
      expect(resolveFillOutlineLayers({ outlineOpacity: 0.3 }).outlineOpacity).toBe(0.3);
      expect(resolveFillOutlineLayers({ outlineOpacity: 5 }).outlineOpacity).toBe(1);
    });
  });

  describe('getFillOutlineLayers', () => {
    it('归一化矢量线图层', () => {
      const layers = getFillOutlineLayers({
        symbolId: 'line-1',
        style: {
          layout: { 'line-join': 'round' },
          paint: {
            'line-width': 2,
            'line-color': '#FF0000',
            'line-dasharray': [2, 4],
            'line-offset': -1,
            'line-opacity': 0.8
          }
        }
      });
      expect(layers).toEqual([
        {
          kind: 'vector',
          lineWidth: 2,
          color: '#FF0000',
          dasharray: [2, 4],
          offset: -1,
          opacity: 0.8,
          lineJoin: 'round'
        }
      ]);
    });

    it('归一化 line-pattern 图片符号层', () => {
      const layers = getFillOutlineLayers({
        symbolId: 'line-2',
        style: { paint: { 'line-width': 6, 'line-pattern': 'texture-id' } }
      });
      expect(layers).toEqual([
        { kind: 'image', imageId: 'texture-id', lineWidth: 6, offset: 0, opacity: 1, spacing: null }
      ]);
    });

    it('归一化 icon-image 图标点层，读取 symbol-spacing', () => {
      const layers = getFillOutlineLayers({
        symbolId: 'line-3',
        style: {
          layout: { 'icon-image': 'icon-id', 'symbol-spacing': 12 },
          paint: { 'line-width': 3 }
        }
      });
      expect(layers[0]).toEqual({
        kind: 'image',
        imageId: 'icon-id',
        lineWidth: 3,
        offset: 0,
        opacity: 1,
        spacing: 12
      });
    });

    it('支持多图层符号，忽略非线图层', () => {
      const layers = getFillOutlineLayers({
        symbolId: 'line-4',
        style: [
          { paint: { 'line-color': '#00FF00', 'line-width': 1 } },
          { paint: { 'fill-color': '#0000FF' } }
        ]
      });
      expect(layers.length).toBe(1);
      expect(layers[0].color).toBe('#00FF00');
    });

    it('空符号返回空数组', () => {
      expect(getFillOutlineLayers(null)).toEqual([]);
      expect(getFillOutlineLayers({ symbolId: 'line-5' })).toEqual([]);
    });

    it('icon-image 缺省线宽与间距时使用默认值', () => {
      const layers = getFillOutlineLayers({
        symbolId: 'line-default-icon',
        style: { layout: { 'icon-image': 'icon-id' } }
      });
      expect(layers[0]).toEqual({
        kind: 'image',
        imageId: 'icon-id',
        lineWidth: 0,
        offset: 0,
        opacity: 1,
        spacing: null
      });
    });

    it('line-pattern 缺省线宽时默认为 1', () => {
      const layers = getFillOutlineLayers({
        symbolId: 'line-default-pattern',
        style: { paint: { 'line-pattern': 'texture-id' } }
      });
      expect(layers[0].lineWidth).toBe(1);
    });

    it('矢量层缺省线宽、颜色为非字符串时使用默认值', () => {
      const layers = getFillOutlineLayers({
        symbolId: 'line-default-vector',
        style: { paint: { 'line-color': 12345 } }
      });
      expect(layers[0]).toEqual({
        kind: 'vector',
        lineWidth: 1,
        color: '#FFFFFF',
        dasharray: [],
        offset: 0,
        opacity: 1,
        lineJoin: 'miter'
      });
    });

    it('虚线数组含非数字项或缺省时归约为空数组', () => {
      const layers = getFillOutlineLayers({
        symbolId: 'line-bad-dash',
        style: { paint: { 'line-width': 1, 'line-dasharray': [2, '4'] } }
      });
      expect(layers[0].dasharray).toEqual([]);
      const noDash = getFillOutlineLayers({
        symbolId: 'line-no-dash',
        style: { paint: { 'line-width': 1 } }
      });
      expect(noDash[0].dasharray).toEqual([]);
    });

    it('line-join 为 bevel 时保留，非法值归约为 miter', () => {
      const bevelLayers = getFillOutlineLayers({
        symbolId: 'line-bevel',
        style: { layout: { 'line-join': 'bevel' }, paint: { 'line-width': 1 } }
      });
      expect(bevelLayers[0].lineJoin).toBe('bevel');
      const weirdLayers = getFillOutlineLayers({
        symbolId: 'line-weird-join',
        style: { layout: { 'line-join': 'weird' }, paint: { 'line-width': 1 } }
      });
      expect(weirdLayers[0].lineJoin).toBe('miter');
    });

    it('传入轮廓色和轮廓宽时优先于符号自身的 line-color / line-width', () => {
      const layers = getFillOutlineLayers(
        {
          symbolId: 'line-override',
          style: {
            paint: { 'line-width': 2, 'line-color': '#00FF00' }
          }
        },
        'rgba(195,16,16,1)',
        10
      );
      expect(layers[0].color).toBe('rgba(195,16,16,1)');
      expect(layers[0].lineWidth).toBe(10);
    });

    it('轮廓宽同时覆盖图片图案层与图标点层；图标点不传轮廓宽时保持缺省线宽 0', () => {
      const patternLayers = getFillOutlineLayers(
        { symbolId: 'line-override-pattern', style: { paint: { 'line-pattern': 'texture-id' } } },
        '#FF0000',
        6
      );
      expect(patternLayers[0]).toEqual({
        kind: 'image',
        imageId: 'texture-id',
        lineWidth: 6,
        offset: 0,
        opacity: 1,
        spacing: null
      });

      const iconLayers = getFillOutlineLayers(
        { symbolId: 'line-override-icon', style: { layout: { 'icon-image': 'icon-id' } } },
        '#FF0000',
        5
      );
      expect(iconLayers[0].lineWidth).toBe(5);

      const iconNoWidth = getFillOutlineLayers(
        { symbolId: 'line-override-icon-default', style: { layout: { 'icon-image': 'icon-id' } } },
        '#FF0000'
      );
      expect(iconNoWidth[0].lineWidth).toBe(0);
    });

    it('轮廓宽覆盖时，原本会被忽略的非线图层也归一化为矢量层', () => {
      const layers = getFillOutlineLayers(
        { symbolId: 'line-override-non-line', style: { paint: { 'fill-color': '#0000FF' } } },
        undefined,
        2
      );
      expect(layers.length).toBe(1);
      expect(layers[0].lineWidth).toBe(2);
      expect(layers[0].color).toBe('#FFFFFF');
    });

    it('非数字的 offset 和 opacity 使用默认值', () => {
      const layers = getFillOutlineLayers({
        symbolId: 'line-bad-offset',
        style: { paint: { 'line-width': 1, 'line-offset': '3', 'line-opacity': null } }
      });
      expect(layers[0].offset).toBe(0);
      expect(layers[0].opacity).toBe(1);
    });
  });

  describe('getPlainOutlineLayer', () => {
    it('构造纯色轮廓图层', () => {
      expect(getPlainOutlineLayer('#123456', 2)).toEqual({
        kind: 'vector',
        lineWidth: 2,
        color: '#123456',
        dasharray: [],
        offset: 0,
        opacity: 1,
        lineJoin: 'miter'
      });
    });
  });

  describe('createOutlineTileFromSprite', () => {
    it('按 sprite.json 元数据从同源雪碧图裁剪生成图块', () => {
      const { ctx, imageDraws } = createMockContext();
      const tileCanvas = document.createElement('canvas');
      tileCanvas.getContext = jest.fn(() => ctx);
      const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(tileCanvas);
      const spriteImage = { width: 100, height: 100 };
      const spriteMeta = {
        'texture-id': { x: 4, y: 6, width: 8, height: 4, pixelRatio: 1 }
      };
      const tile = createOutlineTileFromSprite(spriteImage, spriteMeta, 'texture-id', 4, 1);
      expect(tile.cssWidth).toBe(8);
      expect(tile.cssHeight).toBe(4);
      expect(tile.canvas).toBe(tileCanvas);
      expect(imageDraws[0]).toEqual([spriteImage, 4, 6, 8, 4, 0, 0, tileCanvas.width, tileCanvas.height]);
      createElementSpy.mockRestore();
    });

    it('图片 id 不在元数据中时返回 undefined', () => {
      const tile = createOutlineTileFromSprite({ width: 10, height: 10 }, {}, 'missing-id', 4, 1);
      expect(tile).toBeUndefined();
    });

    it('雪碧图缺失时返回 undefined', () => {
      const tile = createOutlineTileFromSprite(
        null,
        { 'texture-id': { x: 0, y: 0, width: 4, height: 4 } },
        'texture-id',
        4,
        1
      );
      expect(tile).toBeUndefined();
    });

    it('不传目标高度时按 pixelRatio 取元数据原始物理尺寸', () => {
      const { ctx, imageDraws } = createMockContext();
      const tileCanvas = document.createElement('canvas');
      tileCanvas.getContext = jest.fn(() => ctx);
      const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(tileCanvas);
      const spriteImage = { width: 200, height: 200 };
      const spriteMeta = {
        'texture-id': { x: 10, y: 20, width: 8, height: 6, pixelRatio: 2 }
      };
      const tile = createOutlineTileFromSprite(spriteImage, spriteMeta, 'texture-id');
      expect(tile.cssWidth).toBe(8);
      expect(tile.cssHeight).toBe(6);
      // 物理像素 = CSS 尺寸 * pixelRatio
      expect(tileCanvas.width).toBe(16);
      expect(tileCanvas.height).toBe(12);
      expect(imageDraws[0]).toEqual([spriteImage, 20, 40, 16, 12, 0, 0, 16, 12]);
      createElementSpy.mockRestore();
    });

    it('目标高度与 dpr 同时生效：等比缩放 CSS 宽，画布按 dpr 放大', () => {
      const { ctx, imageDraws } = createMockContext();
      const tileCanvas = document.createElement('canvas');
      tileCanvas.getContext = jest.fn(() => ctx);
      const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(tileCanvas);
      const spriteImage = { width: 100, height: 100 };
      // 图案 8x4，目标高度 4（ratio=1），dpr=2 → CSS 8x4，画布 16x8
      const spriteMeta = {
        'texture-id': { x: 0, y: 0, width: 8, height: 4, pixelRatio: 1 }
      };
      const tile = createOutlineTileFromSprite(spriteImage, spriteMeta, 'texture-id', 4, 2);
      expect(tile.cssWidth).toBe(8);
      expect(tile.cssHeight).toBe(4);
      expect(tileCanvas.width).toBe(16);
      expect(tileCanvas.height).toBe(8);
      expect(imageDraws[0]).toEqual([spriteImage, 0, 0, 8, 4, 0, 0, 16, 8]);
      createElementSpy.mockRestore();
    });

    it('目标高度非正数时使用元数据原始尺寸', () => {
      const { ctx } = createMockContext();
      const tileCanvas = document.createElement('canvas');
      tileCanvas.getContext = jest.fn(() => ctx);
      const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(tileCanvas);
      const spriteMeta = {
        'texture-id': { x: 0, y: 0, width: 8, height: 6, pixelRatio: 1 }
      };
      const tile = createOutlineTileFromSprite({ width: 50 }, spriteMeta, 'texture-id', 0, 1);
      expect(tile.cssWidth).toBe(8);
      expect(tile.cssHeight).toBe(6);
      expect(tileCanvas.width).toBe(8);
      createElementSpy.mockRestore();
    });

    it('canvas 2d 上下文不可用时返回 undefined', () => {
      const tileCanvas = document.createElement('canvas');
      tileCanvas.getContext = jest.fn(() => null);
      const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(tileCanvas);
      const tile = createOutlineTileFromSprite(
        { width: 50 },
        { 'texture-id': { x: 0, y: 0, width: 4, height: 4 } },
        'texture-id',
        4,
        1
      );
      expect(tile).toBeUndefined();
      createElementSpy.mockRestore();
    });
  });

  describe('drawFillOutline', () => {
    function createCanvas() {
      const { ctx, strokes, imageDraws } = createMockContext();
      return { canvas: { getContext: () => ctx }, ctx, strokes, imageDraws };
    }

    it('needClear 为 true 时先清空画布', () => {
      const { canvas, ctx } = createCanvas();
      drawFillOutline(canvas, 20, 0, [getPlainOutlineLayer('#000000', 2)], new Map(), 1, true);
      expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 20, 20);
    });

    it('needClear 为 false 时不清除（与填充共用画布）', () => {
      const { canvas, ctx } = createCanvas();
      drawFillOutline(canvas, 20, 0, [getPlainOutlineLayer('#000000', 2)], new Map(), 1, false);
      expect(ctx.clearRect).not.toHaveBeenCalled();
    });

    it('2d 上下文不可用时直接返回，不抛错', () => {
      const canvas = { getContext: () => null };
      expect(() =>
        drawFillOutline(canvas, 20, 0, [getPlainOutlineLayer('#000000', 2)], new Map(), 1)
      ).not.toThrow();
    });

    it('虚线含 0 长度段时归约为极小值，奇数长度补齐', () => {
      const { canvas, strokes } = createCanvas();
      const styleData = {
        outlineSymbolsContent: {
          symbolId: 'line-dash-zero',
          style: { paint: { 'line-width': 2, 'line-color': '#000000', 'line-dasharray': [2, 0, 1] } }
        }
      };
      const padding = getFillLegendPadding(styleData);
      drawFillLegendOutline(canvas, 20 + 2 * padding, padding, styleData, { dpr: 1 });
      expect(strokes[0].dash).toEqual([2, 0.01, 1, 0.01]);
    });

    it('正 offset 向内收缩矩形，小数 offset 向远离 0 方向取整', () => {
      const { canvas, ctx } = createCanvas();
      const styleData = {
        outlineSymbolsContent: {
          symbolId: 'line-offset-pos',
          style: { paint: { 'line-width': 2, 'line-color': '#000000', 'line-offset': 0.5 } }
        }
      };
      // offset 0.5 取整为 1，半幅笔刷 1 → padding 0
      const padding = getFillLegendPadding(styleData);
      drawFillLegendOutline(canvas, 20 + 2 * padding, padding, styleData, { dpr: 1 });
      // rect(1, 1, 18, 18)
      expect(ctx.rect.mock.calls[0]).toEqual([1, 1, 18, 18]);
    });

    it('负 offset 时画布外扩出血位，整体内移保证轮廓完整落在画布内', () => {
      const { canvas, ctx } = createCanvas();
      const styleData = {
        outlineSymbolsContent: {
          symbolId: 'line-offset-neg',
          style: { paint: { 'line-width': 4, 'line-color': '#000000', 'line-offset': -2 } }
        }
      };
      // 半幅笔刷 2 - offset(-2) = 4 → padding 4，总边长 28
      const padding = getFillLegendPadding(styleData);
      expect(padding).toBe(4);
      drawFillLegendOutline(canvas, 20 + 2 * padding, padding, styleData, { dpr: 1 });
      // inset = 4 - 2 = 2：rect(2, 2, 24, 24)
      expect(ctx.rect.mock.calls[0]).toEqual([2, 2, 24, 24]);
    });

    it('inset 空间不足或边长非正时跳过该图层', () => {
      const { canvas, strokes } = createCanvas();
      const styleData = {
        outlineSymbolsContent: {
          symbolId: 'line-inset-full',
          // offset=10、带宽 2：padding=0、inset=10，size-2*inset=0 → 跳过
          style: { paint: { 'line-width': 2, 'line-color': '#000000', 'line-offset': 10 } }
        }
      };
      const padding = getFillLegendPadding(styleData);
      drawFillLegendOutline(canvas, 20 + 2 * padding, padding, styleData, { dpr: 1 });
      expect(strokes).toEqual([]);
    });

    it('图片层图块缺失时矢量层仍正常绘制', () => {
      const { canvas, strokes } = createCanvas();
      const styleData = {
        outlineSymbolsContent: {
          symbolId: 'line-mixed',
          style: [
            { paint: { 'line-width': 4, 'line-pattern': 'missing-texture' } },
            { paint: { 'line-width': 2, 'line-color': '#00FF00' } }
          ]
        }
      };
      const padding = getFillLegendPadding(styleData);
      drawFillLegendOutline(canvas, 20 + 2 * padding, padding, styleData, { dpr: 1 });
      expect(strokes.length).toBe(1);
      expect(strokes[0].strokeStyle).toBe('#00FF00');
    });
  });

  describe('drawFillLegendOutline', () => {
    function createCanvas() {
      const { ctx, strokes, imageDraws } = createMockContext();
      return { canvas: { getContext: () => ctx }, ctx, strokes, imageDraws };
    }

    it('纯色轮廓按轮廓不透明度描边', () => {
      const { canvas, strokes } = createCanvas();
      const styleData = {
        outlineStyle: 'solid',
        outlineColor: '#FF0000',
        outlineWidth: '2px',
        outlineOpacity: 0.5
      };
      // 半幅笔刷 1 → padding 1，总边长 22
      const padding = getFillLegendPadding(styleData);
      const missing = drawFillLegendOutline(canvas, 20 + 2 * padding, padding, styleData, { dpr: 1 });
      expect(missing).toEqual([]);
      expect(strokes.length).toBe(1);
      expect(strokes[0].strokeStyle).toBe('#FF0000');
      expect(strokes[0].lineWidth).toBe(2);
      // 纯色层自身不透明度 1 * 轮廓整体不透明度 0.5
      expect(strokes[0].globalAlpha).toBe(0.5);
    });

    it('outlineStyle 为 none 且无轮廓线符号时不绘制', () => {
      const { canvas, strokes, ctx } = createCanvas();
      const styleData = { outlineStyle: 'none', outlineColor: '#FF0000' };
      drawFillLegendOutline(canvas, 20, 0, styleData, { dpr: 1 });
      expect(strokes.length).toBe(0);
      expect(ctx.beginPath).not.toHaveBeenCalled();
    });

    it('轮廓线符号矢量图层依次描边，不透明度叠加', () => {
      const { canvas, strokes } = createCanvas();
      const styleData = {
        outlineOpacity: 0.5,
        outlineSymbolsContent: {
          symbolId: 'line-6',
          style: [
            { paint: { 'line-width': 2, 'line-color': '#FF0000', 'line-opacity': 0.8 } },
            { paint: { 'line-width': 2, 'line-color': '#00FF00' } }
          ]
        }
      };
      const padding = getFillLegendPadding(styleData);
      drawFillLegendOutline(canvas, 20 + 2 * padding, padding, styleData, { dpr: 1 });
      expect(strokes.length).toBe(2);
      expect(strokes[0].strokeStyle).toBe('#FF0000');
      expect(strokes[0].globalAlpha).toBeCloseTo(0.4);
      expect(strokes[1].strokeStyle).toBe('#00FF00');
      expect(strokes[1].globalAlpha).toBe(0.5);
    });

    it('图片符号通过 createTile 取图块，沿矩形各边旋转铺设', () => {
      const { canvas, ctx, strokes, imageDraws } = createCanvas();
      const tileCanvas = { width: 4, height: 4 };
      const createTile = jest.fn(() => ({ canvas: tileCanvas, cssWidth: 4, cssHeight: 4 }));
      const styleData = {
        outlineSymbolsContent: {
          symbolId: 'line-7',
          style: { paint: { 'line-width': 4, 'line-pattern': 'texture-id' } }
        }
      };
      // padding 2、总边长 24、描边边长 20
      const padding = getFillLegendPadding(styleData);
      expect(padding).toBe(2);
      const missing = drawFillLegendOutline(canvas, 20 + 2 * padding, padding, styleData, {
        dpr: 1,
        createTile
      });
      expect(createTile).toHaveBeenCalledWith('texture-id', 4, 1);
      expect(missing).toEqual([]);
      // 图片符号不走矢量描边
      expect(strokes.length).toBe(0);
      // 边长 20、图块 4px：每边 5 个，四边共 20 次 drawImage
      expect(ctx.save).toHaveBeenCalledTimes(20);
      expect(ctx.rotate).toHaveBeenCalledTimes(20);
      expect(imageDraws.length).toBe(20);
    });

    it('图标点图块原始尺寸过大时按填充区比例钳制，不跳过该层', () => {
      const { canvas, ctx, imageDraws } = createCanvas();
      // 原始图块 12x24（宽x高），填充区 20、比例上限 0.2 → 带宽钳为 4，绘制宽 2
      const createTile = jest.fn(() => ({ canvas: { width: 4, height: 4 }, cssWidth: 12, cssHeight: 24 }));
      const styleData = {
        outlineSymbolsContent: {
          symbolId: 'line-icon',
          style: { layout: { 'icon-image': 'big-icon' } }
        }
      };
      // 图标点绘制宽 1 → padding 1、总边长 22；钳制后 inset=2、边长 18
      const padding = getFillLegendPadding(styleData);
      expect(padding).toBe(1);
      const missing = drawFillLegendOutline(canvas, 20 + 2 * padding, padding, styleData, {
        dpr: 1,
        createTile
      });
      expect(missing).toEqual([]);
      // 边长 18、绘制宽 2：每边 9 个、四边共 36 次 drawImage；目标宽高为 2x4
      expect(imageDraws.length).toBe(36);
      expect(imageDraws[0].slice(-4)).toEqual([-1, -2, 2, 4]);
      expect(ctx.rotate).toHaveBeenCalledTimes(36);
    });

    it('未传 createTile 或图块未就绪时返回缺失 id，跳过图片符号层', () => {
      const styleData = {
        outlineSymbolsContent: {
          symbolId: 'line-8',
          style: { paint: { 'line-width': 4, 'line-pattern': 'missing-id' } }
        }
      };
      const padding = getFillLegendPadding(styleData);

      const { canvas: canvas1, strokes, imageDraws } = createCanvas();
      const missing1 = drawFillLegendOutline(canvas1, 20 + 2 * padding, padding, styleData, { dpr: 1 });
      expect(missing1).toEqual(['missing-id']);

      const { canvas: canvas2 } = createCanvas();
      const missing2 = drawFillLegendOutline(canvas2, 20 + 2 * padding, padding, styleData, {
        dpr: 1,
        createTile: () => undefined
      });
      expect(missing2).toEqual(['missing-id']);
      expect(strokes.length).toBe(0);
      expect(imageDraws.length).toBe(0);
    });

    it('styleData 为空时返回空数组且不绘制', () => {
      const { canvas, strokes } = createCanvas();
      expect(drawFillLegendOutline(canvas, 20, 0, null, { dpr: 1 })).toEqual([]);
      expect(drawFillLegendOutline(canvas, 20, 0, {}, { dpr: 1 })).toEqual([]);
      expect(strokes.length).toBe(0);
    });

    it('轮廓线符号缺少 style 时返回空数组', () => {
      const { canvas } = createCanvas();
      const styleData = { outlineSymbolsContent: { symbolId: 'line-no-style' } };
      const missing = drawFillLegendOutline(canvas, 20, 0, styleData, { dpr: 1 });
      expect(missing).toEqual([]);
    });

    it('纯色轮廓缺省或非法宽度时使用默认宽度 0.5（绘制宽 1px）', () => {
      const styleData1 = { outlineStyle: 'solid', outlineColor: '#FF0000' };
      const padding1 = getFillLegendPadding(styleData1);
      const { canvas: canvas1, strokes: strokes1 } = createCanvas();
      drawFillLegendOutline(canvas1, 20 + 2 * padding1, padding1, styleData1, { dpr: 1 });
      expect(strokes1[0].lineWidth).toBe(1);

      const styleData2 = { outlineStyle: 'solid', outlineColor: '#FF0000', outlineWidth: 'abc' };
      const padding2 = getFillLegendPadding(styleData2);
      const { canvas: canvas2, strokes: strokes2 } = createCanvas();
      drawFillLegendOutline(canvas2, 20 + 2 * padding2, padding2, styleData2, { dpr: 1 });
      expect(strokes2[0].lineWidth).toBe(1);
    });

    it('轮廓不透明度非数字时按 1 处理，超出范围时钳制', () => {
      const styleData1 = {
        outlineStyle: 'solid',
        outlineColor: '#FF0000',
        outlineWidth: 2,
        outlineOpacity: '0.5'
      };
      const padding1 = getFillLegendPadding(styleData1);
      const { canvas: canvas1, strokes: strokes1 } = createCanvas();
      drawFillLegendOutline(canvas1, 20 + 2 * padding1, padding1, styleData1, { dpr: 1 });
      expect(strokes1[0].globalAlpha).toBe(1);

      const styleData2 = {
        outlineStyle: 'solid',
        outlineColor: '#FF0000',
        outlineWidth: 2,
        outlineOpacity: 2
      };
      const padding2 = getFillLegendPadding(styleData2);
      const { canvas: canvas2, strokes: strokes2 } = createCanvas();
      drawFillLegendOutline(canvas2, 20 + 2 * padding2, padding2, styleData2, { dpr: 1 });
      expect(strokes2[0].globalAlpha).toBe(1);
    });

    it('轮廓线符号存在时，面板轮廓色与轮廓宽覆盖符号内部颜色（真实线宽绘制）', () => {
      const { canvas, strokes } = createCanvas();
      const styleData = {
        outlineStyle: 'solid',
        outlineColor: 'rgba(195,16,16,1)',
        outlineWidth: 10,
        outlineOpacity: 1,
        outlineSymbolsContent: {
          symbolId: 'line-0',
          style: {
            paint: {
              'line-width': 10,
              'line-offset': 0,
              'line-opacity': 1,
              'line-color': '#FFFFFF'
            }
          }
        }
      };
      // 半幅笔刷 5 → padding 5、总边长 30
      const padding = getFillLegendPadding(styleData);
      expect(padding).toBe(5);
      drawFillLegendOutline(canvas, 20 + 2 * padding, padding, styleData, { dpr: 1 });
      expect(strokes.length).toBe(1);
      expect(strokes[0].strokeStyle).toBe('rgba(195,16,16,1)');
      // 10px 按真实线宽绘制，画布外扩容纳
      expect(strokes[0].lineWidth).toBe(10);
    });

    it('面板轮廓宽为像素字符串时解析为数字后覆盖', () => {
      const { canvas, strokes } = createCanvas();
      const styleData = {
        outlineColor: '#FF0000',
        outlineWidth: '2px',
        outlineSymbolsContent: {
          symbolId: 'line-px-width',
          style: { paint: { 'line-width': 8, 'line-color': '#00FF00' } }
        }
      };
      const padding = getFillLegendPadding(styleData);
      drawFillLegendOutline(canvas, 20 + 2 * padding, padding, styleData, { dpr: 1 });
      expect(strokes[0].strokeStyle).toBe('#FF0000');
      expect(strokes[0].lineWidth).toBe(2);
    });

    it('面板轮廓色、宽度缺省时仍使用符号自身的颜色与宽度', () => {
      const { canvas, strokes } = createCanvas();
      const styleData = {
        outlineSymbolsContent: {
          symbolId: 'line-keep-symbol',
          style: { paint: { 'line-width': 2, 'line-color': '#00FF00' } }
        }
      };
      const padding = getFillLegendPadding(styleData);
      drawFillLegendOutline(canvas, 20 + 2 * padding, padding, styleData, { dpr: 1 });
      expect(strokes[0].strokeStyle).toBe('#00FF00');
      expect(strokes[0].lineWidth).toBe(2);
    });

    it('轮廓线符号无 symbolId 时回退为纯色轮廓', () => {
      const { canvas, strokes } = createCanvas();
      const styleData = {
        outlineStyle: 'solid',
        outlineColor: '#0000FF',
        outlineWidth: 2,
        outlineSymbolsContent: { style: { paint: { 'line-color': '#FF0000' } } }
      };
      const padding = getFillLegendPadding(styleData);
      drawFillLegendOutline(canvas, 20 + 2 * padding, padding, styleData, { dpr: 1 });
      expect(strokes.length).toBe(1);
      expect(strokes[0].strokeStyle).toBe('#0000FF');
    });

    it('宽度被单独提取时，其它分组符号按默认宽度 0.5（绘制 1px）描边', () => {
      const { canvas, strokes } = createCanvas();
      const styleData = {
        outlineSymbolsContent: {
          symbolId: 'line-driven-other-draw',
          style: [
            { paint: { 'line-width': 8, 'line-color': '#000000' } },
            { paint: { 'line-width': 2, 'line-color': '#FFFFFF' } }
          ]
        }
      };
      // driven 且本项未挂宽度：padding 1、总边长 22
      const padding = getFillLegendPadding(styleData, true);
      expect(padding).toBe(1);
      drawFillLegendOutline(canvas, 20 + 2 * padding, padding, styleData, {
        dpr: 1,
        outlineWidthDriven: true
      });
      expect(strokes.length).toBe(2);
      strokes.forEach(stroke => expect(stroke.lineWidth).toBe(1));
    });

    it('宽度被单独提取时，宽度分组分段项仍按真实分段宽度描边', () => {
      const { canvas, strokes } = createCanvas();
      const styleData = {
        outlineWidth: 12,
        outlineColor: '#000000',
        outlineSymbolsContent: {
          symbolId: 'line-driven-width-draw',
          style: { paint: { 'line-width': 2, 'line-color': '#FF0000' } }
        }
      };
      // padding 6、总边长 32
      const padding = getFillLegendPadding(styleData, true);
      expect(padding).toBe(6);
      drawFillLegendOutline(canvas, 20 + 2 * padding, padding, styleData, {
        dpr: 1,
        outlineWidthDriven: true
      });
      expect(strokes[0].lineWidth).toBe(12);
    });
  });
});
