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
    class="sm-component-query"
  >
    <div class="sm-component-query__body" :style="getTextColorStyle">
      <div class="sm-component-query__choose-panel clearfix">
        <div
          :class="{ 'sm-component-query__job-button': true, 'is-active': activeTab === 'job', disabled: isQuery }"
          :title="$t('query.queryJob')"
          @click="activeTab = 'job'"
        >
          {{ $t('query.queryJob') }}
        </div>
        <div
          :class="{ 'sm-component-query__result-button': true, 'is-active': activeTab === 'result' }"
          :title="$t('query.queryResult')"
          @click="activeTab = 'result'"
        >
          {{ $t('query.queryResult') }}
        </div>
      </div>
      <div v-if="activeTab === 'job'" class="sm-component-query__job-info">
        <div
          v-for="(jobInfo, index) in jobInfos"
          v-show="jobInfos.length > 0"
          :key="index"
          :style="headingTextColorStyle"
          class="sm-component-query__job-info-panel"
        >
          <div
            class="sm-component-query__job-info-header"
            @click="activePanelIndex = activePanelIndex === index ? null : index"
          >
            <span :title="jobInfo.queryParameter.name" class="sm-component-query__job-info-name">{{
              jobInfo.queryParameter.name
            }}</span>
            <i
              :class="
                activePanelIndex !== index ? 'sm-components-icon-solid-triangle-right' : 'sm-components-icon-solid-triangle-down'
              "
            />
          </div>
          <div
            v-if="jobInfo.queryParameter.attributeFilter"
            :class="{ 'sm-component-query__job-info-body': true, hidden: activePanelIndex !== index }"
          >
            <div class="sm-component-query__attribute">
              <div>{{ $t('query.attributeCondition') }}</div>
              <div class="sm-component-query__attribute-name">
                {{ jobInfo.queryParameter.attributeFilter }}
              </div>
            </div>
            <div class="sm-component-query__spatial-filter">
              <div>{{ $t('query.spatialFilter') }}</div>
              <sm-select
                v-model="jobInfo.spaceFilter"
                class="sm-component-query__a-select"
                :get-popup-container="getPopupContainer"
                :style="getTextColorStyle"
              >
                <sm-select-option v-for="item in selectOptions" :key="item.value" :value="item.value">
                  {{ item.label }}
                </sm-select-option>
              </sm-select>
            </div>
            <div class="sm-component-query__query-button">
              <sm-button
                type="primary"
                size="small"
                class="sm-component-query__a-button"
                @click="queryButtonClicked(jobInfo.queryParameter, jobInfo.spaceFilter)"
              >
                {{ $t('query.applicate') }}
              </sm-button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="sm-component-query__result-info">
        <div v-show="!queryResult && !isQuery" class="sm-component-query__no-result">
          <sm-empty :description="$t('query.noResult')" />
        </div>
        <div v-show="isQuery && !queryResult" class="sm-component-query__result-loading">
          <sm-spin :tip="$t('query.querying')">
            <sm-icon slot="indicator" type="loading" style="font-size: 24px" spin />
          </sm-spin>
        </div>
        <template v-if="queryResult">
          <div class="sm-component-query__result-header" :style="headingTextColorStyle">
            <span :title="queryResult.name" class="sm-component-query__header-name">{{ queryResult.name }}</span>
            <i class="sm-components-icon-delete" @click="clearResult" />
          </div>
          <div class="sm-component-query__result-body">
            <ul>
              <li
                v-for="(item, index) in queryResult.result"
                :key="index"
                :title="getInfoOfSmid(item.properties)"
                role="option"
                :aria-selected="activeResultIndex === index"
                @click="queryResultListClicked($event, index)"
              >
                {{ getInfoOfSmid(item.properties) }}
              </li>
            </ul>
          </div>
        </template>
      </div>
    </div>
    <TablePopup
      v-show="false"
      ref="queryTablePopup"
      v-bind="tablePopupProps"
      :split-line="splitLine"
      :textColor="textColor"
      :background="background"
    />
  </sm-collapse-card>
</template>
<script>
import Theme from '../../common/_mixin/Theme';
import Control from '../_mixin/control';
import Card from '../../common/_mixin/Card';
import MapGetter from '../_mixin/map-getter';
import LineStyle from '../_types/LineStyle';
import FillStyle from '../_types/FillStyle';
import CircleStyle from '../_types/CircleStyle';
import QueryViewModel from './QueryViewModel.js';
import SmSelect from '../../common/select/Select';
import SmSelectOption from '../../common/select/Option';
import SmButton from '../../common/button/Button';
import SmEmpty from '../../common/empty/Empty';
import SmSpin from '../../common/spin/Spin';
import SmIcon from '../../common/icon/Icon';
import TablePopup from '../../common/table-popup/TablePopup';
import { setPopupArrowStyle, getValueCaseInsensitive } from '../../common/_utils/util';
import isEqual from 'lodash.isequal';

export default {
  name: 'SmQuery',
  components: {
    SmSelect,
    SmSelectOption,
    SmButton,
    SmEmpty,
    SmSpin,
    SmIcon,
    TablePopup
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
      default: 'sm-components-icon-search-list'
    },
    headerName: {
      type: String,
      default() {
        return this.$t('query.query');
      }
    },
    maxFeatures: {
      type: Number,
      default: 200
    },
    layerStyle: {
      type: Object,
      default() {
        return {
          line: new LineStyle({
            'line-width': 3,
            'line-color': '#409eff',
            'line-opacity': 1
          }),
          circle: new CircleStyle({
            'circle-color': '#409eff',
            'circle-opacity': 0.6,
            'circle-radius': 8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#409eff',
            'circle-stroke-opacity': 1
          }),
          fill: new FillStyle({
            'fill-color': '#409eff',
            'fill-opacity': 0.6,
            'fill-outline-color': '#409eff'
          }),
          stokeLine: new LineStyle({
            'line-width': 3,
            'line-color': '#409eff',
            'line-opacity': 1
          })
        };
      }
    },
    iportalData: {
      type: Array
    },
    restData: {
      type: Array
    },
    restMap: {
      type: Array
    }
  },
  data() {
    return {
      isHidden: false,
      message: null,
      selectOptions: [
        {
          label: this.$t('query.currentMapBounds'),
          value: 'currentMapBounds'
        },
        {
          label: this.$t('query.mapBounds'),
          value: 'mapBounds'
        }
      ],
      queryResult: null,
      activeTab: 'job',
      activePanelIndex: null,
      activeResultIndex: null,
      isQuery: false,
      jobInfos: [],
      tablePopupProps: {}
    };
  },
  watch: {
    iportalData(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) {
        this.clearResult();
        this.formatJobInfos();
      }
    },
    restData(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) {
        this.clearResult();
        this.formatJobInfos();
      }
    },
    restMap(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) {
        this.clearResult();
        this.formatJobInfos();
      }
    },
    layerStyle() {
      this.viewModel && (this.viewModel.layerStyle = this.$props.layerStyle);
    }
  },
  mounted() {
    this.formatJobInfos();
    this.registerEvents();
  },
  loaded() {
    this.clear();
  },
  created() {
    this.viewModel = new QueryViewModel(this.$props);
  },
  removed() {
    this.queryResult = null;
    this.jobInfo = null;
    this.activeTab = 'job';
    this.popup && this.popup.remove() && (this.popup = null);
  },
  methods: {
    clear() {
      this.queryResult = null;
      this.map && this.viewModel && this.viewModel.clearResultLayer();
      this.popup && this.popup.remove() && (this.popup = null);
    },
    formatJobInfos() {
      if (this.viewModel) {
        this.jobInfos = [];
        Object.keys(this.$props).forEach(key => {
          if (key === 'iportalData' || key === 'restData' || key === 'restMap') {
            this.$props[key] &&
              this.$props[key].forEach(item => {
                item.name &&
                  this.jobInfos.push({
                    spaceFilter: 'currentMapBounds',
                    queryParameter: item
                  });
              }, this);
          }
        }, this);
      }
    },
    queryButtonClicked(jobInfo, value) {
      this.$message.destroy();
      if (this.jobInfo === jobInfo && this.selectValue === value && this.queryResult) {
        this.$message.warning(this.$t('query.resultAlreadyExists'));
        return;
      }
      this.queryResult = null;
      this.popup && this.popup.remove() && (this.popup = null);
      this.isQuery = true;
      this.activeTab = 'result';
      this.jobInfo = jobInfo;
      this.selectValue = value;
      this.query(this.jobInfo, this.selectValue);
    },
    /**
     * 开始查询。
     * @param {iPortalDataParameter|RestDataParameter|RestMapParameter} parameter - 查询配置参数。
     * @param {String} [bounds='mapBounds'] - 查询范围，可选值为 mapBounds（地图全图范围），currentMapBounds（当前地图范围）。
     */
    query(parameter, bounds) {
      this.viewModel.query(parameter, bounds);
    },
    queryResultListClicked(e, index) {
      this.activeResultIndex = index;
      this.popup && this.popup.remove() && (this.popup = null);
      let filter = e.target.innerHTML;
      let feature = this.viewModel.getFilterFeature(filter.split('：')[1].trim());
      this.addPopup(feature);
    },
    registerEvents() {
      this.viewModel.on('querysucceeded', e => {
        this.isQuery = false;
        this.queryResult = e.result;
        /**
         * @event querySucceeded
         * @desc 查询成功后触发。
         * @property {Object} e  - 事件对象。
         */
        this.$emit('query-succeeded', e);
      });
      this.viewModel.on('queryfailed', e => {
        this.isQuery = false;
        this.clearResult();
        this.$message.warning(e.message.toString());
        /**
         * @event queryFailed
         * @desc 查询失败后触发。
         * @property {Object} e  - 事件对象。
         */
        this.$emit('query-failed', e);
      });
      this.addPopupToFeature();
    },
    addPopupToFeature() {
      this.viewModel.on('getfeatureinfosucceeded', e => {
        let featuerInfo = e.featureInfo;
        this.addPopup(featuerInfo);
      });
    },
    addPopup(featuerInfo) {
      this.popup && this.popup.remove() && (this.popup = null);
      if (featuerInfo.info.length >= 1) {
        let state = {
          columns: [
            { title: this.$t('query.attribute'), dataIndex: 'attribute', width: 80 },
            { title: this.$t('query.attributeValue'), dataIndex: 'attributeValue', width: 150 }
          ],
          data: featuerInfo.info
        };

        this.tablePopupProps = { ...state };

        this.$nextTick(() => {
          this.popup = this.viewModel.addPopup(featuerInfo.coordinates, this.$refs.queryTablePopup.$el);
          setPopupArrowStyle(this.tablePopupBgData);
        });
      }
    },
    getPopupContainer(triggerNode) {
      return triggerNode.parentNode;
    },
    clearResult() {
      this.queryResult = null;
      this.popup && this.popup.remove() && (this.popup = null);
      this.jobInfo = null;
      this.activeResultIndex = null;
      this.viewModel && this.viewModel.removed();
    },
    getInfoOfSmid(properties) {
      return `SmID：${getValueCaseInsensitive(properties, 'smid')}`;
    }
  }
};
</script>
