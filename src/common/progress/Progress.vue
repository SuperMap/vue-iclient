<template>
  <div class="sm-component-progress" :style="[background && getBackgroundStyle]">
    <a-progress
      :percent="parseFloat(finalValue)"
      :type="type"
      :stroke-width="parseFloat(strokeWidth)"
      :show-info="showInfo"
      :width="calWidth"
      :stroke-color="colorData"
      :status="status"
      :gap-degree="type === 'circle' ? gapDegree : null"
      :gap-position="gapPosition"
      :stroke-linecap="strokeLinecap"
    ></a-progress>
  </div>
</template>
<script>
import Theme from '../_mixin/theme';
import { ResizeSensor } from 'css-element-queries';
import Timer from '../_mixin/timer';
import ThirdService from '../_mixin/thirdService';

export default {
  name: 'SmProgress',
  mixins: [Theme, Timer, ThirdService],
  props: {
    percent: {
      type: [Number, String],
      required: true
    },
    type: {
      type: String,
      default: 'line'
    },
    strokeWidth: {
      type: [Number, String],
      default: 6
    },
    status: {
      type: String
    },
    strokeColor: {
      type: String
    },
    trailColor: {
      type: String,
      default: '#f3f3f3'
    },
    size: {
      type: [Number] // fix 其父元素宽高都很大的时候，需要传一个合适的size, 这时候不会自适应, 如需自适应则不传size
    },
    showInfo: {
      type: Boolean,
      default: true
    },
    gapDegree: {
      type: Number,
      default: 0
    },
    gapPosition: {
      type: String,
      default: 'top',
      validator(gapPosition) {
        const positionList = ['top', 'bottom', 'left', 'right'];
        return positionList.includes(gapPosition);
      }
    },
    strokeLinecap: {
      type: String,
      default: 'round',
      validator(strokeLinecap) {
        const strokeLinecapList = ['round', 'square'];
        return strokeLinecapList.includes(strokeLinecap);
      }
    }
  },
  data() {
    return {
      colorData: '',
      circleWidth: 0,
      finalValue: this.percent
    };
  },
  computed: {
    calWidth() {
      if (this.size) {
        return this.size;
      }
      return this.circleWidth;
    }
  },
  watch: {
    strokeColor(val) {
      this.colorData = val;
    },
    trailColor: {
      handler() {
        if (this.type === 'circle' && this.progressTrailNode) {
          this.progressTrailNode.style.stroke = this.trailColor;
        }
        if (this.type === 'line' && this.progressLineTrailNode) {
          this.progressLineTrailNode.style.backgroundColor = this.trailColor;
        }
      }
    },
    textColorsData: {
      handler() {
        if (this.progressTextNode) {
          this.progressTextNode.style.color = this.getTextColor;
        }
      }
    },
    percent(val) {
      this.finalValue = val;
    }
  },
  created() {
    this.colorData = this.strokeColor || this.getColor(0);
  },
  mounted() {
    this.$on('theme-style-changed', () => {
      this.colorData = this.getColor(0);
    });
    this.progressTextNode = this.$el.querySelector('.ant-progress-text');
    this.progressTextNode.style.color = this.getTextColor;
    this.progressTrailNode = this.$el.querySelector('.ant-progress-circle-trail');
    this.progressLineTrailNode = this.$el.querySelector('.ant-progress-inner');
    if (this.type === 'circle' && this.progressTrailNode) {
      this.progressTrailNode.style.stroke = this.trailColor;
    }
    if (this.type === 'line' && this.progressLineTrailNode) {
      this.progressLineTrailNode.style.backgroundColor = this.trailColor;
    }
    this.resizeObsever = new ResizeSensor(this.$el, () => {
      this.resize();
    });
  },
  beforeDestroy() {
    this.restService && this.restService.remove('getdatasucceeded');
  },
  methods: {
    resize() {
      this.circleWidth = Math.min(this.$el.offsetWidth, this.$el.offsetHeight);
    },
    timing() {
      this.getData();
    }
  }
};
</script>
