<template>
  <div class="sm-component-progress" :style="[background && getBackgroundStyle]">
    <a-progress
      :percent="parseFloat(finalPercent)"
      :type="type"
      :stroke-width="parseFloat(strokeWidth)"
      :show-info="showInfo"
      :width="calWidth"
      :stroke-color="curColor"
      :status="status"
      :gap-degree="type==='circle' ? gapDegree : null"
      :gap-position="gapPosition"
      :stroke-linecap="strokeLinecap"
    ></a-progress>
  </div>
</template>
<script>
import Theme from '../_mixin/theme';
import { ResizeSensor } from 'css-element-queries';
import Timer from '../_mixin/timer';
import RestService from '../../mapboxgl/_utils/RestService';

export default {
  name: 'SmProgress',
  mixins: [Theme, Timer],
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
    },
    url: {
      type: String
    }
  },
  data() {
    return {
      circleWidth: 0,
      finalPercent: this.percent
    };
  },
  computed: {
    calWidth() {
      if (this.size) {
        return this.size;
      }
      return this.circleWidth;
    },
    curColor() {
      return this.strokeColor || this.getColor(0);
    }
  },
  watch: {
    textColorsData: {
      handler() {
        if (this.progressTextNode) {
          this.progressTextNode.style.color = this.getTextColor;
        }
      }
    },
    percent(val) {
      this.finalPercent = val;
    },
    url: {
      handler() {
        this.getData();
      },
      immediate: true
    }
  },
  mounted() {
    this.progressTextNode = this.$el.querySelector('.ant-progress-text');
    this.progressTextNode.style.color = this.getTextColor;
    this.resizeObsever = new ResizeSensor(this.$el, () => {
      this.resize();
    });
    this.restService = new RestService();
    this.restService.on('getdatasucceeded', this.fetchData);
  },
  beforeDestroy() {
    this.restService.off('getdatasucceeded', this.fetchData);
  },
  methods: {
    resize() {
      this.circleWidth = Math.min(this.$el.offsetWidth, this.$el.offsetHeight);
    },
    timing() {
      this.getData();
    },
    fetchData(data) {
      this.finalPercent = data.data;
    },
    getData() {
      this.restService && this.restService.getData(this.url);
    }
  }
};
</script>
