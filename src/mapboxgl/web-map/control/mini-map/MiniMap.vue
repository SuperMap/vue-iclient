
<template>
  <sm-card
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    @content-show-state="handleMinimapResize"
  >
    <div id="miniMap" class="miniMap">
      <a-spin v-if="spinning" size="small" :tip="$t('webmap.loadingTip')" :spinning="spinning"/>
    </div>
  </sm-card>
</template>

<script>
import MiniMapViewModel from './MiniMapViewModel';
import Control from '../../../_mixin/control';
import MapGetter from '../../../_mixin/map-getter';
import Card from '../../../../common/_mixin/card';

export default {
  name: 'SmMiniMap',
  mixins: [MapGetter, Control, Card],
  props: {
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
  loaded() {
    this.spinning = true;
    this.miniMap && this.miniMap.remove();
    this.$el.classList.add('sm-component-minimap');
    this.viewModel = new MiniMapViewModel(this.$el.querySelector('#miniMap') || this.$el, this.map);
    this.viewModel.on('minimaploaded', e => {
      this.miniMap = e.miniMap;
      this.spinning = false;
    });
  },
  removed() {
    this.viewModel && this.viewModel.removeMap();
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
    }
  }
};
</script>
