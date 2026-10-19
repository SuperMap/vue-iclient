import {
  clampOpacity,
  getFillOutlineLayers,
  getPlainOutlineLayer,
  getOutlineDrawWidth,
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
    it('最小为 1px，最大不超过图标边长的固定比例', () => {
      expect(getOutlineDrawWidth(0.2, 20)).toBe(1);
      expect(getOutlineDrawWidth(3, 20)).toBe(3);
      // 20 * 0.2 = 4，过大的线宽被钳制为 4
      expect(getOutlineDrawWidth(16, 20)).toBe(4);
    });

    it('非正数宽度取 1，常规宽度四舍五入，恰好等于上限时不钳制', () => {
      expect(getOutlineDrawWidth(0, 20)).toBe(1);
      expect(getOutlineDrawWidth(-5, 20)).toBe(1);
      expect(getOutlineDrawWidth(3.4, 20)).toBe(3);
      expect(getOutlineDrawWidth(4, 20)).toBe(4);
    });

    it('图标边长很小时绘制上限至少为 1px', () => {
      expect(getOutlineDrawWidth(10, 2)).toBe(1);
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
      drawFillOutline(canvas, 20, [getPlainOutlineLayer('#000000', 2)], new Map(), 1, true);
      expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 20, 20);
    });

    it('needClear 为 false 时不清除（与填充共用画布）', () => {
      const { canvas, ctx } = createCanvas();
      drawFillOutline(canvas, 20, [getPlainOutlineLayer('#000000', 2)], new Map(), 1, false);
      expect(ctx.clearRect).not.toHaveBeenCalled();
    });

    it('2d 上下文不可用时直接返回，不抛错', () => {
      const canvas = { getContext: () => null };
      expect(() => drawFillOutline(canvas, 20, [getPlainOutlineLayer('#000000', 2)], new Map(), 1)).not.toThrow();
    });

    it('虚线含 0 长度段时归约为极小值，奇数长度补齐', () => {
      const { canvas, strokes } = createCanvas();
      drawFillLegendOutline(
        canvas,
        20,
        {
          outlineSymbolsContent: {
            symbolId: 'line-dash-zero',
            style: { paint: { 'line-width': 2, 'line-color': '#000000', 'line-dasharray': [2, 0, 1] } }
          }
        },
        { dpr: 1 }
      );
      expect(strokes[0].dash).toEqual([2, 0.01, 1, 0.01]);
    });

    it('正 offset 向内收缩矩形，小数 offset 向远离 0 方向取整', () => {
      const { canvas, ctx } = createCanvas();
      drawFillLegendOutline(
        canvas,
        20,
        {
          outlineSymbolsContent: {
            symbolId: 'line-offset-pos',
            style: { paint: { 'line-width': 2, 'line-color': '#000000', 'line-offset': 0.5 } }
          }
        },
        { dpr: 1 }
      );
      // 0.5 取整为 1：rect(1, 1, 18, 18)
      expect(ctx.rect.mock.calls[0]).toEqual([1, 1, 18, 18]);
    });

    it('负 offset 时整体内移，保证轮廓完整落在画布内', () => {
      const { canvas, ctx } = createCanvas();
      drawFillLegendOutline(
        canvas,
        20,
        {
          outlineSymbolsContent: {
            symbolId: 'line-offset-neg',
            style: { paint: { 'line-width': 4, 'line-color': '#000000', 'line-offset': -2 } }
          }
        },
        { dpr: 1 }
      );
      // minBound = -2 - 2 = -4 → shift=4 → inset=2：rect(2, 2, 16, 16)
      expect(ctx.rect.mock.calls[0]).toEqual([2, 2, 16, 16]);
    });

    it('inset 空间不足或边长非正时跳过该图层', () => {
      const { canvas, strokes } = createCanvas();
      drawFillLegendOutline(
        canvas,
        20,
        {
          outlineSymbolsContent: {
            symbolId: 'line-inset-full',
            // offset=10、带宽 2：inset=10，size-2*inset=0 → 跳过
            style: { paint: { 'line-width': 2, 'line-color': '#000000', 'line-offset': 10 } }
          }
        },
        { dpr: 1 }
      );
      expect(strokes).toEqual([]);
    });

    it('图片层图块缺失时矢量层仍正常绘制', () => {
      const { canvas, strokes } = createCanvas();
      drawFillLegendOutline(
        canvas,
        20,
        {
          outlineSymbolsContent: {
            symbolId: 'line-mixed',
            style: [
              { paint: { 'line-width': 4, 'line-pattern': 'missing-texture' } },
              { paint: { 'line-width': 2, 'line-color': '#00FF00' } }
            ]
          }
        },
        { dpr: 1 }
      );
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
      const missing = drawFillLegendOutline(
        canvas,
        20,
        { outlineStyle: 'solid', outlineColor: '#FF0000', outlineWidth: '2px', outlineOpacity: 0.5 },
        { dpr: 1 }
      );
      expect(missing).toEqual([]);
      expect(strokes.length).toBe(1);
      expect(strokes[0].strokeStyle).toBe('#FF0000');
      expect(strokes[0].lineWidth).toBe(2);
      // 纯色层自身不透明度 1 * 轮廓整体不透明度 0.5
      expect(strokes[0].globalAlpha).toBe(0.5);
    });

    it('outlineStyle 为 none 且无轮廓线符号时不绘制', () => {
      const { canvas, strokes, ctx } = createCanvas();
      drawFillLegendOutline(canvas, 20, { outlineStyle: 'none', outlineColor: '#FF0000' }, { dpr: 1 });
      expect(strokes.length).toBe(0);
      expect(ctx.beginPath).not.toHaveBeenCalled();
    });

    it('轮廓线符号矢量图层依次描边，不透明度叠加', () => {
      const { canvas, strokes } = createCanvas();
      drawFillLegendOutline(
        canvas,
        20,
        {
          outlineOpacity: 0.5,
          outlineSymbolsContent: {
            symbolId: 'line-6',
            style: [
              { paint: { 'line-width': 2, 'line-color': '#FF0000', 'line-opacity': 0.8 } },
              { paint: { 'line-width': 2, 'line-color': '#00FF00' } }
            ]
          }
        },
        { dpr: 1 }
      );
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
      const missing = drawFillLegendOutline(
        canvas,
        20,
        {
          outlineSymbolsContent: {
            symbolId: 'line-7',
            style: { paint: { 'line-width': 4, 'line-pattern': 'texture-id' } }
          }
        },
        { dpr: 1, createTile }
      );
      expect(createTile).toHaveBeenCalledWith('texture-id', 4, 1);
      expect(missing).toEqual([]);
      // 图片符号不走矢量描边
      expect(strokes.length).toBe(0);
      // 边长 16、图块 4px：每边 4 个，四边共 16 次 drawImage
      expect(ctx.save).toHaveBeenCalledTimes(16);
      expect(ctx.rotate).toHaveBeenCalledTimes(16);
      expect(imageDraws.length).toBe(16);
    });

    it('图标点图块原始尺寸大于图例时等比钳制，不跳过该层', () => {
      const { canvas, ctx, imageDraws } = createCanvas();
      // 原始图块 12x24（宽x高），图例边长 20、比例上限 0.2 → 带宽钳为 4，绘制宽 2
      const createTile = jest.fn(() => ({ canvas: { width: 4, height: 4 }, cssWidth: 12, cssHeight: 24 }));
      const missing = drawFillLegendOutline(
        canvas,
        20,
        {
          outlineSymbolsContent: {
            symbolId: 'line-icon',
            style: { layout: { 'icon-image': 'big-icon' } }
          }
        },
        { dpr: 1, createTile }
      );
      expect(missing).toEqual([]);
      // 钳制后 inset=2、边长 16，绘制宽 2，每边 8 个、四边共 32 次 drawImage；目标宽高为 2x4
      expect(imageDraws.length).toBe(32);
      expect(imageDraws[0].slice(-4)).toEqual([-1, -2, 2, 4]);
      expect(ctx.rotate).toHaveBeenCalledTimes(32);
    });

    it('未传 createTile 或图块未就绪时返回缺失 id，跳过图片符号层', () => {
      const { canvas: canvas1, strokes, imageDraws } = createCanvas();
      const missing1 = drawFillLegendOutline(
        canvas1,
        20,
        {
          outlineSymbolsContent: {
            symbolId: 'line-8',
            style: { paint: { 'line-width': 4, 'line-pattern': 'missing-id' } }
          }
        },
        { dpr: 1 }
      );
      expect(missing1).toEqual(['missing-id']);

      const { canvas: canvas2 } = createCanvas();
      const missing2 = drawFillLegendOutline(
        canvas2,
        20,
        {
          outlineSymbolsContent: {
            symbolId: 'line-9',
            style: { paint: { 'line-width': 4, 'line-pattern': 'missing-id' } }
          }
        },
        { dpr: 1, createTile: () => undefined }
      );
      expect(missing2).toEqual(['missing-id']);
      expect(strokes.length).toBe(0);
      expect(imageDraws.length).toBe(0);
    });

    it('styleData 为空时返回空数组且不绘制', () => {
      const { canvas, strokes } = createCanvas();
      expect(drawFillLegendOutline(canvas, 20, null, { dpr: 1 })).toEqual([]);
      expect(drawFillLegendOutline(canvas, 20, {}, { dpr: 1 })).toEqual([]);
      expect(strokes.length).toBe(0);
    });

    it('轮廓线符号缺少 style 时返回空数组', () => {
      const { canvas } = createCanvas();
      const missing = drawFillLegendOutline(
        canvas,
        20,
        { outlineSymbolsContent: { symbolId: 'line-no-style' } },
        { dpr: 1 }
      );
      expect(missing).toEqual([]);
    });

    it('纯色轮廓缺省或非法宽度时使用默认宽度 0.5（绘制宽 1px）', () => {
      const { canvas: canvas1, strokes: strokes1 } = createCanvas();
      drawFillLegendOutline(
        canvas1,
        20,
        { outlineStyle: 'solid', outlineColor: '#FF0000' },
        { dpr: 1 }
      );
      expect(strokes1[0].lineWidth).toBe(1);

      const { canvas: canvas2, strokes: strokes2 } = createCanvas();
      drawFillLegendOutline(
        canvas2,
        20,
        { outlineStyle: 'solid', outlineColor: '#FF0000', outlineWidth: 'abc' },
        { dpr: 1 }
      );
      expect(strokes2[0].lineWidth).toBe(1);
    });

    it('轮廓不透明度非数字时按 1 处理，超出范围时钳制', () => {
      const { canvas: canvas1, strokes: strokes1 } = createCanvas();
      drawFillLegendOutline(
        canvas1,
        20,
        { outlineStyle: 'solid', outlineColor: '#FF0000', outlineWidth: 2, outlineOpacity: '0.5' },
        { dpr: 1 }
      );
      expect(strokes1[0].globalAlpha).toBe(1);

      const { canvas: canvas2, strokes: strokes2 } = createCanvas();
      drawFillLegendOutline(
        canvas2,
        20,
        { outlineStyle: 'solid', outlineColor: '#FF0000', outlineWidth: 2, outlineOpacity: 2 },
        { dpr: 1 }
      );
      expect(strokes2[0].globalAlpha).toBe(1);
    });

    it('轮廓线符号存在时，面板轮廓色与轮廓宽覆盖符号内部颜色（数字宽度）', () => {
      const { canvas, strokes } = createCanvas();
      drawFillLegendOutline(
        canvas,
        20,
        {
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
        },
        { dpr: 1 }
      );
      expect(strokes.length).toBe(1);
      expect(strokes[0].strokeStyle).toBe('rgba(195,16,16,1)');
      // 10px 在 20px 图例上按比例钳制为 4px
      expect(strokes[0].lineWidth).toBe(4);
    });

    it('面板轮廓宽为像素字符串时解析为数字后覆盖', () => {
      const { canvas, strokes } = createCanvas();
      drawFillLegendOutline(
        canvas,
        20,
        {
          outlineColor: '#FF0000',
          outlineWidth: '2px',
          outlineSymbolsContent: {
            symbolId: 'line-px-width',
            style: { paint: { 'line-width': 8, 'line-color': '#00FF00' } }
          }
        },
        { dpr: 1 }
      );
      expect(strokes[0].strokeStyle).toBe('#FF0000');
      expect(strokes[0].lineWidth).toBe(2);
    });

    it('面板轮廓色、宽度缺省时仍使用符号自身的颜色与宽度', () => {
      const { canvas, strokes } = createCanvas();
      drawFillLegendOutline(
        canvas,
        20,
        {
          outlineSymbolsContent: {
            symbolId: 'line-keep-symbol',
            style: { paint: { 'line-width': 2, 'line-color': '#00FF00' } }
          }
        },
        { dpr: 1 }
      );
      expect(strokes[0].strokeStyle).toBe('#00FF00');
      expect(strokes[0].lineWidth).toBe(2);
    });

    it('轮廓线符号无 symbolId 时回退为纯色轮廓', () => {
      const { canvas, strokes } = createCanvas();
      drawFillLegendOutline(
        canvas,
        20,
        {
          outlineStyle: 'solid',
          outlineColor: '#0000FF',
          outlineWidth: 2,
          outlineSymbolsContent: { style: { paint: { 'line-color': '#FF0000' } } }
        },
        { dpr: 1 }
      );
      expect(strokes.length).toBe(1);
      expect(strokes[0].strokeStyle).toBe('#0000FF');
    });
  });
});
