<template>
  <div class="sm-widget-progress">
    <a-progress
      :percent="parseFloat(percent)"
      :type="type"
      :stroke-width="parseFloat(strokeWidth)"
      :show-info="showInfo"
      :width="type==='circle' ? parseFloat(circleWidth) : null"
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

export default {
  name: 'SmProgress',
  mixins: [Theme],
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
    }
  },
  data() {
    return {
      curColor: '',
      circleWidth: ''
    };
  },
  watch: {
    strokeColor: {
      handler() {
        this.curColor = this.strokeColor;
      }
    },
    colorGroupsData: {
      handler() {
        this.curColor = this.getColor(0);
      }
    },
    textColorsData: {
      handler() {
        if (this.progressTextNode) {
          this.progressTextNode.style.color = this.getTextColor;
        }
      }
    }
  },
  mounted() {
    this.curColor = this.strokeColor || this.getColor(0);
    this.progressTextNode = this.$el.querySelector('.ant-progress-text');
    this.progressTextNode.style.color = this.getTextColor;
    this.resize();
    window.addEventListener('resize', () => {
      this.resize();
    });
  },
  methods: {
    resize() {
      if (this.type === 'circle' && !this.size) {
        setTimeout(() => {
          if (this.type === 'circle' && !this.size) {
            this.circleWidth = Math.min(this.$el.parentNode.offsetWidth, this.$el.parentNode.offsetHeight);
          }
        }, 0);
      }
    }
  }
};
</script>
