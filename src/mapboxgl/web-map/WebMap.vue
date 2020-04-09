<template>
  <div :id="target" class="sm-component-web-map">
    <slot></slot>
    <template v-for="(controlProps, controlName) in controlComponents">
      <component
        :is="controlName"
        :key="controlName"
        v-bind="controlProps"
      ></component>
    </template>
    <a-spin v-if="spinning" size="large" :tip="$t('webmap.loadingTip')" :spinning="spinning" />
  </div>
</template>

<script lang="ts">
import WebMapViewModel from './WebMapViewModel';
import mapEvent from '../_types/map-event';
import VmUpdater from '../../common/_mixin/vm-updater';
import MapEvents from './_mixin/map-events';
import { Component, Prop, Mixins, Emit, Watch, Provide } from 'vue-property-decorator';
import { addListener, removeListener } from 'resize-detector';
import debounce from 'lodash/debounce';

/**
 * @module WebMap
 * @category Components
 * @desc web 地图组件。支持MapboxGL map，和对接 iPortal/Online 地图。目前支持地图坐标系包括：'EPSG:3857'，'EPSG:4326'，'EPSG:4490'，'EPSG:4214'，'EPSG:4610'。
 * @vue-prop {Object} [mapOptions] - {@link MapboxGL map options[https://docs.mapbox.com/mapbox-gl-js/api/#map]} 对象。
 * @vue-prop {String} [mapId] - SuperMap iPortal|Online 地图 ID。当设置 `mapId` 时为加载iPortal/Online 地图，mapOptions中仅 `mapOptions.center` `mapOptions.zoom` `mapOptions.maxBounds` `mapOptions.minZoom` `mapOptions.maxZoom` `mapOptions.renderWorldCopies` `mapOptions.bearing` `mapOptions.pitch` 有效。
 * @vue-prop {String} [target='map'] - 地图容器 ID。
 * @vue-prop {String} [serverUrl='https://www.supermapol.com'] - iPortal/Online 服务器地址。当设置 `mapId` 时有效。
 * @vue-prop {String} [accessKey] - 用于访问 SuperMap iPortal、SuperMap Online 中受保护的服务。当设置 `mapId` 时有效。
 * @vue-prop {String} [accessToken] - SuperMap iServer 提供的一种基于 Token（令牌）的用户身份验证机制。当设置 `mapId` 时有效。
 * @vue-prop {String} [tiandituKey] - 用于访问天地图的服务。当设置 `mapId` 时有效。
 * @vue-prop {String} [withCredentials=false] - 请求是否携带 cookie。当设置 `mapId` 时有效。
 * @vue-prop {String} [excludePortalProxyUrl] - server 传递过来的 URL 是否带有代理。当设置 `mapId` 时有效。
 * @vue-prop {Boolean} [autoresize = true] - 用来指定 webmap 实例在组件根元素尺寸变化时是否需要自动进行重绘,需要设置webmap组件样式为width:100%, height:100%。
 * @vue-prop {Object} [panControl] - 位移组件配置参数。
 * @vue-prop {Boolean} [panControl.show=false] - 是否显示位移组件。
 * @vue-prop {String} [panControl.position="top-left"] - 位移组件放置位置。
 * @vue-prop {Object} [scaleControl] - 比例尺组件配置参数。
 * @vue-prop {Boolean} [scaleControl.show=false] - 是否显示比例尺组件。
 * @vue-prop {String} [scaleControl.position="bottom-left"] - 比例尺组件放置位置。
 * @vue-prop {Object} [zoomControl] - 缩放组件配置参数。
 * @vue-prop {Boolean} [zoomControl.show=false] - 是否显示缩放组件。
 * @vue-prop {String} [zoomControl.position="top-left"] - 缩放组件放置位置。
 * @vue-prop {Boolean} [zoomControl.showZoomSlider="false"] - 缩放组件是否含有滑动条。
 * @vue-prop {Object} [miniMapControl] - 鹰眼组件配置参数。
 * @vue-prop {Boolean} [miniMapControl.show=false] - 是否显示鹰眼组件。
 * @vue-prop {String} [miniMapControl.position="bottom-right"] - 鹰眼组件放置位置。
 * @vue-prop {Object} [layerListControl] - 图层列表组件配置参数。
 * @vue-prop {Boolean} [layerListControl.show=false] - 是否显示图层列表组件。
 * @vue-prop {String} [layerListControl.position="top-right"] - 图层列表组件放置位置。
 * @vue-prop {Object} [measureControl] - 量算组件配置参数。
 * @vue-prop {Boolean} [measureControl.show=false] - 是否显示量算组件。
 * @vue-prop {String} [measureControl.position="top-right"] -  量算组件放置位置。
 * @vue-prop {String} [measureControl.distanceDefaultUnit="kilometers"] -  量算距离的默认单位。
 * @vue-prop {String} [measureControl.areaDefaultUnit="kilometers"] -  量算面积的默认单位。
 * @vue-prop {Object} [legendControl] - 图例组件配置参数。
 * @vue-prop {Boolean} [legendControl.show=false] - 是否显示图例组件。
 * @vue-prop {String} [legendControl.position="bottom-left"] -  图例组件放置位置。
 * @vue-prop {String} [legendControl.layerNames] -  显示图例组件的图层。
 * @vue-prop {String} [legendControl.isShowTitle="false"] -  图例组件是否显示图层名称。
 * @vue-prop {String} [legendControl.isShowField="false"] -  图例组件是否显示专题字段。
 * @vue-prop {String} [legendControl.mode="simple"] -  图例组件面板样式，支持"simple"(透明模式)/"panel"(面板模式)两种模式，默认为simple。
 * @vue-computed {String} getMapTarget - 获取 Map 的 target。
 */
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
    'withCredentials',
    'proxy'
  ]
})
class SmWebMap extends Mixins(VmUpdater, MapEvents) {
  spinning = true;

  // eslint-disable-next-line
  map: mapboxglTypes.Map;
  viewModel: WebMapViewModel;
  // data
  @Provide() __resizeHandler;

  @Prop() mapId: string;
  @Prop({ default: 'map' }) target: string;
  @Prop({ default: 'https://www.supermapol.com' }) serverUrl: string;
  @Prop() accessToken: string;
  @Prop() accessKey: string;
  @Prop() tiandituKey: string;
  @Prop({ default: false }) withCredentials: boolean;
  @Prop() excludePortalProxyUrl: boolean;
  @Prop() isSuperMapOnline: boolean;
  @Prop() proxy: boolean | string;
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
    this.spinning = true;
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
        isSuperMapOnline,
        proxy
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
