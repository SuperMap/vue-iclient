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
    class="sm-component-tdtRoute"
  >
    <div class="sm-component-tdtRoute__panel" :style="getTextColorStyle">
      <div class="sm-component-tdtRoute__header">
        <div class="route-navbar">
          <div class="route-tabs">
            <div :class="['car-icon', { active: routeActive === 'car' }]" @click="routeActive = 'car'">
              <i class="sm-components-icon-car" />
            </div>
            <div :class="['bus-icon', { active: routeActive === 'bus' }]" @click="routeActive = 'bus'">
              <i class="sm-components-icon-bus" />
            </div>
          </div>
          <div class="clear-route" :style="secondaryTextColorStyle" @click="clearRoute">
            <i class="sm-components-icon-close" />
          </div>
        </div>
        <div class="route-panel">
          <div class="start-route">
            <div class="icon-wrapper">
              <div class="icon" />
            </div>
            <div class="content">
              <sm-input
                v-model="start"
                allowClear
                :placeholder="$t('tdtRoute.pleaseEnterStartPoint')"
                :title="$t('tdtRoute.pleaseEnterStartPoint')"
                :style="[headingTextColorStyle, getBackgroundStyle]"
                @keyup.13="searchClicked"
                @change="e => !e.target.value && clearStart()"
              />
            </div>
          </div>
          <div class="end-route">
            <div class="icon-wrapper">
              <div class="icon" />
            </div>
            <div class="content">
              <sm-input
                v-model="end"
                allowClear
                :placeholder="$t('tdtRoute.pleaseEnterEndPoint')"
                :title="$t('tdtRoute.pleaseEnterEndPoint')"
                :style="[headingTextColorStyle, getBackgroundStyle]"
                @keyup.13="searchClicked"
                @change="e => !e.target.value && clearEnd()"
              />
            </div>
          </div>
          <div class="switch-route" @click="switchRoute">
            <i class="sm-components-icon-change" />
          </div>
          <div class="search-btn">
            <sm-button type="primary" @click="searchClicked">
              {{ $t('tdtRoute.search') }}
            </sm-button>
          </div>
        </div>
      </div>
      <div class="sm-component-tdtRoute__content">
        <div v-if="!showRoutePlan && status" class="route-result">
          <div class="start-point">
            <div class="title">
              <i class="sm-components-icon-solid-question" />
              <span @click="resetStatus('toSetStart')">{{ $t('tdtRoute.startPoint') }}：{{ start }}</span>
            </div>
            <div v-if="status === 'toSetStart' && componentId" class="content">
              <component :is="componentId" v-bind="componentProps" v-on="componentListeners"></component>
            </div>
          </div>
          <div class="end-point">
            <div class="title">
              <i class="sm-components-icon-solid-question" />
              <span @click="resetStatus('toSetEnd')">{{ $t('tdtRoute.endPoint') }}：{{ end }}</span>
            </div>
            <div v-if="status === 'toSetEnd' && componentId" class="content">
              <component
                :is="componentId"
                v-bind="componentProps"
                :text-color="textColor"
                v-on="componentListeners"
              ></component>
            </div>
          </div>
        </div>
        <RoutePlan
          v-if="showRoutePlan"
          :route-plan="routePlan"
          :start="{ name: start }"
          :dest="{ name: end }"
          :spinning="spinning"
          :search-type="routeActive"
          :isError="isError"
          :text-color="textColor"
          @style-changed="styleChanged"
          @route-plan-clicked="routePlanClicked"
          @bus-info-clicked="busInfoClicked"
        />
      </div>
    </div>
  </sm-collapse-card>
</template>

<script>
import Theme from '../../../common/_mixin/Theme';
import Control from '../../_mixin/control';
import MapGetter from '../../_mixin/map-getter';
import Card from '../../../common/_mixin/Card';
import TdtRouteViewModel from './TdtRouteViewModel';
import RoutePlan from '../results/RoutePlan';
import PointsResult from '../results/PointsResult';
import StatisticsResult from '../results/StatisticsResult';
import NothingResult from '../results/NothingResult';
import SmButton from '../../../common/button/Button';
import SmInput from '../../../common/input/Input';

export default {
  name: 'SmTdtRoute',
  components: {
    RoutePlan,
    PointsResult,
    StatisticsResult,
    NothingResult,
    SmButton,
    SmInput
  },
  mixins: [MapGetter, Control, Theme, Card],
  props: {
    collapsed: {
      type: Boolean, // 是否折叠
      default: true
    },
    splitLine: {
      type: Boolean,
      default: false
    },
    iconClass: {
      type: String,
      default: 'sm-components-icon-road'
    },
    headerName: {
      type: String,
      default() {
        return this.$t('tdtRoute.title');
      }
    },
    data: {
      type: Object,
      default() {
        return {
          carUrl: 'https://api.tianditu.gov.cn/drive',
          busUrl: 'https://api.tianditu.gov.cn/transit',
          searchUrl: 'https://api.tianditu.gov.cn/search',
          tk: ''
        };
      }
    }
  },
  data() {
    return {
      routeActive: 'car',
      start: '',
      end: '',
      status: '', // toSetStart toSetEnd finished
      routePlan: null,
      spinning: false,
      showRoutePlan: false,
      searchResult: [],
      isError: false,
      componentId: null,
      componentProps: {},
      componentListeners: {}
    };
  },
  watch: {
    routeActive() {
      this.spinning = true;
      this.routePlan = null;
      this.viewModel && this.viewModel.setSearchType(this.routeActive);
      this.searchRoute();
    },
    data(newVal, oldVal) {
      this.spinning = true;
      // this.clearRoute();
      this.viewModel && this.viewModel.setData(this.data);
    },
    status(val) {
      if (val === 'toSetStart') {
        this.getResultDetail(this.start);
        return;
      }
      if (val === 'toSetEnd') {
        this.getResultDetail(this.end);
        return;
      }
      if (val === 'finished') {
        this.searchRoute();
      }
    }
  },
  beforeDestroy() {
    this.clearRoute();
  },
  created() {
    this.viewModel = new TdtRouteViewModel({
      type: this.routeActive,
      data: this.data
    });
  },
  methods: {
    switchRoute() {
      if (this.start || this.end) {
        [this.start, this.end] = [this.end, this.start];
      }
      if (this.startLnglat || this.endLnglat) {
        [this.startLnglat, this.endLnglat] = [this.endLnglat, this.startLnglat];
      }
    },
    searchClicked() {
      this.status = '';
      this.$nextTick(() => {
        if (this.start && this.end) {
          this.showRoutePlan = false;
          this.status = 'toSetStart';
          this.viewModel && this.viewModel.removed();
        }
      });
    },
    getResultDetail(keyWord, params) {
      let mapBound = (params ? params.mapBound : '') || this.viewModel._toBBoxString();
      this.viewModel
        .searchPoints(keyWord, params)
        .then(res => {
          if (!res) return;
          const { type, result } = res;
          let componentProps = {
            ...this.$props,
            data: result.data,
            prompt: result.prompt,
            keyWord,
            count: result.count,
            from: 'Route',
            pageSize: 7,
            mapBound
          };
          let componentListeners = {};
          switch (type) {
            case 'Point':
              this.componentId = 'PointsResult';
              componentProps.openPurePoiSearch = true;
              componentProps.specifyAdminSearch = params && !!params.specifyAdminCode;
              componentProps.resultBelongTo = this.status === 'toSetStart' ? 'start' : 'end';
              componentListeners['reset-start-point'] = this.resetStartPoint;
              componentListeners['reset-end-point'] = this.resetEndPoint;
              componentListeners['change-pagination'] = this.getResultDetail;
              componentListeners['set-highlight-icon'] = this.setHighlightIcon;
              break;
            case 'Statistics':
              this.componentId = 'StatisticsResult';
              componentProps.data = result.data.allAdmins;
              componentProps.priorityCitys = result.data.priorityCitys;
              componentListeners['search-points-result'] = this.getResultDetail;
              break;
            default:
              this.componentId = 'NothingResult';
              break;
          }
          this.componentProps = componentProps;
          this.componentListeners = componentListeners;
        })
        .catch(err => {
          console.log(err);
        });
    },
    searchRoute() {
      if (this.startLnglat && this.endLnglat) {
        this.viewModel &&
          this.viewModel.search(this.startLnglat, this.endLnglat).then(result => {
            this.spinning = false;
            this.showRoutePlan = true;
            this.routePlan = result || null;
            if (!result) {
              this.searchFailed();
            }
          });
      } else {
        this.spinning = false;
      }
    },
    resetStatus(status) {
      if (this.status !== 'status') {
        this.status = status;
      }
    },
    resetStartPoint(data) {
      if (data) {
        this.start = data.name;
        this.startLnglat = data.lonlat ? [+data.lonlat.split(' ')[0], +data.lonlat.split(' ')[1]] : [0, 0];
        this.componentId = null;
        this.status = 'toSetEnd';
      }
    },
    resetEndPoint(data) {
      if (data) {
        this.end = data.name;
        this.endLnglat = data.lonlat ? [+data.lonlat.split(' ')[0], +data.lonlat.split(' ')[1]] : [0, 0];
        this.componentId = null;
        this.status = 'finished';
      }
    },
    setHighlightIcon(hotPointID) {
      this.viewModel && this.viewModel.setHighlightIcon(hotPointID);
    },
    styleChanged(val) {
      this.spinning = true;
      this.routePlan = null;
      this.viewModel.setSearchStyle(val);
      this.searchRoute();
    },
    routePlanClicked(index, parentIndex) {
      this.viewModel && this.viewModel.setHighlightRoute(index, parentIndex);
    },
    busInfoClicked(index, show) {
      this.viewModel && this.viewModel.setLayerFeatures(index, show);
    },
    searchFailed() {
      this.isError = true;
      this.routePlan = null;
      this.viewModel && this.viewModel.removed();
    },
    clearRoute() {
      this.start = '';
      this.end = '';
      this.startLnglat = null;
      this.endLnglat = null;
      this.status = '';
      this.showRoutePlan = false;
      this.routePlan = null;
      this.viewModel && this.viewModel.removed();
    },
    clearStart() {
      this.start = '';
      this.startLnglat = null;
      this.status = '';
      this.showRoutePlan = false;
      this.routePlan = null;
    },
    clearEnd() {
      this.end = '';
      this.endLnglat = null;
      this.status = '';
      this.showRoutePlan = false;
      this.routePlan = null;
    }
  }
};
</script>
