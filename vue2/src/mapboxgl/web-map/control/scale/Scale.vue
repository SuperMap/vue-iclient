<template>
  <div
    class="sm-component-scale"
    :style="[background && getBackgroundStyle, (textColor && getTextColorStyle) || getColorStyle(0)]"
  >
    <span>{{ content }}</span>
  </div>
</template>
<script>
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import Control from 'vue-iclient/src/mapboxgl/_mixin/control';
import MapGetter from 'vue-iclient/src/common/_mixin/map-getter';
import ScaleViewModel from 'vue-iclient-core/controllers/mapboxgl/ScaleViewModel';

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
