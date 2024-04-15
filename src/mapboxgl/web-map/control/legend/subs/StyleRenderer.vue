<template>
  <i v-if="'icon' in styleRendererData" :class="styleRendererData.icon" :style="cssStyle" />
  <div v-else-if="colors" :style="{ width: `${linearWidth}px` }">
    <div class="sm-component-legend__linearcolor" :style="linearColorStyle" />
    <div v-if="'styleField' in styleData" class="sm-component-legend__colorstop">
      <div
        v-for="(data, index) in mapPaletteToStops"
        :key="index"
        class="color-stop-holder"
        :style="{ [index === mapPaletteToStops.length - 1 ? 'right' : 'left']: `${data.offset}px` }"
      >
        <div class="color-arrow"></div>
        <div class="color-value" :style="{ backgroundColor: data.color }" />
      </div>
    </div>
    <div class="sm-component-legend__colorfieldrange">
      <div class="color-field-holder" :title="range.min" :style="{ left: `${minPaletteOffset}px` }">
        {{ range.min }}
      </div>
      <div class="color-field-holder" :title="range.max" :style="{ right: `${maxPaletteOffset}px` }">
        {{ range.max }}
      </div>
    </div>
  </div>
  <canvas v-else :id="canvasId" />
</template>

<script>
import uniqueId from 'lodash.uniqueid';
import omit from 'omit.js';

export default {
  props: {
    styleData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      linearWidth: 214
    };
  },
  computed: {
    canvasId() {
      const { icon, colors, type } = this.styleData.style;
      if (icon || colors) {
        return null;
      }
      return uniqueId(`legend_${type}_`);
    },
    styleRendererData() {
      return this.styleData.style;
    },
    styleType() {
      return this.styleRendererData.type;
    },
    shapeType() {
      return this.styleRendererData.shape.toLowerCase();
    },
    palette() {
      return this.colorsToPalatte(this.styleRendererData.colors);
    },
    range() {
      if (!('styleField' in this.styleData)) {
        return {
          min: this.$t('legend.bottom'),
          max: this.$t('legend.top')
        };
      }
      const colors = this.styleRendererData.colors;
      const lastIndex = colors.length ? colors.length - 1 : 0;
      return {
        min: colors[0]?.key ?? this.$t('legend.bottom'),
        max: colors[lastIndex]?.key ?? this.$t('legend.top')
      };
    },
    colors() {
      return this.palette.map(p => p.color).join(',');
    },
    mapPaletteToStops() {
      const HALF_STOP_WIDTH = 5;
      return this.palette.map((options, index) => {
        const { color, offset } = options;
        const offsetVal = this.linearWidth * parseFloat(offset) - HALF_STOP_WIDTH;
        return {
          color,
          offset: index === this.palette.length - 1 ? -HALF_STOP_WIDTH : offsetVal
        };
      });
    },
    minPaletteOffset() {
      return this.mapPaletteToStops[0]?.offset;
    },
    maxPaletteOffset() {
      return this.mapPaletteToStops.slice(-1)[0]?.offset;
    },
    linearColorStyle() {
      let colors = this.colors;
      if (!('styleField' in this.styleData)) {
        colors = this.styleRendererData.colors.reduce((style, item) => {
          style = style ? `${style}, ` : style;
          style += `${item.value} ${item.key * 100}%`;
          return style;
        }, '');
      }
      return { backgroundImage: `linear-gradient(90deg, ${colors})` };
    },
    cssStyle() {
      return omit(this.styleRendererData, ['type', 'shape', 'icon', 'colors']);
    }
  },
  mounted() {
    if (this.canvasId) {
      this.drawShape();
    }
  },
  methods: {
    colorsToPalatte(colors) {
      if (!colors) {
        return [];
      }
      const { max, min } = this.range;
      return colors.map(({ key, value }) => {
        return {
          color: value,
          offset: ((parseFloat(`${key}`) - min) / (max - min)).toFixed(2)
        };
      });
    },
    drawShape() {
      const canvas = document.getElementById(this.canvasId);
      const ctx = canvas.getContext('2d');
      switch (this.shapeType) {
        case 'point': {
          const { fontSize, color, opacity } = this.styleRendererData;
          const size = parseInt(fontSize);
          const radius = parseInt(fontSize) / 2;
          canvas.width = size;
          canvas.height = size;
          ctx.globalAlpha = opacity;
          ctx.arc(radius, radius, parseInt(fontSize) / 2, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
          break;
        }
        case 'line': {
          const { width, height, opacity } = this.styleRendererData;
          canvas.width = width;
          canvas.height = height && height < 1 ? 1 : height;
          ctx.globalAlpha = opacity;
          this.drawLines(canvas, ctx);
          break;
        }
        case 'fill':
        case 'fillextrusion':
          const { width, height, backgroundColor, outlineColor, opacity } = this.styleRendererData;
          const rWidth = parseInt(width);
          const rHeight = parseInt(height);
          canvas.width = rWidth;
          canvas.height = rHeight;
          ctx.globalAlpha = opacity;
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, rWidth, rHeight);
          ctx.strokeStyle = outlineColor;
          ctx.strokeRect(0, 0, rWidth, rHeight);
          break;
      }
    },
    drawLines(canvas, ctx) {
      if (this.styleRendererData.lineStyles) {
        return this.drawMultiLine(canvas, ctx);
      }
      this.drawDashedLine(canvas, ctx);
    },
    drawDashedLine(canvas, ctx) {
      const LEGEND_LINE_WIDTH = 100;
      const LINE_DASH_WIDTH = 1;
      const {
        lineDasharray: pattern = [],
        lineWidth = LINE_DASH_WIDTH,
        color = '#FFF',
        width = LEGEND_LINE_WIDTH,
        lineHeight
      } = this.styleRendererData;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = lineHeight || lineWidth;
      ctx.strokeStyle = color;

      ctx.beginPath();
      ctx.setLineDash(pattern.map(x => x * lineWidth));
      const y = 0 + ctx.lineWidth / 2;
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    },
    drawMultiLine(canvas, ctx) {
      const { width: canvasWidth, lineStyles } = this.styleRendererData;
      const newLines = this.roundNumber(lineStyles);

      const canvasHeight = this.getCanvasHeight(newLines);
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const startY = this.getStartY(newLines);
      newLines.forEach(v => {
        ctx.beginPath();
        const { lineWidth, color = '#FFF', lineDash } = v;
        const y = this.getY(v, canvasHeight, startY);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.setLineDash(lineDash);
        ctx.stroke();
      });
    },
    // 将所有宽度和offset取整；
    roundNumber(lineParams) {
      return lineParams.map(l => {
        const { lineWidth, lineOffset } = l;
        let newOffset = lineOffset;
        if (lineOffset > 0 && lineOffset < 1) {
          newOffset = 1;
        } else if (lineOffset > -1 && lineOffset < 0) {
          newOffset = -1;
        }
        return {
          ...l,
          lineWidth: lineWidth < 1 ? 1 : Math.round(lineWidth),
          lineOffset: Math.round(newOffset)
        };
      });
    },
    // 通过多线参数计算canvas的高度
    getCanvasHeight(lineParams) {
      const posWidths = [];
      const negWidths = [];
      lineParams.forEach(l => {
        const { lineWidth, lineOffset } = l;
        if (lineOffset > 0) {
          posWidths.push(lineWidth + lineOffset);
        } else if (lineOffset < 0) {
          negWidths.push(lineWidth + Math.abs(lineOffset));
        }
      });
      const maxPosWidth = posWidths.length > 0 ? Math.max(...posWidths) : 0;
      const maxNegWidth = negWidths.length > 0 ? Math.max(...negWidths) : 0;
      let result = maxPosWidth + maxNegWidth;
      lineParams.forEach(l => {
        const { lineWidth } = l;
        if (lineWidth > result) {
          result += lineWidth - result;
        }
      });
      // 中心0,0，所以需要+1
      return result + 1;
    },
    // 计算开始的y
    getStartY(lineParams) {
      let minOffset = 0;
      let minWidth = 0;
      lineParams.forEach(l => {
        if (l.lineOffset && l.lineOffset < 0 && l.lineOffset < minOffset) {
          minOffset = l.lineOffset;
          minWidth = l.lineWidth;
        }
      });
      return Math.abs(minOffset) + minWidth;
    },

    // 获取绘制的y轴位置
    getY(line, canvasHeight, startY) {
      const { lineWidth, lineOffset } = line;
      const prefix = lineWidth / 2;
      let y = 0;
      if (lineOffset === 0) {
        // 中间对齐
        y = prefix + (canvasHeight - lineWidth) / 2;
      } else if (lineOffset < 0) {
        // 负数
        y = prefix + (startY - (Math.abs(lineOffset) + lineWidth));
      } else {
        // + 1是0原点
        y = prefix + (canvasHeight - lineWidth) / 2 + lineOffset + 1;
      }
      return y;
    }
  }
};
</script>
