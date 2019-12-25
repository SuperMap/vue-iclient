<template>
  <div class="sm-component-progress" :style="[background && getBackgroundStyle]">
    <a-progress
      :percent="parseFloat(finalPercent)"
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
import RestService from '../../common/_utils/RestService';

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
    },
    field: {
      type: String
    }
  },
  data() {
    return {
      colorData: '',
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
    }
  },
  watch: {
    strokeColor(val) {
      this.colorData = val;
    },
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
      handler(val) {
        if (val) {
          this.getData();
        } else {
          this.finalPercent = this.percent;
          this.features = null;
        }
      },
      immediate: true
    },
    field() {
      this.setPercent(this.features);
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
    },
    fetchData({ features }) {
      this.features = features;
      this.setPercent(features);
    },
    getData() {
      if (!this.restService) {
        this.restService = new RestService();
        this.restService.on({ getdatasucceeded: this.fetchData });
      }
      this.restService.getData(this.url);
    },
    setPercent(features) {
      if (features && !!features.length) {
        const field = this.field;
        this.finalPercent = features[0].properties[field];
      }
    }
  }
};
</script>
