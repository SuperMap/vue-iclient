
<template>
  <sm-collapse-card
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :background="background"
    :textColor="textColor"
    :split-line="splitLine"
    class="sm-component-minimap"
    @content-show-state="handleMinimapResize"
  >
    <div id="miniMap" class="miniMap">
      <sm-spin v-if="spinning" size="small" :tip="$t('info.loading')" :spinning="spinning" />
    </div>
  </sm-collapse-card>
</template>

<script>
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import MiniMapViewModel from 'vue-iclient-core/controllers/mapboxgl/MiniMapViewModel';
import Control from 'vue-iclient/src/mapboxgl/_mixin/control';
import MapGetter from 'vue-iclient/src/common/_mixin/map-getter';
import Card from 'vue-iclient/src/common/_mixin/Card';
import SmSpin from 'vue-iclient/src/common/spin/Spin.vue';

export default {
  name: 'SmMiniMap',
  components: {
    SmSpin
  },
  mixins: [MapGetter, Control, Card, Theme],
  props: {
    iconClass: {
      type: String,
      default: 'sm-components-icon-arrow-left'
    },
    autoRotate: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      spinning: true
    };
  },
  created() {
    this.miniMap && this.miniMap.remove();
    this.viewModel = new MiniMapViewModel();
    this.viewModel.on('minimaploaded', this.minimapLoadedFn);
  },
  beforeDestory() {
    this.viewModel.off('minimaploaded', this.minimapLoadedFn);
  },
  loaded() {
    this.viewModel && (this.viewModel.setContainer(this.$el.querySelector('#miniMap') || this.$el));
  },
  methods: {
    handleMinimapResize(state) {
      this.$nextTick(() => {
        state && this.resize();
      });
    },
    resize() {
      if (this.viewModel && this.viewModel.resize) {
        this.viewModel.resize();
      }
    },
    minimapLoadedFn(e) {
      this.miniMap = e.miniMap;
      this.spinning = false;
    }
  }
};
</script>
