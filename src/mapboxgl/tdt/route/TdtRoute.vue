<template>
  <sm-card
    v-show="isShow"
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName || $t('measure.mapMeasure')"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :background="background"
    :textColor="textColor"
    class="sm-component-tdtRoute"
  >
    <div class="sm-component-tdtRoute__panel" :style="[getBackgroundStyle, getTextColorStyle]">
      <div class="sm-component-tdtRoute__header">
        <div class="route-navbar">
          <div>
            <div
              :class="['car-icon', { 'active': routeActive === 'car' }]"
              @click="routeActive = 'car'"
            >
              <i></i>
            </div>
            <div
              :class="['bus-icon', { 'active': routeActive === 'bus' }]"
              @click="routeActive = 'bus'"
            >
              <i></i>
            </div>
          </div>
          <div
            class="clear-route"
            :style="[getTextColorStyle]"
            @click="clearRoute"
          >{{ $t('tdtRoute.clearRoute') }}</div>
        </div>
        <div class="route-panel">
          <div class="start-route">
            <div class="icon-wrapper">
              <div class="icon"></div>
            </div>
            <div class="content">
              <a-input
                v-model="start"
                :placeholder="$t('tdtRoute.pleaseEnterStartPoint')"
                :style="[getBackgroundStyle, getTextColorStyle]"
                @keyup.13="searchClicked"
              >
                <a-icon
                  slot="suffix"
                  type="close-circle"
                  :style="[getTextColorStyle]"
                  @click="clearStart"
                />
              </a-input>
            </div>
          </div>
          <div class="end-route">
            <div class="icon-wrapper">
              <div class="icon"></div>
            </div>
            <div class="content">
              <a-input
                v-model="end"
                :placeholder="$t('tdtRoute.pleaseEnterEndPoint')"
                :style="[getBackgroundStyle, getTextColorStyle]"
                @keyup.13="searchClicked"
              >
                <a-icon
                  slot="suffix"
                  type="close-circle"
                  :style="[getTextColorStyle]"
                  @click="clearEnd"
                />
              </a-input>
            </div>
          </div>
          <div class="switch-route" @click="switchRoute">
            <a-icon type="swap" />
          </div>
        </div>
        <div class="search-btn">
          <a-button
            type="primary"
            :style="[getBackgroundStyle, getTextColorStyle]"
            @click="searchClicked"
          >{{ $t('tdtRoute.search') }}</a-button>
        </div>
      </div>
      <div class="sm-component-tdtRoute__content" :style="[getBackgroundStyle, getTextColorStyle]">
        <div v-if="!showRoutePlan && status" class="route-result">
          <div class="start-point">
            <div class="title">
              <a-icon type="question-circle" theme="filled" />
              <span @click="resetStatus('toSetStart')">{{ $t('tdtRoute.startPoint') }}：{{ start }}</span>
            </div>
            <div v-if="status === 'toSetStart' && componentId" class="content">
              <component :is="componentId" v-bind="componentProps" v-on="componentListeners"></component>
            </div>
          </div>
          <div class="end-point">
            <div class="title">
              <a-icon type="question-circle" theme="filled" />
              <span @click="resetStatus('toSetEnd')">{{ $t('tdtRoute.endPoint') }}：{{ end }}</span>
            </div>
            <div v-if="status === 'toSetEnd' && componentId" class="content">
              <component :is="componentId" v-bind="componentProps" v-on="componentListeners"></component>
            </div>
          </div>
        </div>
        <RoutePlan
          v-if="showRoutePlan"
          :route-plan="routePlan"
          :start="{name: start}"
          :dest="{name: end}"
          :spinning="spinning"
          :search-type="routeActive"
          :isError="isError"
          :themeStyle="[getBackgroundStyle, getTextColorStyle]"
          @style-changed="styleChanged"
          @route-plan-clicked="routePlanClicked"
          @bus-info-clicked="busInfoClicked"
        />
      </div>
    </div>
  </sm-card>
</template>

<script>
import Theme from '../../../common/_mixin/theme';
import Control from '../../_mixin/control';
import MapGetter from '../../_mixin/map-getter';
import Card from '../../../common/_mixin/card';
import TdtRouteViewModel from './TdtRouteViewModel';
import RoutePlan from '../results/RoutePlan';
import PointsResult from '../results/PointsResult';
import StatisticsResult from '../results/StatisticsResult';
import NothingResult from '../results/NothingResult';
import isEqual from 'lodash.isequal';

export default {
  name: 'SmTdtRoute',
  components: {
    RoutePlan,
    PointsResult,
    StatisticsResult,
    NothingResult
  },
  mixins: [MapGetter, Control, Theme, Card],
  props: {
    iconClass: {
      type: String,
      default: 'sm-components-icons-preview'
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
          tk: '1d109683f4d84198e37a38c442d68311'
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
      if (!isEqual(newVal, oldVal)) {
        this.spinning = true;
        this.routePlan = null;
        this.viewModel && this.viewModel.setData(this.data);
        this.clearRoute();
      }
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
    },
    textColorsData: {
      handler() {
        this.changeSearchInputStyle();
      }
    }
  },
  beforeDestroy() {
    this.clearRoute();
  },
  loaded() {
    this.viewModel = new TdtRouteViewModel({
      type: this.routeActive,
      map: this.map,
      data: this.data
    });
  },
  mounted() {
    this.changeSearchInputStyle();
  },
  methods: {
    changeSearchInputStyle() {
      const serachInput = this.$el.querySelectorAll('.ant-input');
      serachInput.forEach(item => {
        item.style.color = this.getTextColor;
      });
    },
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
          this.viewModel && this.viewModel.clear();
        }
      });
    },
    getResultDetail(keyWord, params) {
      this.viewModel
        .searchPoints(keyWord, params)
        .then(res => {
          if (!res) return;
          const { type, result } = res;
          let componentProps = {
            data: result.data,
            prompt: result.prompt,
            keyWord,
            count: result.count,
            from: 'Route',
            pageSize: 4
          };
          let componentListeners = {};
          switch (type) {
            case 'Point':
              this.componentId = 'PointsResult';
              componentProps.openPurePoiSearch = true;
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
      this.viewModel && this.viewModel.clear();
    },
    clearRoute() {
      this.start = '';
      this.end = '';
      this.startLnglat = null;
      this.endLnglat = null;
      this.status = '';
      this.showRoutePlan = false;
      this.routePlan = null;
      this.viewModel && this.viewModel.clear();
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
