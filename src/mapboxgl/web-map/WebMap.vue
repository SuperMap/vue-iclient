<template>
  <div :id="target" class="sm-component-web-map" :style="[{'background': background}]">
    <slot></slot>
    <template v-for="(controlProps, controlName) in controlComponents">
      <component :is="controlName" :key="controlName" v-bind="controlProps"></component>
    </template>
    <sm-spin v-if="spinning" size="large" :tip="$t('webmap.loadingTip')" :spinning="spinning" />
  </div>
</template>

<script lang="ts">
import WebMapViewModel from './WebMapViewModel';
import mapEvent from '../_types/map-event';
import VmUpdater from '../../common/_mixin/VmUpdater';
import MapEvents from './_mixin/map-events';
import { Component, Prop, Mixins, Emit, Watch, Provide } from 'vue-property-decorator';
import { addListener, removeListener } from 'resize-detector';
import debounce from 'lodash/debounce';
import SmSpin from '../../common/spin/Spin.vue';

interface commonControlParam {
  show?: boolean;
  position?: string;
  background?: string;
  textColor?: string;
}

interface cardCommonParam extends commonControlParam {
  collapsed?: boolean;
  headerName?: string;
}

interface zoomParam extends commonControlParam {
  showZoomSlider?: boolean;
}

interface measureParam extends cardCommonParam {
  showUnitSelect?: boolean;
  distanceDefaultUnit?: string;
  areaDefaultUnit?: string;
}

interface legendParam extends cardCommonParam {
  layerNames: Array<string>;
  isShowTitle?: boolean;
  isShowField?: boolean;
  mode?: string;
}

interface queryParam extends cardCommonParam {
  maxFeatures?: number;
  layerStyle?: Object;
  iportalData?: Array<Object>;
  restData?: Array<Object>;
  restMap?: Array<Object>;
}

interface searchParam extends commonControlParam {
  maxFeatures?: number;
  layerNames?: Array<string>;
  onlineLocalSearch?: Object;
  iportalData?: Array<Object>;
  restData?: Array<Object>;
  restMap?: Array<Object>;
  addressMatch?: Array<string>;
}

interface identifyParam {
  show?: boolean;
  layers?: Array<Object>;
  fields?: Array<string>;
  layerStyle?: Array<Object>;
  clickAreaAround?: number;
}

interface layerManageParam {
  show?: boolean;
  layers?: Array<Object>;
}

interface controlProps {
  panControl?: commonControlParam;
  scaleControl?: commonControlParam;
  zoomControl?: zoomParam;
  miniMapControl?: cardCommonParam;
  layerListControl?: cardCommonParam;
  measureControl?: measureParam;
  legendControl?: legendParam;
  queryControl?: queryParam;
  searchControl?: searchParam;
  identifyControl?: identifyParam;
  layerManagerControl?: layerManageParam;
}

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
    'mapOptions.style',
    'mapOptions.crs',
    'mapOptions.minZoom',
    'mapOptions.maxZoom',
    'mapOptions.maxBounds',
    'mapOptions.renderWorldCopies',
    'mapOptions.bearing',
    'mapOptions.pitch',
    'mapOptions.rasterTileSize',
    'withCredentials',
    'proxy'
  ]
})
class SmWebMap extends Mixins(VmUpdater, MapEvents) {
  spinning = true;

  // eslint-disable-next-line
  map: mapboxglTypes.Map;
  viewModel: WebMapViewModel;
  $message: any;
  // data
  @Provide() __resizeHandler;

  @Prop() mapId: string | number;
  @Prop({ default: 'map' }) target: string;
  @Prop({ default: 'https://www.supermapol.com' }) serverUrl: string;
  @Prop() accessToken: string;
  @Prop() accessKey: string;
  @Prop() tiandituKey: string;
  @Prop({ default: false }) withCredentials: boolean;
  @Prop() excludePortalProxyUrl: boolean;
  @Prop() isSuperMapOnline: boolean;
  @Prop() proxy: boolean | string;
  @Prop({ default: true }) defaultLoading: boolean;
  @Prop({ default: false }) loading: boolean;
  @Prop() background: string;
  @Prop() iportalServiceProxyUrlPrefix: string;
  @Prop()
  mapOptions: any;
  @Prop({ default: true }) autoresize: boolean;
  @Prop({ default: false }) keepBounds: boolean;
  @Prop({
    default: () => {
      return { show: false, position: 'top-left' };
    }
  })
  panControl: commonControlParam;

  @Prop({
    default: () => {
      return { show: false, position: 'bottom-left' };
    }
  })
  scaleControl: commonControlParam;

  @Prop({
    default: () => {
      return { show: false, position: 'top-left' };
    }
  })
  zoomControl: zoomParam;

  @Prop({
    default: () => {
      return { show: false, position: 'bottom-right' };
    }
  })
  miniMapControl: cardCommonParam;

  @Prop({
    default: () => {
      return { show: false, position: 'top-right' };
    }
  })
  layerListControl: cardCommonParam;

  @Prop({
    default: () => {
      return {
        show: false,
        position: 'top-right',
        showUnitSelect: true,
        distanceDefaultUnit: 'kilometers',
        areaDefaultUnit: 'kilometers'
      };
    }
  })
  measureControl: measureParam;

  @Prop({
    default: () => {
      return {
        show: false,
        position: 'bottom-left',
        layerNames: [],
        isShowTitle: false,
        isShowField: false,
        mode: 'simple'
      };
    }
  })
  legendControl: legendParam;

  @Prop({
    default: () => {
      return {
        show: false,
        position: 'top-right'
      };
    }
  })
  queryControl: queryParam;

  @Prop({
    default: () => {
      return {
        show: false,
        position: 'top-right'
      };
    }
  })
  searchControl: searchParam;

  @Prop({
    default: () => {
      return {
        show: false,
        layers: [],
        fields: [],
        layerStyle: {},
        clickAreaAround: 5
      };
    }
  })
  identifyControl: identifyParam;

  @Prop({
    default: () => {
      return {
        show: false,
        layers: []
      };
    }
  })
  layerManagerControl: layerManageParam;

  @Watch('mapId')
  mapIdChanged() {
    if (this.defaultLoading) {
      this.spinning = true;
    }
  }

  @Watch('loading')
  loadingChanged(newVal) {
    this.spinning = newVal;
  }

  created() {
    if (!this.defaultLoading) {
      this.spinning = false;
    }
  }

  mounted() {
    this.initializeWebMap();
    this.registerEvents();
  }

  beforeDestroy() {
    this.destory();
  }

  destroyed() {
    mapEvent.$options.deleteMap(this.target);
    mapEvent.$options.deleteWebMap(this.target);
    this.viewModel.cleanWebMap();
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

  get controlComponents(): controlProps {
    const controls: controlProps = {};
    for (let key in this.$props) {
      if (key.includes('Control') && this.$props[key].show) {
        const controlName = key.replace('Control', '');
        const firstLetter = controlName[0];
        controls[`Sm${controlName.replace(firstLetter, firstLetter.toUpperCase())}`] = this.$props[key];
      }
    }
    return controls;
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
      proxy,
      mapOptions,
      iportalServiceProxyUrlPrefix
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
        isSuperMapOnline,
        proxy,
        iportalServiceProxyUrlPrefix
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
      this.viewModel.resize(this.keepBounds);
    }
  }

  registerEvents(): void {
    this.viewModel.on({
      addlayerssucceeded: e => {
        this.spinning = false;
        mapEvent.$options.setMap(this.target, e.map);
        this.viewModel && mapEvent.$options.setWebMap(this.target, this.viewModel);
        mapEvent.$emit('load-map', e.map, this.target);
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
         * @property {mapboxgl.Map} map - MapBoxGL Map 对象。
         */
        this.getLayerDatasourceFailed({ error: e.error, layer: e.layer, map: e.map });
        if (e.error === 'SAMPLE DATA is not supported') {
          this.$message.error(this.$t('webmap.sampleDataNotSupport'));
        } else {
          this.$message.error(this.$t('webmap.getLayerInfoFailed'));
        }
      },
      notsupportbaidumap: () => {
        this.$message.error(this.$t('webmap.baiduMapNotSupport'));
      },
      beforeremovemap: () => {
        mapEvent.$options.deleteMap(this.target);
        mapEvent.$options.deleteWebMap(this.target);
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
