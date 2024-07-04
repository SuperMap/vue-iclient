<template>
  <i v-if="'icon' in styleRendererData" :class="styleRendererData.icon" :style="cssStyle" />
  <div
    v-else-if="colors"
    :style="{ width: `${linearWidth}px`, padding: `0 ${maxPaletteOffset}px 0 ${minPaletteOffset}px` }"
  >
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
import { hexToRgba } from 'vue-iclient/src/common/_utils/util';

export default {
  props: {
    styleData: {
      type: Object
    }
  },
  data() {
    return {
      linearWidth: 214,
      animateTimer: null
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
  beforeDestroy() {
    this.animateTimer && window.clearInterval(this.animateTimer);
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
      const { opacity = 1, fontSize, width, height } = this.styleRendererData;
      if ('width' in this.styleRendererData) {
        canvas.width = parseInt(width);
        canvas.height = parseInt(height);
      } else {
        const size = parseInt(fontSize);
        canvas.width = size;
        canvas.height = size;
      }
      ctx.globalAlpha = opacity;
      switch (this.shapeType) {
        case 'point': {
          const { color } = this.styleRendererData;
          const radius = parseInt(fontSize) / 2;
          ctx.arc(radius, radius, parseInt(fontSize) / 2, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
          break;
        }
        case 'animatepoint': {
          this.animateTimer = this.initAnimatePoint();
          break;
        }
        case 'radarpoint': {
          this.animateTimer = this.initRadar();
          break;
        }
        case 'line':
        case 'animateline': {
          canvas.height = height && height < 1 ? 1 : height;
          this.drawLines(canvas, ctx);
          break;
        }
        case 'fill':
        case 'rectangle': {
          const { color, backgroundColor = color, outlineColor = backgroundColor } = this.styleRendererData;
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.strokeStyle = outlineColor;
          ctx.strokeRect(0, 0, canvas.width, canvas.height);
          break;
        }
        case 'triangle': {
          const { color } = this.styleRendererData;

          // 计算边长，选择宽度和高度中较小的那个，并乘以2/sqrt(3)来得到边长
          // 因为等边三角形的高是边长的sqrt(3)/2，所以边长 = 高 * 2/sqrt(3)
          const sideLength = (Math.min(canvas.width, canvas.height) * 2) / Math.sqrt(3);

          // 计算三角形顶点和底边的位置
          const topX = canvas.width / 2; // 顶点位于顶部中央
          const topY = 0;
          const gap = canvas.width * 0.09;
          const bottomLeftX = topX - sideLength / 2 + gap; // 左侧底角
          const bottomLeftY = canvas.height;
          const bottomRightX = topX + sideLength / 2 - gap; // 右侧底角
          const bottomRightY = canvas.height;

          // 绘制等边三角形
          ctx.beginPath();
          ctx.moveTo(topX, topY);
          ctx.lineTo(bottomLeftX, bottomLeftY);
          ctx.lineTo(bottomRightX, bottomRightY);
          ctx.closePath();
          ctx.fillStyle = color;
          ctx.fill();
          break;
        }
        case 'hexagon': {
          const { fontSize, color } = this.styleRendererData;
          const radius = parseInt(fontSize) / 2;
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          ctx.beginPath();
          // 六边形的一个顶点与水平轴成30度角
          const startAngle = Math.PI / 6; // 30度转换为弧度
          // 绘制六边形的每个顶点
          for (let i = 0; i < 6; i++) {
            const angle = startAngle + (i * Math.PI) / 3; // 每次增加60度（弧度）

            // 计算每个顶点的x和y坐标
            const x = centerX + radius * Math.cos(angle);
            const y = centerY - radius * Math.sin(angle);

            // 将第一个点移动到路径的起始位置
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              // 后续的点用lineTo连接到路径上
              ctx.lineTo(x, y);
            }
          }
          // 描边六边形
          ctx.fillStyle = color;
          ctx.fill();
          break;
        }
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
    },
    initAnimatePoint() {
      const { size, color, opacity, rings, speed } = this.styleRendererData;
      const canvas = document.getElementById(this.canvasId);
      if (!canvas) {
        return;
      }
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const x = size / 2; // x 坐标值
      const y = size / 2; // y 坐标值
      const startAngle = 0; // 开始点
      const radius = size / 2;
      const step = radius / rings;

      const endAngle = Math.PI * 2; // 结束点

      function createCircle(newR, i) {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(x, y, newR, startAngle, endAngle);
        ctx.strokeStyle = color;
        if (i === rings) {
          ctx.strokeStyle = hexToRgba(color, 0.1);
        }
        if (rings <= 3) {
          ctx.lineWidth = 1.5;
        }
        ctx.stroke();
      }
      // 1、静态圆
      // for (let i = 0; i < rings; i++) {
      //     createCircle(radius - i * step);
      // }

      // 动画圆
      let i = 0;
      const drawCircle = function () {
        const r = speed > 0 ? 0 + i * step : radius - i * step;
        createCircle(r, i);
        if (i < rings) {
          i++;
        } else {
          i = 0;
        }
      };

      const render = function () {
        const prev = ctx.globalCompositeOperation;
        // 只显示canvas上原图像的重叠部分
        ctx.globalCompositeOperation = 'destination-in';
        // 设置主canvas的绘制透明度
        ctx.globalAlpha = opacity;
        // 这一步目的是将canvas上的图像变的透明
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // 在原图像上重叠新图像
        ctx.globalCompositeOperation = prev;
        // 在主canvas上画新圆
        drawCircle();
      };
      const timer = setInterval(render, speed * 100);
      return timer;
    },
    initRadar() {
      const { size, color, opacity, speed } = this.styleRendererData;
      const canvas = document.getElementById(this.canvasId);
      if (!canvas) {
        return;
      }
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      ctx.globalAlpha = opacity;
      const x = size / 2; // x 坐标值
      const y = size / 2; // y 坐标值
      const radius = size / 2;

      function drawRadar(iDeg) {
        if (!ctx) {
          return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const startAngle = ((-90 + (speed < 0 ? iDeg : -iDeg)) / 180) * Math.PI;
        const endAngle = ((90 + (speed < 0 ? iDeg : -iDeg)) / 180) * Math.PI;

        let grd = ctx.createLinearGradient(1.5 * radius, 2 * radius, 1.5 * radius, 0);
        if (iDeg >= 270) {
          grd = ctx.createLinearGradient(0, 1.5 * radius, 2 * radius, 1.5 * radius);
        } else if (iDeg >= 180) {
          grd = ctx.createLinearGradient(0.5 * radius, 0, 0.5 * radius, 2 * radius);
        } else if (iDeg >= 90) {
          grd = ctx.createLinearGradient(2 * radius, 0.5 * radius, 0, 0.5 * radius);
        }

        grd.addColorStop(0, hexToRgba(color, 0));
        grd.addColorStop(1, color);

        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();
      }
      // 静态扇形
      // drawRadar(0);

      let deg = 0;
      function loop() {
        deg = deg + 15;
        drawRadar(deg);
        if (deg === 360) {
          deg = 0;
        }
      }
      // 动画没有清除，应该是定时器没有关闭
      const timer = setInterval(loop, (2 * Math.PI * radius) / speed);
      return timer;
    }
  }
};
</script>
