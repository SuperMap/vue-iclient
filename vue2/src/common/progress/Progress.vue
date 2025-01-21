<script>
import Progress, { ProgressProps, ProgressSize } from 'ant-design-vue/es/progress/progress';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import Timer from 'vue-iclient/src/common/_mixin/Timer';
import ThirdService from 'vue-iclient/src/common/_mixin/ThirdService';
import AntdRender from 'vue-iclient/src/common/_mixin/AntdRender';
import VueTypes from 'vue-iclient/src/common/_utils/vue-types';
import { ResizeSensor } from 'css-element-queries';
import { strip } from '../_utils/util';

export const progressTypes = {
  ...ProgressProps,
  percent: VueTypes.oneOfType([VueTypes.string, VueTypes.number]),
  strokeWidth: VueTypes.oneOfType([VueTypes.number]),
  // fix 其父元素宽高都很大的时候，需要传一个合适的size, 这时候不会自适应, 如需自适应则不传size
  size: VueTypes.oneOfType([ProgressSize, VueTypes.number])
};

export default {
  name: 'SmProgress',
  defaultComponent: Progress,
  mixins: [Theme, AntdRender, Timer, ThirdService],
  props: progressTypes,
  data() {
    return {
      colorData: '',
      circleWidth: 0,
      finalValue: this.percent
    };
  },
  computed: {
    calWidth() {
      if (typeof this.size === 'number') {
        return this.size;
      }
      return this.circleWidth;
    },
    extralProps() {
      const dealWithProps = {
        percent: strip(+this.finalValue),
        strokeColor: this.colorData
      };
      if (+this.finalValue > 100) {
        dealWithProps.format = () => {
          return strip(+this.finalValue) + '%';
        };
      }
      if (this.type === 'circle') {
        dealWithProps.width = this.calWidth;
      }
      return dealWithProps;
    },
    componentStyle() {
      return Object.assign({}, this.getBackgroundStyle, this.getTextColorStyle);
    }
  },
  watch: {
    strokeColor(val) {
      this.colorData = val;
    },
    trailColor(val) {
      if (this.type === 'line' && this.progressLineTrailNode) {
        this.progressLineTrailNode.style.backgroundColor = val;
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
    if (this.type === 'line') {
      const trailClass = this.getPrefixCls('progress-inner', this.prefixCls);
      this.progressLineTrailNode = this.$el.querySelector(`.${trailClass}`);
      this.progressLineTrailNode && (this.progressLineTrailNode.style.backgroundColor = this.trailColor);
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
