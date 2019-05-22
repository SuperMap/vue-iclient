<template>
  <div class="sm-widget-progress">
    <a-progress
      :percent="parseFloat(percentage)"
      :type="type"
      :stroke-width="parseFloat(strokeWidth)"
      :show-info="showText"
      :width="type==='circle'?parseFloat(circleWidth):null"
      :stroke-color="curColor"
      :status="status"
    ></a-progress>
  </div>
</template>
<script>
import Theme from '../mixin/theme';
import Control from '../mixin/control';

export default {
  name: 'SmProgress',
  mixins: [Control, Theme],
  props: {
    percentage: {
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
    color: {
      type: String
    },
    showText: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      curColor: '',
      circleWidth: 110
    };
  },
  watch: {
    color: {
      handler() {
        this.curColor = this.color;
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
  loaded() {
    this.curColor = this.color || this.getColor(0);
    this.progressTextNode = this.$el.querySelector('.el-progress__text');
    this.progressTextNode.style.color = this.getTextColor;
    this.$nextTick(() => {
      this.circleWidth = Math.min(this.$el.parentNode.offsetWidth, this.$el.parentNode.offsetHeight);
    });
    window.addEventListener('resize', () => {
      this.circleWidth = Math.min(this.$el.parentNode.offsetWidth, this.$el.parentNode.offsetHeight);
    });
  }
};
</script>
