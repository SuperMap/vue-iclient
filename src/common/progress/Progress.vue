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
import Control from '../../mapboxgl/_mixin/control';

export default {
  name: 'SmProgress',
  mixins: [Control, Theme],
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
      circleWidth: 120
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
    // this.$nextTick(() => {
    //   this.circleWidth = Math.min(this.$el.parentNode.offsetWidth, this.$el.parentNode.offsetHeight);
    // });
    window.addEventListener('resize', () => {
      this.$nextTick(() => {
        this.circleWidth = Math.min(this.$el.parentNode.offsetWidth, this.$el.parentNode.offsetHeight);
      });
    });
  }
};
</script>
