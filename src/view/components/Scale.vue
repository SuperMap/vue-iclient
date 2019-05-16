<template>
  <div class="sm-widget-scale" :style="[scaleStyle, getColorStyle(0)]">{{ content }}</div>
</template>
<script>
import Theme from '../mixin/theme';
import MapGetter from '../mixin/map-getter';

import ScaleViewModel from '../../viewmodel/ScaleViewModel';

export default {
  name: 'SmScale',
  mixins: [MapGetter, Theme],
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
