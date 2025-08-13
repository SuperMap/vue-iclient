<template>
  <sm-collapse-card
    v-show="isShow"
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :background="background"
    :textColor="textColor"
    :split-line="splitLine"
    class="sm-component-base-layer-switcher"
  >
    <div class="sm-component-base-layer-switcher__panel" :style="headingTextColorStyle">
      <div class="sm-component-base-layer-switcher__layers-wrap">
        <div class="sm-component-base-layer-switcher__content-holder">
          <div class="sm-component-base-layer-switcher__layers">
            <div
              v-for="(layer) in displayLayers"
              :key="layer.id"
              :class="['layer-item', { 'active-item': selectedId === layer.id }]"
              @click="changeBaseLayer(layer)"
            >
              <img :src="layer.thumbnail" />
              <div class="sm-component-base-layer-switcher__layer-name" :title="layer.title">
                {{ layer.title }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </sm-collapse-card>
</template>

<script>
import Control from 'vue-iclient/src/mapboxgl/_mixin/control';
import MapGetter from 'vue-iclient/src/mapboxgl/_mixin/map-getter';
import Card from 'vue-iclient/src/common/_mixin/Card';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import BaseLayerSwitcherViewModel from './BaseLayerSwitcherViewModel';
import cloneDeep from 'lodash.clonedeep';
import isEqual from 'lodash.isequal';
import defaultThumbnail from './assets/defaultThumbnail.png';

export default {
  name: 'SmBaseLayerSwitcher',
  mixins: [Control, MapGetter, Card, Theme],
  props: {
    iconClass: {
      type: String,
      default: 'sm-components-icon-dituqiehuan'
    },
    headerName: {
      type: String,
      default() {
        return this.$t('baseLayerSwitcher.title');
      }
    },
    layers: {
      type: Array,
      default() {
        return [];
      }
    },
    showOriginLayer: {
      type: Boolean,
      default: true
    },
    defaultLayer: {
      type: String
    }
  },
  data() {
    return {
      selectedId: this.defaultLayer,
      baseLayer: null
    };
  },
  computed: {
    displayLayers() {
      const layerList = [];
      if (this.showOriginLayer && this.baseLayer) {
        layerList.unshift({ ...this.baseLayer });
      }
      return layerList.concat(this.layers).map(item => {
        return {
          ...item,
          thumbnail: item.thumbnail || defaultThumbnail
        };
      });
    }
  },
  watch: {
    layers(next, prev) {
      if (isEqual(next, prev) || !this.selectedId) {
        return;
      }
      const isExist = next.some(layer => layer.id === this.selectedId);
      if (!isExist) {
        this.changeBaseLayer({ ...this.baseLayer });
      }
    }
  },
  created() {
    this.onBaseLayerChanged = this.onBaseLayerChanged.bind(this);
    this.viewModel = new BaseLayerSwitcherViewModel();
    this.viewModel.on('baselayerchanged', this.onBaseLayerChanged);
  },
  loaded() {
    if (this.selectedId) {
      const matchLayer = this.layers.find(layer => layer.id === this.selectedId);
      matchLayer && this.changeBaseLayer(matchLayer);
    }
  },
  methods: {
    changeBaseLayer(layer) {
      this.viewModel.changeBaseLayer(layer);
      this.selectedId = layer.id;
    },
    onBaseLayerChanged(baseLayer) {
      this.baseLayer = cloneDeep(baseLayer);
      if (this.showOriginLayer && !this.selectedId) {
        this.selectedId = baseLayer.id;
      }
    }
  },
  beforeDestory() {
    this.viewModel.off('baselayerchanged', this.onBaseLayerChanged);
  }
};
</script>
