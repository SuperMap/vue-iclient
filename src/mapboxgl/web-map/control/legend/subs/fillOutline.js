/**
 * 面图层图例轮廓绘制工具。
 * 轮廓有两种来源，且与线图层符号绘制一致，区分图片符号与矢量符号：
 * 1) 轮廓线符号 outlineSymbolsContent：符号可能含多个线图层，每个图层可能是
 *    - 图片符号：line-pattern（连续纹理）/ icon-image（图标点），图标沿矩形各边方向旋转、重复铺设；
 *    - 矢量符号：line-width/line-color/line-dasharray，沿矩形描边；
 * 2) 纯色轮廓：outlineColor + outlineWidth，需要表达轮廓不透明度 outlineOpacity 时走 canvas 绘制。
 * 实现参考 MapStudio src/util/LegendUtil.ts 的 getFillOutlineLayers / drawFillOutline。
 */

const OUTLINE_WIDTH_KEY = 'line-width';
const OUTLINE_COLOR_KEY = 'line-color';
const OUTLINE_DASH_KEY = 'line-dasharray';
const OUTLINE_OPACITY_KEY = 'line-opacity';
const OUTLINE_OFFSET_KEY = 'line-offset';
const OUTLINE_PATTERN_KEY = 'line-pattern';
const ICON_IMAGE_KEY = 'icon-image';
const ICON_SPACING_KEY = 'symbol-spacing';
const LINE_JOIN_KEY = 'line-join';

// 图例轮廓几何宽度上限占图标边长的比例：线宽过大的符号会吞没整个填充区，
// 按比例钳制成示意宽度，保证轮廓始终是“外围一圈”。
const MAX_OUTLINE_WIDTH_RATIO = 0.2;

export function clampOpacity(opacity) {
  if (opacity < 0) return 0;
  if (opacity > 1) return 1;
  return opacity;
}

function isNumberArray(value) {
  return Array.isArray(value) && value.every(item => typeof item === 'number');
}

/**
 * 将轮廓线符号归一化为可绘制图层（图片符号层 / 矢量符号层）
 * @param {Object} symbolState 轮廓线符号 { symbolId, style }
 * @param {string} [overrideColor] 面板轮廓色，存在时覆盖各矢量子层的 line-color
 * @param {number} [overrideWidth] 面板轮廓宽度，存在时覆盖各子层（含图片符号层）的 line-width
 * @returns {Array} 归一化后的轮廓图层
 */
export function getFillOutlineLayers(symbolState, overrideColor, overrideWidth) {
  const { style } = symbolState || {};
  if (!style) return [];
  const symbolStyles = Array.isArray(style) ? style : [style];
  const layers = [];
  symbolStyles.forEach(symbol => {
    const paint = symbol.paint || {};
    const layout = symbol.layout || {};
    const lineWidth = paint[OUTLINE_WIDTH_KEY];
    const offsetValue = paint[OUTLINE_OFFSET_KEY];
    const opacityValue = paint[OUTLINE_OPACITY_KEY];
    const offset = typeof offsetValue === 'number' ? offsetValue : 0;
    const opacity = typeof opacityValue === 'number' ? opacityValue : 1;
    // 面板轮廓宽度优先于符号自身残留的 line-width
    const resolvedWidth = overrideWidth ?? (typeof lineWidth === 'number' ? lineWidth : 1);
    const iconImage = layout[ICON_IMAGE_KEY];
    const linePattern = paint[OUTLINE_PATTERN_KEY];
    if (typeof iconImage === 'string') {
      layers.push({
        kind: 'image',
        imageId: iconImage,
        lineWidth: overrideWidth ?? (typeof lineWidth === 'number' ? lineWidth : 0),
        offset,
        opacity,
        // 图标点按间距铺设；未配置 symbol-spacing 时取图标自身宽度（连续）
        spacing: typeof layout[ICON_SPACING_KEY] === 'number' ? layout[ICON_SPACING_KEY] : null
      });
      return;
    }
    if (typeof linePattern === 'string') {
      layers.push({
        kind: 'image',
        imageId: linePattern,
        lineWidth: resolvedWidth,
        offset,
        opacity,
        // 纹理连续铺设，不留间距
        spacing: null
      });
      return;
    }
    const lineColor = paint[OUTLINE_COLOR_KEY];
    const lineDash = paint[OUTLINE_DASH_KEY];
    // 非线图层（仅含 fill-* 等其他 paint）忽略
    if (lineWidth === undefined && lineColor === undefined && overrideWidth === undefined) {
      return;
    }
    const lineJoin = layout[LINE_JOIN_KEY];
    layers.push({
      kind: 'vector',
      lineWidth: resolvedWidth,
      // 与线图层图例一致：面板轮廓色优先于符号自身的 line-color
      color: overrideColor ?? (typeof lineColor === 'string' ? lineColor : '#FFFFFF'),
      dasharray: lineDash !== undefined && isNumberArray(lineDash) ? lineDash : [],
      offset,
      opacity,
      lineJoin: lineJoin === 'round' || lineJoin === 'bevel' ? lineJoin : 'miter'
    });
  });
  return layers;
}

/**
 * 构造纯色轮廓的单矢量图层
 */
export function getPlainOutlineLayer(color, width) {
  return {
    kind: 'vector',
    lineWidth: width,
    color,
    dasharray: [],
    offset: 0,
    opacity: 1,
    lineJoin: 'miter'
  };
}

/**
 * 图例中轮廓层的实际绘制宽度（CSS px）：最小 1px，最大不超过图标边长的固定比例
 */
export function getOutlineDrawWidth(rawWidth, size) {
  const rounded = rawWidth < 1 ? 1 : Math.round(rawWidth);
  return Math.min(rounded, Math.max(1, Math.round(size * MAX_OUTLINE_WIDTH_RATIO)));
}

// line-offset 几何取整（与线图层 drawMultiLine 的 roundNumber 语义一致）
function roundOutlineOffset(offset) {
  if (offset > 0 && offset < 1) {
    return 1;
  }
  if (offset > -1 && offset < 0) {
    return -1;
  }
  return Math.round(offset);
}

// canvas 对 0 长度虚线段跨浏览器行为不一致，归约为极小值；奇数长度补齐
function normalizeDash(pattern) {
  if (!pattern.length) return [];
  const dash = pattern.map(d => (d === 0 ? 0.01 : d));
  if (dash.length % 2 !== 0) {
    dash.push(0.01);
  }
  return dash;
}

/**
 * 图片符号图块：物理像素 canvas + 元信息
 * @typedef {Object} OutlineTile
 * @property {Object} canvas 物理像素 canvas（drawImage 源）
 * @property {number} cssWidth 图块 CSS 宽（沿线方向）
 * @property {number} cssHeight 图块 CSS 高（垂直线方向，即轮廓带宽度）
 */

/**
 * 由雪碧图（与填充符号同源的 sprite.png）及 sprite.json 元数据生成轮廓图块
 * @param {Object} spriteImage 已加载的雪碧图
 * @param {Object} spriteMeta sprite.json 元数据（按图片 id 索引坐标）
 * @param {string} imageId 图片 id（line-pattern / icon-image）
 * @param {number} targetHeight 期望的几何高度（CSS px）；不传时用元数据中图片的实际尺寸
 * @param {number} dpr 设备像素比
 * @returns {OutlineTile|undefined}
 */
export function createOutlineTileFromSprite(spriteImage, spriteMeta, imageId, targetHeight, dpr = 1) {
  const entry = spriteMeta && spriteMeta[imageId];
  if (!spriteImage || !entry) return undefined;
  const pixelRatio = entry.pixelRatio || 1;
  // 元数据坐标为 CSS 尺寸，索引雪碧图物理像素时乘 pixelRatio（与 ImageRenderer 取填充区域一致）
  const sx = entry.x * pixelRatio;
  const sy = entry.y * pixelRatio;
  const sWidth = entry.width * pixelRatio;
  const sHeight = entry.height * pixelRatio;
  const tile = document.createElement('canvas');
  const ctx = tile.getContext('2d');
  if (!ctx) return undefined;
  let cssHeight;
  let cssWidth;
  if (targetHeight && targetHeight > 0) {
    const ratio = targetHeight / entry.height;
    cssHeight = targetHeight;
    cssWidth = entry.width * ratio;
    tile.width = Math.max(1, Math.round(cssWidth * dpr));
    tile.height = Math.max(1, Math.round(cssHeight * dpr));
  } else {
    cssWidth = entry.width;
    cssHeight = entry.height;
    tile.width = sWidth;
    tile.height = sHeight;
  }
  ctx.drawImage(spriteImage, sx, sy, sWidth, sHeight, 0, 0, tile.width, tile.height);
  return { canvas: tile, cssWidth, cssHeight };
}

// 矩形各边：起点（中心线角点）与沿线方向角（弧度，顺时针铺设，和地图线纹理沿线方向一致）
function getOutlineSides(size, inset) {
  const end = size - inset;
  return [
    { x: inset, y: inset, angle: 0 }, // 上边：自左向右
    { x: end, y: inset, angle: Math.PI / 2 }, // 右边：自上向下
    { x: end, y: end, angle: Math.PI }, // 下边：自右向左
    { x: inset, y: end, angle: -Math.PI / 2 } // 左边：自下向上
  ];
}

/**
 * 图片符号：将图块沿矩形各边按方向旋转、重复铺设
 * @param {Object} ctx canvas 2d 上下文
 * @param {number} size 图标 CSS 像素边长
 * @param {number} inset 轮廓中心线距画布边缘的距离
 * @param {number} bandWidth 轮廓带宽度（CSS px）
 * @param {OutlineTile} tile 图片图块
 * @param {number} drawWidth 图块沿线方向的绘制宽（CSS px），默认图块原始宽
 * @param {number} spacing 图块中心间距（CSS px），默认图块宽（连续）
 */
function strokeImageOutline(ctx, size, inset, bandWidth, tile, spacing, drawWidth = tile.cssWidth) {
  const sideLength = size - 2 * inset;
  if (sideLength <= 0 || !tile) {
    return;
  }
  const step = spacing && spacing > 0 ? spacing : drawWidth;
  // 每边可铺图块数；剩余量均分到起点，避免末尾出现短图块
  const count = Math.max(1, Math.floor(sideLength / step));
  const actualStep = sideLength / count;
  const startShift = (sideLength - count * actualStep) / 2;
  getOutlineSides(size, inset).forEach(side => {
    const dirX = Math.cos(side.angle);
    const dirY = Math.sin(side.angle);
    for (let i = 0; i < count; i++) {
      const distance = startShift + (i + 0.5) * actualStep;
      const cx = side.x + dirX * distance;
      const cy = side.y + dirY * distance;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(side.angle);
      ctx.drawImage(tile.canvas, -drawWidth / 2, -bandWidth / 2, drawWidth, bandWidth);
      ctx.restore();
    }
  });
}

/**
 * 在正方形 canvas 上沿线符号各图层描出矩形轮廓（调用方负责 DPR 与 transform）
 * @param {Object} canvas 画布
 * @param {number} size 图标 CSS 像素边长
 * @param {Array} layers 归一化后的轮廓图层
 * @param {Map} tiles 已就绪的图片符号图块（按 imageId 索引 OutlineTile）
 * @param {number} outlineOpacity 轮廓整体不透明度，与各图层自身 line-opacity 相乘
 */
export function drawFillOutline(canvas, size, layers, tiles, outlineOpacity, needClear = true) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  // 轮廓独立成画布时需要先清空；与填充共用一个画布时（填充已画好）不能清空
  if (needClear) {
    ctx.clearRect(0, 0, size, size);
  }

  const drawables = [];
  layers.forEach(layer => {
    if (layer.kind === 'image') {
      const tile = tiles.get(layer.imageId);
      if (!tile) {
        return;
      }
      // 图标点（lineWidth=0）保持图块原始尺寸；其余按符号线宽钳制。
      // 图块原始高度大于图例比例上限时等比缩小，保证轮廓始终落在画布内
      let bandWidth = layer.lineWidth > 0 ? getOutlineDrawWidth(layer.lineWidth, size) : tile.cssHeight;
      let drawWidth = tile.cssWidth;
      const maxBand = Math.max(1, Math.round(size * MAX_OUTLINE_WIDTH_RATIO));
      if (bandWidth > maxBand) {
        const scale = maxBand / bandWidth;
        bandWidth = maxBand;
        drawWidth = tile.cssWidth * scale;
      }
      drawables.push({ layer, tile, bandWidth, drawWidth, offset: roundOutlineOffset(layer.offset) });
      return;
    }
    drawables.push({
      layer,
      bandWidth: getOutlineDrawWidth(layer.lineWidth, size),
      offset: roundOutlineOffset(layer.offset)
    });
  });
  if (!drawables.length) {
    return;
  }

  // line-offset 用矩形 inset 近似（inset 从画布边缘起算，约定正 offset 向内）；
  // offset=0 的主体线贴合图标外围，再整体内移最外层描边的出血量，保证轮廓完整落在画布内
  const minBound = Math.min(...drawables.map(d => d.offset - d.bandWidth / 2));
  const shift = Math.max(0, -minBound);

  drawables.forEach(({ layer, tile, bandWidth, drawWidth, offset }) => {
    const inset = offset + shift;
    if (inset < bandWidth / 2 || size - 2 * inset <= 0) {
      return;
    }
    ctx.globalAlpha = clampOpacity(layer.opacity * outlineOpacity);
    if (layer.kind === 'vector') {
      ctx.beginPath();
      ctx.rect(inset, inset, size - 2 * inset, size - 2 * inset);
      ctx.lineWidth = bandWidth;
      ctx.strokeStyle = layer.color;
      ctx.lineJoin = layer.lineJoin;
      ctx.setLineDash(normalizeDash(layer.dasharray));
      ctx.stroke();
    } else {
      strokeImageOutline(ctx, size, inset, bandWidth, tile, layer.spacing, drawWidth);
    }
  });
  ctx.globalAlpha = 1;
  ctx.setLineDash([]);
}

/**
 * 面图例轮廓绘制入口：根据图例样式数据选择轮廓来源并描边。
 * 调用方需已将 ctx 按 dpr 设置好 transform，并在绘制前填充完面底色。
 * @param {Object} options
 * @param {number} [options.dpr=1] 设备像素比
 * @param {Function} [options.createTile] 图块生成器 (imageId, targetHeight, dpr) => OutlineTile|undefined；
 *   不传时图片符号层自动跳过（如 style 类型图例无法获取图片）
 * @returns {Array<string>} 缺少图片的图片 id 列表（图片符号无取图方式或图片尚未加载时）
 */
export function drawFillLegendOutline(canvas, size, styleData, options = {}) {
  const { dpr = 1, createTile } = options;
  const outlineSymbol = styleData && styleData.outlineSymbolsContent;
  const outlineOpacity = clampOpacity(
    styleData && typeof styleData.outlineOpacity === 'number' ? styleData.outlineOpacity : 1
  );
  // 面板轮廓配置（颜色 / 宽度）：存在时优先于轮廓线符号内部的 line-color / line-width
  const overrideColor = styleData && typeof styleData.outlineColor === 'string' ? styleData.outlineColor : undefined;
  let overrideWidth;
  if (styleData && styleData.outlineWidth !== undefined && styleData.outlineWidth !== null) {
    const parsedWidth = Number.parseFloat(styleData.outlineWidth);
    overrideWidth = Number.isNaN(parsedWidth) ? undefined : parsedWidth;
  }
  let layers = [];
  if (outlineSymbol && outlineSymbol.symbolId) {
    layers = getFillOutlineLayers(outlineSymbol, overrideColor, overrideWidth);
  } else if (styleData && styleData.outlineStyle === 'solid') {
    const defaultWidth = 0.5;
    const parsedWidth = Number.parseFloat(styleData.outlineWidth || '');
    layers = [
      getPlainOutlineLayer(
        styleData.outlineColor || '#FFFFFF',
        Number.isNaN(parsedWidth) ? defaultWidth : parsedWidth
      )
    ];
  }
  if (!layers.length) {
    return [];
  }
  const tiles = new Map();
  const missingTiles = [];
  layers.forEach(layer => {
    if (layer.kind !== 'image') {
      return;
    }
    // 图标点（lineWidth=0）不钳制高度，按原始尺寸取图块；纹理按符号线宽钳制
    const targetHeight = layer.lineWidth > 0 ? getOutlineDrawWidth(layer.lineWidth, size) : undefined;
    const tile = typeof createTile === 'function' ? createTile(layer.imageId, targetHeight, dpr) : undefined;
    if (tile) {
      tiles.set(layer.imageId, tile);
    } else {
      missingTiles.push(layer.imageId);
    }
  });
  // 与面填充共用同一画布，填充底色已由调用方画好，不能清空
  drawFillOutline(canvas, size, layers, tiles, outlineOpacity, false);
  return missingTiles;
}
