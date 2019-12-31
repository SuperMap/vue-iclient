<template>
  <div
    class="sm-component-scale"
    :style="[background && getBackgroundStyle, (textColor && getTextColorStyle) || getColorStyle(0)]"
  >
    <span>{{ content }}</span>
  </div>
</template>
<script>
import Theme from '../../../../common/_mixin/theme';
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
  methods: {
    inlitializeScale(map) {
      let scaleViewModel = new ScaleViewModel(map);
      this.viewModel = scaleViewModel;
      this.updateContainer();
      scaleViewModel.onMoveEvt();
    },
    updateContainer() {
      this.viewModel.on('scaleupdated', e => {
        this.content = e.containerContent;
        this.$el.style.width = e.containerWidth;
      });
    }
  },
  loaded() {
    this.inlitializeScale(this.map);
  }
};
</script>
