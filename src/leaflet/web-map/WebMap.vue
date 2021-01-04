<template>
  <div :id="target" class="sm-component-web-map">
    <slot v-if="ready"></slot>
    <sm-spin v-if="spinning" size="large" :tip="$t('webmap.loadingTip')" :spinning="spinning" />
  </div>
</template>

<script lang='ts'>
import WebMapViewModel from './WebMapViewModel';
import VmUpdater from '../../common/_mixin/VmUpdater';
import mapEvent from '../_types/map-event';
import { Component, Prop, Mixins, Emit, Watch, Provide } from 'vue-property-decorator';
import { addListener, removeListener } from 'resize-detector';
import debounce from 'lodash/debounce';
import MapEvents from './_mixin/map-events';
import SmSpin from '../../common/spin/Spin.vue';

@Component({
  name: 'SmWebMap',
  components: {
    SmSpin
  },
  viewModelProps: [
    'mapId',
    'serverUrl',
    'mapOptions.center',
    'mapOptions.zoom',
    'mapOptions.minZoom',
    'mapOptions.maxZoom',
    'mapOptions.maxBounds',
    'withCredentials'
  ]
})
class SmWebMap extends Mixins(VmUpdater, MapEvents) {
  spinning = true;

  // eslint-disable-next-line
  map: L.Map;
  viewModel: WebMapViewModel;
  // eslint-disable-next-line
  mapObject: L.Map;
  // data
  @Provide() __resizeHandler;
  @Provide() ready = false;

  @Prop() mapId: string | number;
  @Prop({ default: 'map' }) target: string;
  @Prop({ default: 'https://www.supermapol.com' }) serverUrl: string;
  @Prop() accessToken: string;
  @Prop() accessKey: string;
  @Prop() tiandituKey: string;
  @Prop({ default: false }) withCredentials: boolean;
  @Prop() excludePortalProxyUrl: boolean;
  @Prop() isSuperMapOnline: boolean;
  @Prop() mapOptions: any;
  @Prop({ default: true }) autoresize: boolean;

  @Watch('mapId')
  mapIdChanged() {
    this.spinning = true;
  }

  mounted() {
    this.initializeWebMap();
    this.registerEvents();
  }

  beforeDestroy() {
    this.destory();
    mapEvent.$options.deleteMap(this.target);
    mapEvent.$options.deleteWebMap(this.target);
  }

  /* emit */
  @Emit()
  load(value) {
    return value;
  }

  @Emit()
  getMapFailed(value) {
    return value;
  }

  @Emit()
  getLayerDatasourceFailed(value) {
    return value;
  }

  /* computed */
  get getMapTarget(): string {
    return this.target;
  }

  /* methods */
  initializeWebMap(): void {
    let {
      target,
      serverUrl,
      accessToken,
      accessKey,
      tiandituKey,
      withCredentials,
      excludePortalProxyUrl,
      isSuperMapOnline,
      mapOptions
    } = this.$props;
    this.viewModel = new WebMapViewModel(
      this.mapId,
      {
        target,
        serverUrl,
        accessToken,
        accessKey,
        tiandituKey,
        withCredentials,
        excludePortalProxyUrl,
        isSuperMapOnline
      },
      mapOptions
    );
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
      this.$nextTick(() => {
        this.viewModel.resize();
      });
    }
  }

  registerEvents(): void {
    this.viewModel.on({
      addlayerssucceeded: e => {
        this.spinning = false;
        mapEvent.$options.setMap(this.target, e.map);
        this.viewModel && mapEvent.$options.setWebMap(this.target, this.viewModel);
        mapEvent.$emit('load-map', e.map, this.target);
        this.map = e.map;
        this.mapObject = e.map;
        this.ready = true;
        this.$nextTick(() => {
          this.viewModel.resize();
        });

        // 绑定map event
        this.bindMapEvents();

        /**
         * @event load
         * @desc webmap 加载完成之后触发。
         * @property {L.Map} map - Leaflet Map 对象。
         */
        this.load({ map: e.map });
      },
      getmapinfofailed: e => {
        /**
         * @event getMapFailed
         * @desc 获取 WebMap 地图信息失败。
         * @property {Object} error - 失败原因。
         */
        this.getMapFailed({ error: e.error });
        this.$message.error(e.error.message);
        this.spinning = false;
      },
      getlayerdatasourcefailed: e => {
        /**
         * @event getLayerDatasourceFailed
         * @desc 获取图层数据失败。
         * @property {Object} error - 失败原因。
         * @property {Object} layer - 图层信息。
         * @property {L.Map} map - Leaflet Map 对象。
         */
        this.getLayerDatasourceFailed({ error: e.error, layer: e.layer, map: e.map });
        if (e.error === 'SAMPLE DATA is not supported') {
          this.$message.error(this.$t('webmap.sampleDataNotSupport'));
        } else {
          this.$message.error(this.$t('webmap.getLayerInfoFailed'));
        }
      },
      notsupportmvt: () => {
        this.$message.error('暂不支持加载矢量瓦片图层！');
        this.spinning = false;
      }
    });
  }

  destory(): void {
    if (this.autoresize) {
      // @ts-ignore
      removeListener(this.$el, this.__resizeHandler);
    }
  }
}

export default SmWebMap;
</script>
