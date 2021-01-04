<template>
  <div
    class="sm-component-scale"
    :style="[background && getBackgroundStyle, (textColor && getTextColorStyle) || getColorStyle(0)]"
  >
    <span>{{ content }}</span>
  </div>
</template>
<script>
import Theme from '../../../../common/_mixin/Theme';
import Control from '../../../_mixin/control';
import MapGetter from '../../../_mixin/map-getter';
import ScaleViewModel from './ScaleViewModel';

export default {
  name: 'SmScale',
  mixins: [MapGetter, Theme, Control],
  props: {
    unit: {
      type: String,
      default: 'metric',
      validator(value) {
        return ['imperial', 'metric', 'nautical'].includes(value);
      }
    },
    maxWidth: {
      type: Number,
      default: 100
    }
  },
  data() {
    return {
      content: null
    };
  },
  watch: {
    unit() {
      this.viewModel && this.viewModel.setUnit(this.unit);
    },
    maxWidth() {
      this.viewModel && this.viewModel.setMaxWidth(this.maxWidth);
    }
  },
  created() {
    this.viewModel = new ScaleViewModel();
    this.viewModel.on('scaleupdated', this.scaleUpdatedFn);
  },
  methods: {
    scaleUpdatedFn(e) {
      this.content = e.containerContent;
      this.$el.style.width = e.containerWidth;
    }
  },
  beforeDestory() {
    this.viewModel.off('scaleupdated', this.scaleUpdatedFn);
  }
};
</script>
