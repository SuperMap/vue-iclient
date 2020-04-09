
<template>
  <sm-card
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :background="background"
    :textColor="textColor"
    class="sm-component-minimap"
    @content-show-state="handleMinimapResize"
  >
    <div id="miniMap" class="miniMap">
      <a-spin v-if="spinning" size="small" :tip="$t('info.loading')" :spinning="spinning" />
    </div>
  </sm-card>
</template>

<script>
import Theme from '../../../../common/_mixin/theme';
import MiniMapViewModel from './MiniMapViewModel';
import Control from '../../../_mixin/control';
import MapGetter from '../../../_mixin/map-getter';
import Card from '../../../../common/_mixin/card';

export default {
  name: 'SmMiniMap',
  mixins: [MapGetter, Control, Card, Theme],
  props: {
    collapsed: {
      type: Boolean, // 是否折叠
      default: true
    },
    iconClass: {
      type: String,
      default: 'sm-components-icons-return'
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
