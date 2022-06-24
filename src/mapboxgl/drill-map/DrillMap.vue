<template>
  <div class="sm-component-drill-map">
    <template v-if="mapProps.mapId">
      <sm-web-map v-bind="mapProps" :target="target" @load="load">
        <slot></slot>
      </sm-web-map>
      <sm-button v-if="!$scopedSlots.goBack" class="sm-component-drill-map__btn" type="primary" @click="goBack">{{
        $t('drillMap.goBack')
      }}</sm-button>
      <template v-else>
        <slot name="goBack" :go-back="goBack"></slot>
      </template>
    </template>
    <template v-else>
      <slot name="blank"></slot>
    </template>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Mixins, Watch, Emit } from 'vue-property-decorator';
import VmUpdater from 'vue-iclient/src/common/_mixin/VmUpdater';
import SmWebMap from 'vue-iclient/src/mapboxgl/web-map/WebMap.vue';
import SmButton from 'vue-iclient/src/common/button/Button.vue';
import DrillMapViewModel from './DrillMapViewModel';
import isEqual from 'lodash.isequal';

interface DrillMapParams {
  layerId: string;
  primaryField?: string;
  foreignField: string;
  serverUrl: string;
  mapId: string;
  accessToken?: string;
  accessKey?: string;
  tiandituKey?: string;
  withCredentials?: boolean;
  excludePortalProxyUrl?: boolean;
  isSuperMapOnline?: boolean;
  proxy?: boolean | string;
  iportalServiceProxyUrlPrefix?: string;
}

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

@Component({
  name: 'SmDrillMap',
  components: {
    SmWebMap,
    SmButton
  }
})
class SmDrillMap extends Mixins(VmUpdater) {
  viewModel: DrillMapViewModel;
  currentIndex = 0;
  mapInfo: any = null;

  @Prop({
    default: () => {
      return [];
    }
  })
  data: DrillMapParams[];

  // eslint-disable-next-line
  @Prop() drillAnimation: mapboxglTypes.FitBoundsOptions;

  @Prop({ default: 'map' }) target: string;
  @Prop() mapOptions: any;
  @Prop({ default: true }) defaultLoading: boolean;
  @Prop({ default: false }) loading: boolean;
  @Prop() background: string;
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

  get drillNums() {
    return this.data.length;
  }

  get mapProps() {
    const excludeProps = ['data', 'drillAnimation'];
    let mapProps = {};
    for (let key in this.$props) {
      if (!excludeProps.includes(key)) {
        mapProps[key] = this.$props[key];
      }
    }
    return Object.assign({}, mapProps, this.mapInfo || { mapId: '' });
  }

  get allMapInfo() {
    const excludeProps = ['primaryField', 'foreignField'];
    let mapInfos = this.data.map(item => {
      let mapInfo = {};
      for (let key in item) {
        if (!excludeProps.includes(key)) {
          mapInfo[key] = item[key];
        }
      }
      return mapInfo;
    });
    // @ts-ignore
    mapInfos = mapInfos.filter(item => item.mapId && item.serverUrl);
    return mapInfos;
  }

  @Watch('currentIndex')
  currentIndexChanged(newVal, oldVal) {
    this.viewModel.changeCurrentIndex(newVal, oldVal);
  }

  @Watch('data')
  dataChanged(newVal, oldVal) {
    if (!isEqual(newVal, oldVal)) {
      if (this.viewModel) {
        this.viewModel.setData(this.data);
      }
      if (this.currentIndex > newVal.length - 1) {
        this.currentIndex = 0;
      }
    }
  }

  @Watch('allMapInfo')
  allMapInfoChanged(newVal, oldVal) {
    if (!isEqual(newVal, oldVal)) {
      this.initMapInfo();
      this.currentIndex = 0;
    }
  }

  created() {
    this.viewModel = new DrillMapViewModel(this.data, this.drillAnimation);
    this.viewModel.on({
      drillmap: e => {
        this.changeCurrentIndex(e.index);
      }
    });
    this.initMapInfo();
  }

  initMapInfo() {
    if (this.data.length > 0) {
      const promise = this.viewModel.getMergeMapInfo();
      promise.then(mergeMapInfo => {
        this.mapInfo = { ...(this.data[0] || {}), mapId: mergeMapInfo };
        const layers = mergeMapInfo && mergeMapInfo.layers;
        const allLayers = layers.map(item => item.layerID);
        this.viewModel.setAllLayers(allLayers);
      });
    } else {
      this.mapInfo = {};
    }
  }

  @Emit()
  load(e): void {
    // @ts-ignore
    window.map = e.map;
    if (this.viewModel) {
      this.viewModel.setMap(e.map);
      this.viewModel.init();
    }
    return e;
  }

  goBack(): void {
    this.changeCurrentIndex();
  }

  changeCurrentIndex(num = -1): void {
    if (num < 0 && this.currentIndex > 0) {
      this.currentIndex += num;
    }
    if (num > 0 && this.currentIndex + 1 < this.drillNums) {
      this.currentIndex += num;
    }
  }
}
export default SmDrillMap;
</script>
