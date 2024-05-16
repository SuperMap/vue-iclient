<template>
  <canvas v-if="canvasId" :id="canvasId" />
</template>

<script>
import omit from 'omit.js';
import uniqueId from 'lodash.uniqueid';

export default {
  props: {
    styleData: {
      type: Object,
      default: () => ({})
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
      return omit(this.styleRendererData, ['type', 'shape', 'sprite', 'url']);
    }
  },
  mounted() {
    const img = new Image();
    img.onload = () => {
      this.drawImage(img);
    };
    img.src = this.styleRendererData.url;
  },
  methods: {
    drawImage(img) {
      const canvas = document.getElementById(this.canvasId);
      const ctx = canvas.getContext('2d');
      const { opacity, outlineColor } = this.cssStyle;
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
      let fillColor;
      let repeatPattern = false;
      let displayIconWidth = 0;
      let displayIconHeight = 0;
      switch (this.shape) {
        case 'point': {
          const { fontSize, color } = this.cssStyle;
          const size = parseInt(fontSize);
          displayWidth = size;
          displayHeight = size;
          fillColor = color;
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
        case 'line': {
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
      if (outlineColor) {
        ctx.strokeStyle = outlineColor;
        ctx.strokeRect(0, 0, displayWidth, displayHeight);
      }
    }
  }
};
</script>
