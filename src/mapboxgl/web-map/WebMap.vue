<template>
  <div :id="target" class="sm-widget-web-map">
    <slot></slot>
    <Pan v-if="panControl.show" :position="panControl.position"/>
    <Scale v-if="scaleControl.show" :position="scaleControl.position"/>
    <Zoom
      v-if="zoomControl.show"
      :show-zoom-slider="zoomControl.zoomWithSlider"
      :position="zoomControl.position"
    />
  </div>
</template>

<script>
import WebMapViewModel from './WebMapViewModel';
import mapEvent from '../_types/map-event';
import VmUpdater from '../../common/_mixin/vm-updater';
import Pan from './control/pan/Pan';
import Scale from './control/scale/Scale';
import Zoom from './control/zoom/Zoom';
/**
 * @module WebMap
 * @category Components
 * @desc WebMap 微件。对接 iPortal/Online 地图类。目前支持地图坐标系包括：'EPSG:3857'，'EPSG:4326'，'EPSG:4490'，'EPSG:4214'，'EPSG:4610'。
 * @vue-prop {String} mapId - iPortal|Online 地图 ID。
 * @vue-prop {String} [target='map'] - 地图容器 ID。
 * @vue-prop {String} [serverUrl='http://www.supermapol.com'] - WebMap 地图地址。
 * @vue-prop {String} [accessKey] - SuperMap iServer 提供的一种基于 Token（令牌）的用户身份验证机制。
 * @vue-prop {String} [accessToken] -Key 用于访问 iPortal 中受保护的服务。
 * @vue-prop {String} [withCredentials=false] - 请求是否携带 cookie。
 * @vue-prop {String} [excludePortalProxyUrl] - server 传递过来的 URL 是否带有代理。
 * @vue-prop {Object} [mapOptions] - 地图可选参数。
 * @vue-prop {Array} [mapOptions.center] - 地图中心点。
 * @vue-prop {Number} [mapOptions.zoom] - 地图缩放级别。
 * @vue-prop {Array} [mapOptions.maxBounds] - 地图最大范围。
 * @vue-prop {Number} [mapOptions.minZoom] - 地图最小级别。
 * @vue-prop {Number} [mapOptions.maxZoom] - 地图最大级别。
 * @vue-prop {Boolean} [mapOptions.isWorldCopy] - 地图是否平铺。
 * @vue-prop {Number} [mapOptions.bearing=0] - 地图的初始方位。
 * @vue-prop {Number} [mapOptions.pitch=0] - 地图的初始俯仰。
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
export default {
  name: 'SmWebMap',
  viewModelProps: ['mapId', 'serverUrl', 'mapOptions'],
  components: {
    Pan,
    Scale,
    Zoom
  },
  mixins: [VmUpdater],
  props: {
    mapId: {
      type: String,
      required: true
    },
    target: {
      type: String,
      default: 'map'
    },
    serverUrl: {
      type: String,
      default: 'http://www.supermapol.com'
    },
    accessToken: {
      type: String
    },
    accessKey: {
      type: String
    },
    withCredentials: {
      type: Boolean,
      default: false
    },
    excludePortalProxyUrl: {
      type: Boolean
    },
    mapOptions: {
      type: Object,
      default() {
        return {};
      }
    },
    panControl: {
      type: Object,
      default() {
        return {
          show: false,
          position: 'top-left'
        };
      }
    },
    scaleControl: {
      type: Object,
      default() {
        return {
          show: false,
          position: 'bottom-right'
        };
      }
    },
    zoomControl: {
      type: Object,
      default() {
        return {
          show: false,
          position: 'top-left',
          zoomWithSlider: false
        };
      }
    }
  },
  computed: {
    getMapTarget() {
      return this.target;
    }
  },
  created() {
    if (!mapEvent.firstMapTarget) {
      mapEvent.firstMapTarget = this.target;
    }
  },
  mounted() {
    this.initializeWebMap();
    this.registerEvents();
  },
  methods: {
    initializeWebMap() {
      let { target, serverUrl, accessToken, accessKey, withCredentials, excludePortalProxyUrl } = this.$props;
      this.viewModel = new WebMapViewModel(this.mapId, {
        target,
        serverUrl,
        accessToken,
        accessKey,
        withCredentials,
        excludePortalProxyUrl
      });
    },
    registerEvents() {
      this.viewModel.on('addlayerssucceeded', e => {
        mapEvent.$options.setMap(this.target, e.map);
        this.viewModel && mapEvent.$options.setWebMap(this.target, this.viewModel);
        mapEvent.$emit(`initMap-${this.target}`, e.map, this.viewModel);
        /**
         * @event load
         * @desc webmap 加载完成之后触发。
         * @property {mapboxgl.Map} map - MapBoxGL Map 对象。
         */
        this.$emit('load', { map: e.map });
      });
      this.viewModel.on('getmapfailed', e => {
        /**
         * @event getMapFailed
         * @desc 获取 WebMap 地图信息失败。
         * @property {Object} error - 失败原因。
         */
        this.$emit('get-map-failed', { error: e.error });
      });
      this.viewModel.on('getlayerdatasourcefailed', e => {
        /**
         * @event getLayerDatasourceFailed
         * @desc 获取图层数据失败。
         * @property {Object} error - 失败原因。
         * @property {Object} layer - 图层信息。
         * @property {mapboxgl.Map} map - MapBoxGL Map 对象。
         */
        this.$emit('get-layer-datasource-failed', { error: e.error, layer: e.layer, map: e.map });
      });
    }
  }
};
</script>
