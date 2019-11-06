<template>
  <div :id="target" class="sm-component-web-map">
    <slot></slot>
  </div>
</template>

<script lang='ts'>
import WebMapViewModel from './WebMapViewModel';
import VmUpdater from '../../common/_mixin/vm-updater';
import mapEvent from '../_types/map-event';
import { Component, Prop, Mixins, Emit, Watch, Provide } from 'vue-property-decorator';
// import { addListener, removeListener } from 'resize-detector';
// import debounce from 'lodash/debounce';

@Component({
  name: 'SmWebMap',
  viewModelProps: [
    'mapId',
    'serverUrl',
    'mapOptions.center',
    'mapOptions.zoom',
    'mapOptions.minZoom',
    'mapOptions.maxZoom',
    'mapOptions.maxBounds',
    'mapOptions.renderWorldCopies',
    'mapOptions.bearing',
    'mapOptions.pitch',
    'withCredentials'
  ]
})
class SmWebMap extends Mixins(VmUpdater) {
  spinning = true;

  // eslint-disable-next-line
  map: L.Map;
  viewModel: WebMapViewModel;
  // data
  @Provide() __resizeHandler;

  @Prop() mapId: string;
  @Prop({ default: 'map' }) target: string;
  @Prop({ default: 'http://www.supermapol.com' }) serverUrl: string;
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
    // if (this.autoresize) {
    //   this.__resizeHandler = debounce(
    //     () => {
    //       this.resize();
    //     },
    //     100,
    //     { leading: true }
    //   );
    //   // @ts-ignore
    //   addListener(this.$el, this.__resizeHandler);
    // }
  }

  // TODO resize
  // resize() {
  //   if (this.viewModel && this.viewModel.resize) {
  //     this.viewModel.resize();
  //   }
  // }

  registerEvents(): void {
    this.viewModel.on('addlayerssucceeded', e => {
      this.spinning = false;
      mapEvent.$options.setMap(this.target, e.map);
      this.viewModel && mapEvent.$options.setWebMap(this.target, this.viewModel);
      mapEvent.$emit('load-map', e.map, this.target);
      e.map.resize();
      this.map = e.map;

      // 绑定map event TODO
      // this.bindMapEvents();

      /**
       * @event load
       * @desc webmap 加载完成之后触发。
       * @property {mapboxgl.Map} map - MapBoxGL Map 对象。
       */
      this.load({ map: e.map });
    });
    this.viewModel.on('getmapinfofailed', e => {
      /**
       * @event getMapFailed
       * @desc 获取 WebMap 地图信息失败。
       * @property {Object} error - 失败原因。
       */
      this.getMapFailed({ error: e.error });
      this.$message.error(e.error.message);
      this.spinning = false;
    });
    this.viewModel.on('getlayerdatasourcefailed', e => {
      /**
       * @event getLayerDatasourceFailed
       * @desc 获取图层数据失败。
       * @property {Object} error - 失败原因。
       * @property {Object} layer - 图层信息。
       * @property {mapboxgl.Map} map - MapBoxGL Map 对象。
       */
      this.getLayerDatasourceFailed({ error: e.error, layer: e.layer, map: e.map });
      this.$message.error(this.$t('webmap.getLayerInfoFailed'));
    });
  }

  destory(): void {
    // if (this.autoresize) {
    //   // @ts-ignore
    //   removeListener(this.$el, this.__resizeHandler);
    // }
  }
}

export default SmWebMap;
</script>
