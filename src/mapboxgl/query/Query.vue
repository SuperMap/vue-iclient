<template>
  <sm-card
    v-show="isShow"
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :background="background"
    :textColor="textColor"
    class="sm-component-query"
  >
    <div class="sm-component-query__body" :style="[getBackgroundStyle, getTextColorStyle]">
      <div class="sm-component-query__choose-panel clearfix">
        <div
          class="sm-component-query__job-button is-active"
          :title="$t('query.queryJob')"
          :style="activeTab === 'job' ? getColorStyle(0) : ''"
          @click="jobButtonClicked"
        >
          {{ $t('query.queryJob') }}
        </div>
        <div
          class="sm-component-query__result-button"
          :title="$t('query.queryResult')"
          :style="activeTab === 'result' ? getColorStyle(0) : ''"
          @click="resultButtonClicked"
        >
          {{ $t('query.queryResult') }}
        </div>
      </div>
      <div class="sm-component-query__job-info">
        <div
          v-for="(jobInfo, index) in jobInfos"
          v-show="jobInfos.length > 0"
          :key="index"
          class="sm-component-query__job-info-panel"
        >
          <div
            class="sm-component-query__job-info-header"
            :style="getTextColorStyle"
            @click="jobInfoClicked"
            @mouseleave="resetHoverStyle"
            @mouseenter="changeHoverStyle"
          >
            <span class="sm-components-icons-preview"></span>
            <span :title="jobInfo.queryParameter.name" class="sm-component-query__job-info-name">{{
              jobInfo.queryParameter.name
            }}</span>
            <div class="sm-components-icons-legend-unfold"></div>
          </div>
          <div v-if="jobInfo.queryParameter.attributeFilter" class="sm-component-query__job-info-body hidden">
            <div class="sm-component-query__attribute">
              <div>{{ $t('query.attributeCondition') }}</div>
              <div class="sm-component-query__attribute-name" :style="getColorStyle(0)">
                {{ jobInfo.queryParameter.attributeFilter }}
              </div>
            </div>
            <div class="sm-component-query__spatial-filter">
              <div>{{ $t('query.spatialFilter') }}</div>
              <a-select
                v-model="jobInfo.spaceFilter"
                class="sm-component-query__a-select"
                :get-popup-container="getPopupContainer"
                @dropdownVisibleChange="changeChosenStyle"
              >
                <a-select-option v-for="item in selectOptions" :key="item.value" :value="item.value">{{
                  item.label
                }}</a-select-option>
              </a-select>
            </div>
            <div class="sm-component-query__query-button">
              <a-button
                type="primary"
                size="small"
                class="sm-component-query__a-button"
                :style="{ backgroundColor: getColorStyle(0).color, color: getTextColor }"
                @click="queryButtonClicked(jobInfo.queryParameter, jobInfo.spaceFilter)"
              >
                {{ $t('query.applicate') }}
              </a-button>
            </div>
          </div>
        </div>
      </div>
      <div class="sm-component-query__result-info hidden">
        <div v-show="!queryResult && !isQuery" class="sm-component-query__no-result hidden">
          {{ $t('query.noResult') }}
        </div>
        <div v-show="isQuery && !queryResult" class="sm-component-query__result-loading">
          <a-spin :tip="$t('query.querying')">
            <a-icon slot="indicator" type="loading" style="font-size: 24px" spin />
          </a-spin>
        </div>
        <div v-if="queryResult" class="sm-component-query__result-header" :style="getColorStyle(0)">
          <span :title="queryResult.name" class="sm-component-query__header-name">{{ queryResult.name }}</span>
          <span class="sm-components-icons-close" @click="clearResult"></span>
        </div>
        <div v-if="queryResult" class="sm-component-query__result-body">
          <ul>
            <li
              v-for="(item, index) in queryResult.result"
              :key="index"
              :title="getInfoOfSmid(item.properties)"
              @click="queryResultListClicked"
              @mouseenter="changeChosenResultStyle"
              @mouseleave="resetChosenResultStyle"
            >
              {{ getInfoOfSmid(item.properties) }}
            </li>
          </ul>
        </div>
      </div>
    </div>
    <TablePopup
      v-show="false"
      ref="queryTablePopup"
      v-bind="tablePopupProps"
      :background="background"
      :textColor="textColor"
    />
  </sm-card>
</template>
<script>
import Theme from '../../common/_mixin/theme';
import Control from '../_mixin/control';
import Card from '../../common/_mixin/card';
import MapGetter from '../_mixin/map-getter';
import LineStyle from '../_types/LineStyle';
import FillStyle from '../_types/FillStyle';
import CircleStyle from '../_types/CircleStyle';
// import iPortalDataParameter from '../../common/_types/iPortalDataParameter';
// import RestDataParameter from '../../common/_types/RestDataParameter';
// import RestMapParameter from '../../common/_types/RestMapParameter';
import QueryViewModel from './QueryViewModel.js';
import TablePopup from '../../common/table-popup/TablePopup';
import { getColorWithOpacity, getValueCaseInsensitive } from '../../common/_utils/util';
import isEqual from 'lodash.isequal';

// let validators = (value, propType) => {
//   let valid = true;
//   value.forEach(item => {
//     if (!(item instanceof propType)) {
//       valid = false;
//     }
//   });
//   return valid;
// };

export default {
  name: 'SmQuery',
  components: {
    TablePopup
  },
  mixins: [MapGetter, Control, Theme, Card],
  props: {
    collapsed: {
      type: Boolean, // 是否折叠
      default: true
    },
    iconClass: {
      type: String,
      default: 'sm-components-icons-ditusousuo'
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
      // validator(value) {
      //   return validators(value, iPortalDataParameter);
      // }
    },
    restData: {
      type: Array
      // validator(value) {
      //   return validators(value, RestDataParameter);
      // }
    },
    restMap: {
      type: Array
      // validator(value) {
      //   return validators(value, RestMapParameter);
      // }
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
      isQuery: false,
      jobInfos: [],
      tablePopupProps: {}
    };
  },
  computed: {
    popupBackground() {
      return this.backgroundData ? getColorWithOpacity(this.backgroundData, 0.5) : this.backgroundData;
    }
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
    colorGroupsData: {
      handler() {
        this.changeSelectInputStyle();
        this.changeLoadingStyle();
      }
    },
    textColorsData: {
      handler() {
        const results = this.$el.querySelectorAll('.sm-component-query__result-body li');
        for (let result of results) {
          result.style.color = this.getTextColor;
        }
      }
    },
    backgroundData() {
      this.changeResultPopupArrowStyle();
    },
    layerStyle() {
      this.viewModel && (this.viewModel.layerStyle = this.$props.layerStyle);
    }
  },
  mounted() {
    this.resultButton = this.$el.querySelector('.sm-component-query__result-button');
    this.jobButton = this.$el.querySelector('.sm-component-query__job-button');
    this.resultInfoContainer = this.$el.querySelector('.sm-component-query__result-info');
    this.jobInfoContainer = this.$el.querySelector('.sm-component-query__job-info');
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
    this.jobInfos = [];
    this.jobButtonClicked();
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
      this.jobButton.classList.add('disabled');
      this.resultButtonClicked();
      this.jobInfo = jobInfo;
      this.selectValue = value;
      this.query(this.jobInfo, this.selectValue);
      this.changeLoadingStyle();
      this.isQuery = true;
    },
    changeLoadingStyle() {
      const spinDom = this.$el.querySelector('.ant-spin');
      spinDom && (spinDom.style.color = this.getColorStyle(0).color);
    },
    /**
     * 开始查询。
     * @param {iPortalDataParameter|RestDataParameter|RestMapParameter} parameter - 查询配置参数。
     * @param {String} [bounds='mapBounds'] - 查询范围，可选值为 mapBounds（地图全图范围），currentMapBounds（当前地图范围）。
     */
    query(parameter, bounds) {
      this.viewModel.query(parameter, bounds);
    },
    jobButtonClicked() {
      if (this.resultButton) {
        this.activeTab = 'job';
        this.resultButton.classList.remove('is-active');
        this.jobButton.classList.add('is-active');
        this.jobInfoContainer.classList.remove('hidden');
        this.resultInfoContainer.classList.add('hidden');
      }
    },
    resultButtonClicked() {
      this.activeTab = 'result';
      this.jobButton.classList.remove('is-active');
      this.resultButton.classList.add('is-active');
      this.resultInfoContainer.classList.remove('hidden');
      this.jobInfoContainer.classList.add('hidden');
    },
    jobInfoClicked(e) {
      let className = e.target.className;
      let parentNode;
      if (
        className === 'sm-components-icons-preview' ||
        className === 'sm-component-query__job-info-name' ||
        className === 'sm-components-icons-legend-unfold' ||
        className === 'sm-components-icons-legend-fold'
      ) {
        parentNode = e.target.parentNode.parentNode;
        e.stopPropagation();
      } else {
        parentNode = e.target.parentNode;
        e.preventDefault();
      }
      let classList = parentNode.querySelector('.sm-component-query__job-info-body').classList;
      let foldIcon = parentNode.querySelector('.sm-component-query__job-info-header').children[2];
      if (classList.contains('hidden')) {
        classList.remove('hidden');
        foldIcon.classList.add('sm-components-icons-legend-fold');
        foldIcon.classList.remove('sm-components-icons-legend-unfold');
        this.changeSelectInputStyle();
      } else {
        classList.add('hidden');
        foldIcon.classList.add('sm-components-icons-legend-unfold');
        foldIcon.classList.remove('sm-components-icons-legend-fold');
      }
    },
    changeSelectInputStyle() {
      const selectInputList = this.$el.querySelectorAll('.ant-select-selection');
      for (let item of selectInputList) {
        item.style.borderColor = this.getTextColor;
        item.style.color = this.getTextColor;
        item.style.backgroundColor = 'transparent';
      }
    },
    changeChosenStyle(visible, e) {
      setTimeout(() => {
        const optionListContainer = this.$el.querySelectorAll('.ant-select-dropdown-content');
        for (let item of optionListContainer) {
          item.style.background = this.backgroundData;
        }
        const optionList = this.$el.querySelectorAll('.ant-select-dropdown-menu-item');
        for (let item of optionList) {
          if (item.classList.contains('ant-select-dropdown-menu-item-selected')) {
            item.style.color = this.getColorStyle(0).color;
            item.style.background = this.backgroundData;
          } else {
            item.style.color = this.textColorsData;
            item.style.background = 'transparent';
          }
          item.addEventListener('mouseover', () => {
            item.style.color = this.getColorStyle(0).color;
          });
          item.addEventListener('mouseout', () => {
            !item.classList.contains('ant-select-dropdown-menu-item-selected') &&
              (item.style.color = this.textColorsData);
          });
        }
      }, 0);
    },
    changeChosenResultStyle(e) {
      const { target } = e;
      target.style.color = this.getColorStyle(0).color;
    },
    resetChosenResultStyle(e) {
      const { target } = e;
      target.style.color = this.getTextColor;
    },
    changeResultPopupArrowStyle() {
      const searchResultPopupArrow = this.popup && this.popup['_tip'];
      if (searchResultPopupArrow) {
        searchResultPopupArrow.style.borderTopColor = this.popupBackground;
      }
    },
    queryResultListClicked(e) {
      this.popup && this.popup.remove() && (this.popup = null);
      let filter = e.target.innerHTML;
      let feature = this.viewModel.getFilterFeature(filter.split('：')[1].trim());
      this.addPopup(feature);
    },

    registerEvents() {
      this.viewModel.on('querysucceeded', e => {
        this.isQuery = false;
        this.$el.querySelector('.sm-component-query__no-result').classList.remove('hidden');
        this.queryResult = e.result;
        this.viewModel.getPopupFeature();
        this.addPopupToFeature();
        this.jobButton.classList.remove('disabled');
        /**
         * @event querySucceeded
         * @desc 查询成功后触发。
         * @property {Object} e  - 事件对象。
         */
        this.$emit('query-succeeded', e);
      });
      this.viewModel.on('queryfailed', e => {
        this.isQuery = false;
        this.$el.querySelector('.sm-component-query__no-result').classList.remove('hidden');
        this.clearResult();
        this.$message.warning(e.message.toString());
        this.jobButton.classList.remove('disabled');
        /**
         * @event queryFailed
         * @desc 查询失败后触发。
         * @property {Object} e  - 事件对象。
         */
        this.$emit('query-failed', e);
      });
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
          this.changeResultPopupArrowStyle();
        });
      }
    },
    changeHoverStyle(e) {
      const { target } = e;
      target.style.color = this.getColorStyle(0).color;
    },
    resetHoverStyle(e) {
      const { target } = e;
      target.style.color = this.getTextColorStyle.color;
    },
    getPopupContainer(triggerNode) {
      return triggerNode.parentNode;
    },
    clearResult() {
      this.queryResult = null;
      this.popup && this.popup.remove() && (this.popup = null);
      this.jobInfo = null;
      this.viewModel && this.viewModel.removed();
    },
    getInfoOfSmid(properties) {
      return `SmID：${getValueCaseInsensitive(properties, 'smid')}`;
    }
  }
};
</script>
