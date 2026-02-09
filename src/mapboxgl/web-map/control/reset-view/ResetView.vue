<template>
  <div class="sm-component-reset-view">
    <div class="sm-component-reset-view__reset-holder" :style="[collapseCardHeaderBgStyle, headingTextColorStyle]">
      <sm-button
        class="reset-button"
        @click="resetMapView"
      >
        <i class="sm-components-icon-morenxianshi" />
      </sm-button>
    </div>
  </div>
</template>
<script>
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import Control from 'vue-iclient/src/mapboxgl/_mixin/control';
import MapGetter from 'vue-iclient/src/mapboxgl/_mixin/map-getter';
import ResetViewModel from './RestViewModel';
import SmButton from 'vue-iclient/src/common/button/Button.vue';

export default {
  name: 'SmReset',
  components: {
    SmButton
  },
  mixins: [MapGetter, Control, Theme],
  props: {
    duration: {
      type: Number,
      // ms
      default: 1000
    }
  },
  created() {
    this.viewModel = new ResetViewModel();
  },
  methods: {
    resetMapView() {
      const mapNotLoaded = this.mapNotLoadedTip();
      if (mapNotLoaded) {
        return;
      }
      this.viewModel.resetView(this.duration);
    }
  }
};
</script>
