<template>
  <div :id="target" class="sm-component-web-map">
    <slot></slot>
    <Pan v-if="panControl.show" :position="panControl.position"/>
    <Scale v-if="scaleControl.show" :position="scaleControl.position"/>
    <Zoom
      v-if="zoomControl.show"
      :show-zoom-slider="zoomControl.zoomWithSlider"
      :position="zoomControl.position"
    />
    <mini-map v-if="miniMapControl.show" v-bind="miniMapControl"></mini-map>
    <layer-list v-if="layerListControl.show" v-bind="layerListControl"></layer-list>
    <Measure v-if="measureControl.show" v-bind="measureControl"></Measure>
    <Legend v-if="legendControl.show" v-bind="legendControl"></Legend>
    <Query v-if="queryControl.show" v-bind="queryControl"></Query>
    <Search v-if="searchControl.show" v-bind="searchControl"></Search>
    <a-spin v-if="spinning" size="large" :tip="$t('webmap.loadingTip')" :spinning="spinning"/>
  </div>
</template>

<script lang='ts'>
import WebMapViewModel from './WebMapViewModel';
import mapEvent from '../_types/map-event';
import VmUpdater from '../../common/_mixin/vm-updater';
import Pan from './control/pan/Pan.vue';
import Scale from './control/scale/Scale.vue';
import Zoom from './control/zoom/Zoom.vue';
import MiniMap from './control/mini-map/MiniMap.vue';
import LayerList from './control/layer-list/LayerList.vue';
import Measure from './control/measure/Measure.vue';
import Legend from './control/legend/Legend.vue';
import Query from '../query/Query.vue';
import Search from '../search/Search.vue';
import { Component, Prop, Mixins, Emit, Watch } from 'vue-property-decorator';

/**
 * @module WebMap
 * @category Components
 * @desc web 地图组件。支持MapboxGL map，和对接 iPortal/Online 地图。目前支持地图坐标系包括：'EPSG:3857'，'EPSG:4326'，'EPSG:4490'，'EPSG:4214'，'EPSG:4610'。
 * @vue-prop {Object} [mapOptions] - {@link MapboxGL map options[https://docs.mapbox.com/mapbox-gl-js/api/#map]} 对象。
 * @vue-prop {String} [mapId] - iPortal|Online 地图 ID。当设置 `mapId` 时为加载iPortal/Online 地图，mapOptions中仅 `mapOptions.center` `mapOptions.zoom` `mapOptions.maxBounds` `mapOptions.minZoom` `mapOptions.maxZoom` `mapOptions.renderWorldCopies` `mapOptions.bearing` `mapOptions.pitch` 有效。
 * @vue-prop {String} [target='map'] - 地图容器 ID。
 * @vue-prop {String} [serverUrl='http://www.supermapol.com'] - iPortal/Online 服务器地址。当设置 `mapId` 时有效。
 * @vue-prop {String} [accessKey] - 用于访问 SuperMap iPortal、SuperMap Online 中受保护的服务。当设置 `mapId` 时有效。
 * @vue-prop {String} [accessToken] - SuperMap iServer 提供的一种基于 Token（令牌）的用户身份验证机制。当设置 `mapId` 时有效。
 * @vue-prop {String} [tiandituKey] - 用于访问天地图的服务。当设置 `mapId` 时有效。
 * @vue-prop {String} [withCredentials=false] - 请求是否携带 cookie。当设置 `mapId` 时有效。
 * @vue-prop {String} [excludePortalProxyUrl] - server 传递过来的 URL 是否带有代理。当设置 `mapId` 时有效。
 * @vue-prop {Object} [panControl] - 位移控件配置参数。
 * @vue-prop {Boolean} [panControl.show=false] - 是否显示位移控件。
 * @vue-prop {String} [panControl.position="top-left"] - 位移控件放置位置。
 * @vue-prop {Object} [scaleControl] - 比例尺控件配置参数。
 * @vue-prop {Boolean} [scaleControl.show=false] - 是否显示比例尺控件。
 * @vue-prop {String} [scaleControl.position="bottom-left"] - 比例尺控件放置位置。
 * @vue-prop {Object} [zoomControl] - 缩放控件配置参数。
 * @vue-prop {Boolean} [zoomControl.show=false] - 是否显示缩放控件。
 * @vue-prop {String} [zoomControl.position="top-left"] - 缩放控件放置位置。
 * @vue-prop {Boolean} [zoomControl.zoomWithSlider="false"] - 缩放控件是否含有滑动条。
 * @vue-computed {String} getMapTarget - 获取 Map 的 target。
 */
interface commonControlParam {
  show?: boolean;
  position?: string;
}

interface cardCommonParam extends commonControlParam {
  collapsed?: boolean;
  headerName?: string;
}

interface zoomParam extends commonControlParam {
  zoomWithSlider?: boolean;
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

@Component({
  name: 'SmWebMap',
  viewModelProps: ['mapId', 'serverUrl', 'mapOptions', 'withCredentials'],
  components: {
    Pan,
    Scale,
    Zoom,
    MiniMap,
    LayerList,
    Measure,
    Legend,
    Query,
    Search
  }
})
class SmWebMap extends Mixins(VmUpdater) {
  spinning = true;

  // eslint-disable-next-line
  map: mapboxglTypes.Map;
  viewModel: WebMapViewModel;

  @Prop() mapId: string;
  @Prop({ default: 'map' }) target: string;
  @Prop({ default: 'http://www.supermapol.com' }) serverUrl: string;
  @Prop() accessToken: string;
  @Prop() accessKey: string;
  @Prop() tiandituKey: string;
  @Prop({ default: false }) withCredentials: boolean;
  @Prop() excludePortalProxyUrl: boolean;
  @Prop() mapOptions: any;
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

  @Watch('mapId')
  mapIdChanged() {
    this.spinning = true;
  }

  mounted() {
    this.initializeWebMap();
    this.registerEvents();
  }

  beforeDestroy() {
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
    let { target, serverUrl, accessToken, accessKey, tiandituKey, withCredentials, excludePortalProxyUrl, mapOptions } = this.$props;
    this.viewModel = new WebMapViewModel(
      this.mapId,
      {
        target,
        serverUrl,
        accessToken,
        accessKey,
        tiandituKey,
        withCredentials,
        excludePortalProxyUrl
      },
      mapOptions
    );
  }

  resize() {
    if (this.viewModel && this.viewModel.resize) {
      this.viewModel.resize();
    }
  }

  registerEvents(): void {
    this.viewModel.on('addlayerssucceeded', e => {
      this.spinning = false;
      mapEvent.$options.setMap(this.target, e.map);
      this.viewModel && mapEvent.$options.setWebMap(this.target, this.viewModel);
      mapEvent.$emit('load-map', e.map, this.target);
      e.map.resize();
      /**
       * @event load
       * @desc webmap 加载完成之后触发。
       * @property {mapboxgl.Map} map - MapBoxGL Map 对象。
       */
      this.load({ map: e.map });
    });
    this.viewModel.on('getmapfailed', e => {
      /**
       * @event getMapFailed
       * @desc 获取 WebMap 地图信息失败。
       * @property {Object} error - 失败原因。
       */
      this.getMapFailed({ error: e.error });
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
    });
  }
}

export default SmWebMap;
</script>
