<template>
  <div :id="target" class="sm-component-ncp-map">
    <slot></slot>
    <sm-spin v-if="spinning" size="large" :tip="$t('webmap.loadingTip')" :spinning="spinning" />
  </div>
</template>

<script lang="ts">
import NcpMapViewModel, { dataOptions, mapOptions } from './NcpMapViewModel';
import mapEvent from 'vue-iclient-core/types/map-event';
import MapEvents from 'vue-iclient/src/mapboxgl/web-map/_mixin/map-events';
import VmUpdater from 'vue-iclient/src/common/_mixin/VmUpdater';
import { Component, Prop, Mixins, Emit, Provide } from 'vue-property-decorator';
import { addListener, removeListener } from 'resize-detector';
import debounce from 'lodash.debounce';
import SmSpin from 'vue-iclient/src/common/spin/Spin.vue';
import Message from 'vue-iclient/src/common/message/Message.js';

@Component({
  name: 'SmNcpMap',
  components: {
    SmSpin
  },
  viewModelProps: [
    'mapOptions.center',
    'mapOptions.zoom',
    // 'mapOptions.style',
    'mapOptions.maxBounds',
    'mapOptions.renderWorldCopies',
    'mapOptions.bearing',
    'mapOptions.pitch',
    'dataOptions.url',
    'dataOptions.themeUrl',
    'dataOptions.name',
    'dataOptions.proxyUrl'
  ]
})
class SmNcpMap extends Mixins(VmUpdater, MapEvents) {
  spinning = true;
  autoresize = true;
  // eslint-disable-next-line
  map: mapboxglTypes.Map;
  viewModel: NcpMapViewModel;
  // data
  @Provide() __resizeHandler;

  @Prop({ default: 'map' }) target: string;
  @Prop() mapOptions: mapOptions;
  @Prop() dataOptions: dataOptions;
  @Prop({ default: false }) keepBounds: boolean;

  mounted() {
    this.$nextTick(() => {
      this.initializeWebMap();
      this.registerEvents();
    });
  }

  beforeDestroy() {
    this.destory();
    mapEvent.deleteMap(this.target);
  }

  /* emit */
  @Emit()
  load(value) {
    return value;
  }

  @Emit()
  getLayerFailed(value) {
    return value;
  }

  @Emit()
  getThemeFailed(value) {
    return value;
  }

  /* computed */
  get getMapTarget(): string {
    return this.target;
  }

  /* methods */
  initializeWebMap(): void {
    this.viewModel = new NcpMapViewModel(this.target, this.dataOptions, this.mapOptions);
    if (this.autoresize) {
      this.__resizeHandler = debounce(
        () => {
          this.resize();
        },
        100,
        { leading: true }
      );
      // @ts-ignore
      addListener(this.$el, this.__resizeHandler);
    }
  }

  resize() {
    if (this.viewModel && this.viewModel.resize) {
      this.viewModel.resize(this.keepBounds);
    }
  }

  registerEvents(): void {
    this.viewModel.on('addlayerssucceeded', e => {
      this.spinning = false;
      mapEvent.setMap(this.target, e.map, this.viewModel);
      e.map.resize();
      this.map = e.map;
      // 绑定map event
      this.bindMapEvents();
      /**
       * @event load
       * @desc webmap 加载完成之后触发。
       * @property {mapboxgl.Map} map - MapBoxGL Map 对象。
       */
      this.load({ map: e.map });
    });
    this.viewModel.on('getlayerinfofailed', e => {
      /**
       * @event getLayerFailed
       * @desc 获取 Geojson 图层信息失败。
       * @property {Object} error - 失败原因。
       */
      this.getLayerFailed({ error: e.error });
      // @ts-ignore
      Message.error(this.$t('webmap.getLayerInfoFailed'));
      this.spinning = false;
    });
    this.viewModel.on('getthmeminfofailed', e => {
      /**
       * @event getThemeFailed
       * @desc 获取样式信息失败。
       * @property {Object} error - 失败原因。
       */
      this.getThemeFailed({ error: e.error });
      // @ts-ignore
      Message.warning(this.$t('webmap.getLayerInfoFailed'));
      this.spinning = false;
    });
  }

  destory(): void {
    if (this.autoresize) {
      // @ts-ignore
      removeListener(this.$el, this.__resizeHandler);
    }
  }
}

export default SmNcpMap;
</script>
