<template>
  <div class="sm-component-scale" :style="[scaleStyle, getColorStyle(0)]">{{ content }}</div>
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
      width: null,
      content: null
    };
  },
  computed: {
    scaleStyle() {
      return { width: this.width };
    }
  },
  methods: {
    inlitializeScale(map) {
      let scaleViewModel = new ScaleViewModel(map);
      this.scaleViewModel = scaleViewModel;
      this.updateContainer();
      scaleViewModel.onMoveEvt();
    },
    updateContainer() {
      this.scaleViewModel.on('scaleupdated', e => {
        this.width = e.containerWidth;
        this.content = e.containerContent;
      });
    }
  },
  loaded() {
    this.inlitializeScale(this.map);
  }
};
</script>
