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
      let dispalyWidth = sWidth;
      let dispalyHeight = sHeight;
      let fillColor;
      switch (this.shape) {
        case 'point': {
          const { fontSize, color } = this.cssStyle;
          const size = parseInt(fontSize);
          dispalyWidth = size;
          dispalyHeight = size;
          fillColor = color;
          break;
        }
        case 'fill':
        case 'fillextrusion': {
          const { width, height, backgroudColor } = this.cssStyle;
          dispalyWidth = parseInt(width);
          dispalyHeight = parseInt(height);
          fillColor = backgroudColor;
        }
      }
      canvas.width = dispalyWidth;
      canvas.height = dispalyHeight;
      if (sdf) {
        ctx.globalAlpha = opacity;
        ctx.fillStyle = fillColor;
        ctx.fillRect(0, 0, dispalyWidth, dispalyHeight);
        // set composite mode
        ctx.globalCompositeOperation = 'destination-in';
      }
      // draw image
      ctx.drawImage(img, sx * pixelRatio, sy * pixelRatio, sWidth, sHeight, 0, 0, dispalyWidth, dispalyHeight);
      if (outlineColor) {
        ctx.strokeStyle = outlineColor;
        ctx.strokeRect(0, 0, dispalyWidth, dispalyHeight);
      }
    }
  }
};
</script>
