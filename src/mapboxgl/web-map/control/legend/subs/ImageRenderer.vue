<template>
  <canvas :id="canvasId"></canvas>
</template>

<script>
import omit from 'omit.js';
import uniqueId from 'lodash.uniqueid';
import { drawFillLegendOutline, getFillOutlineLayers, createOutlineTileFromSprite } from './fillOutline';
import { loadSpriteImage, loadSpriteMeta } from './sprite';

export default {
  props: {
    styleData: {
      type: Object
    }
  },
  data() {
    return {
      canvasId: uniqueId('legend_image_')
    };
  },
  computed: {
    styleRendererData() {
      return this.styleData.style;
    },
    shape() {
      return this.styleRendererData.shape.toLowerCase();
    },
    cssStyle() {
      return omit(this.styleRendererData, ['type', 'shape', 'sprite', 'url', 'outlineSprites']);
    },
    // 面轮廓线符号是否含图片图案层（line-pattern / icon-image）
    hasImageOutline() {
      if (this.shape !== 'rectangle') {
        return false;
      }
      return getFillOutlineLayers(this.cssStyle.outlineSymbolsContent).some(layer => layer.kind === 'image');
    }
  },
  mounted() {
    // 雪碧图（sprite.png）加载完成后绘制；面轮廓含图片图案时优先用库随样式附带的雪碧图信息，
    // 未附带时请求同名 sprite.json 定位图案，元数据加载失败则退化为不绘制图案层
    loadSpriteImage(this.styleRendererData.url)
      .then(img => {
        if (!this.hasImageOutline) {
          return this.drawImage(img);
        }
        const { outlineSprites } = this.styleRendererData;
        if (outlineSprites && Object.keys(outlineSprites).length) {
          return this.drawImage(img, outlineSprites);
        }
        return loadSpriteMeta(this.styleRendererData.url)
          .then(meta => this.drawImage(img, meta))
          .catch(() => this.drawImage(img));
      })
      .catch(() => {});
  },
  methods: {
    drawImage(img, spriteMeta = null) {
      const canvas = document.getElementById(this.canvasId);
      const ctx = canvas.getContext('2d');
      const { opacity } = this.cssStyle;
      const {
        sprite: {
          sdf,
          pixelRatio = 1,
          x: sx = 0,
          y: sy = 0,
          width: sWidth = img.width,
          height: sHeight = img.height
        } = {}
      } = this.styleRendererData;
      let displayWidth = sWidth;
      let displayHeight = sHeight;
      let fillColor = 'transparent';
      let repeatPattern = false;
      let displayIconWidth = 0;
      let displayIconHeight = 0;
      switch (this.shape) {
        case 'point': {
          const { fontSize, color } = this.cssStyle;
          const size = parseInt(fontSize);
          displayWidth = size;
          displayHeight = size;
          // SDF 图片通过颜色底图和遮罩完成着色；普通图片保留自身颜色及透明背景。
          fillColor = sdf ? color : 'transparent';
          break;
        }
        case 'animateline': {
          const { width, height, backgroundColor, iconStep } = this.cssStyle;
          displayWidth = parseInt(width);
          displayHeight = parseInt(height);
          fillColor = backgroundColor;
          repeatPattern = true;
          displayIconWidth = iconStep;
          displayIconHeight = displayHeight;
          break;
        }
        case 'rectangle': {
          const { width, height, backgroundColor } = this.cssStyle;
          displayWidth = parseInt(width);
          displayHeight = parseInt(height);
          fillColor = backgroundColor;
          break;
        }
      }
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      ctx.globalAlpha = opacity;
      ctx.fillStyle = fillColor;
      ctx.fillRect(0, 0, displayWidth, displayHeight);
      if (repeatPattern) {
        const patternCanvas = document.createElement('canvas');
        const patternContext = patternCanvas.getContext('2d');
        patternCanvas.width = displayIconWidth;
        patternCanvas.height = displayIconHeight;
        patternContext.drawImage(
          img,
          sx * pixelRatio,
          sy * pixelRatio,
          sWidth,
          sHeight,
          0,
          0, // 目标矩形（绘制到Canvas的位置）
          displayIconWidth,
          displayIconHeight // 目标矩形（绘制的宽度和高度）
        );
        const pattern = ctx.createPattern(patternCanvas, 'repeat');
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, displayWidth, displayHeight);
      }
      if (sdf) {
        // set composite mode
        ctx.globalCompositeOperation = 'destination-in';
      }
      if (!repeatPattern) {
        // draw image
        ctx.drawImage(img, sx * pixelRatio, sy * pixelRatio, sWidth, sHeight, 0, 0, displayWidth, displayHeight);
      }
      // 面（图片填充符号）的轮廓层：纯色 / 轮廓线符号，该画布按物理像素 1:1 绘制，dpr 传 1
      if (this.shape === 'rectangle') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
        let createTile;
        if (spriteMeta) {
          createTile = (imageId, targetHeight, dpr) =>
            createOutlineTileFromSprite(img, spriteMeta, imageId, targetHeight, dpr);
        }
        drawFillLegendOutline(canvas, displayWidth, this.cssStyle, { dpr: 1, createTile });
      }
    }
  }
};
</script>
