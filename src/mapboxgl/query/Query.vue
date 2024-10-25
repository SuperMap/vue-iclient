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
                activePanelIndex !== index
                  ? 'sm-components-icon-solid-triangle-right'
                  : 'sm-components-icon-solid-triangle-down'
              "
            />
          </div>
          <div :class="{ 'sm-component-query__job-info-body': true, hidden: activePanelIndex !== index }">
            <div class="sm-component-query__item-holder">
              <template v-if="jobInfo.queryParameter.queryMode === 'KEYWORD'">
                <div>{{ $t('query.keyQueryCondition') }}</div>
                <sm-input
                  v-model="jobInfo.queryParameter.attributeFilter"
                  allowClear
                  class="sm-component-query__item-config"
                  :style="getTextColorStyle"
                  :placeholder="$t('query.keyQueryPlaceholder')"
                />
              </template>
              <template v-else>
                <div>{{ $t('query.attributeCondition') }}</div>
                <sm-input
                  v-model="jobInfo.queryParameter.attributeFilter"
                  allowClear
                  class="sm-component-query__item-config"
                  :style="getTextColorStyle"
                  :placeholder="$t('query.sqlQueryPlaceholder')"
                />
              </template>
            </div>
            <div class="sm-component-query__item-holder">
              <div>{{ $t('query.spatialFilter') }}</div>
              <sm-select
                v-model="jobInfo.spaceFilter"
                class="sm-component-query__item-config"
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
                :title="resultDisplayTitle(item)"
                role="option"
                :aria-selected="activeResultIndexList.includes(index)"
                @click="queryResultListClicked($event, index)"
              >
                {{ resultDisplayTitle(item) }}
                <i v-if="activeResultIndexList.includes(index) && multiSelect" class="sm-components-icon-delete" />
              </li>
            </ul>
          </div>
        </template>
      </div>
    </div>
    <SmLayerHighlight
      uniqueName="query-popup"
      :layers="resultLayers"
      :highlightStyle="highlightStyle"
      :featureFieldsMap="featureFieldsMap"
      :displayFieldsMap="displayFieldsMap"
      :multiSelection="multiSelect"
      :clickTolerance="clickTolerance"
      :popupStyle="popupStyle"
      :background="popupStyle.background || background"
      :textColor="popupStyle.background || textColor"
      :mapTarget="mapTarget"
      :customColumnRenders="$scopedSlots"
      :showPopup="showPopup"
      :ref="highlightCompRefName"
      @mapselectionchanged="handleMapSeletionChanged"
    />
  </sm-collapse-card>
</template>
<script>
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import Control from 'vue-iclient/src/mapboxgl/_mixin/control';
import Card from 'vue-iclient/src/common/_mixin/Card';
import MapGetter from 'vue-iclient/src/mapboxgl/_mixin/map-getter';
import LineStyle from 'vue-iclient/src/mapboxgl/_types/LineStyle';
import FillStyle from 'vue-iclient/src/mapboxgl/_types/FillStyle';
import CircleStyle from 'vue-iclient/src/mapboxgl/_types/CircleStyle';
import QueryViewModel from './QueryViewModel.js';
import SmInput from 'vue-iclient/src/common/input/Input.vue';
import SmSelect from 'vue-iclient/src/common/select/Select.vue';
import SmSelectOption from 'vue-iclient/src/common/select/Option.vue';
import SmButton from 'vue-iclient/src/common/button/Button.vue';
import SmEmpty from 'vue-iclient/src/common/empty/Empty.vue';
import SmSpin from 'vue-iclient/src/common/spin/Spin.vue';
import SmIcon from 'vue-iclient/src/common/icon/Icon.vue';
import Message from 'vue-iclient/src/common/message/Message.js';
import SmLayerHighlight from 'vue-iclient/src/mapboxgl/layer-highlight/LayerHighlight';
import { getValueCaseInsensitive } from 'vue-iclient/src/common/_utils/util';
import isEqual from 'lodash.isequal';
import omit from 'omit.js';

export default {
  name: 'SmQuery',
  components: {
    SmInput,
    SmSelect,
    SmSelectOption,
    SmButton,
    SmEmpty,
    SmSpin,
    SmIcon,
    SmLayerHighlight
  },
  mixins: [MapGetter, Control, Theme, Card],
  props: {
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
    highlightStyle: {
      type: Object,
      default() {
        return {
          line: new LineStyle({
            'line-width': 3,
            'line-color': '#01ffff',
            'line-opacity': 1
          }),
          circle: new CircleStyle({
            'circle-color': '#01ffff',
            'circle-opacity': 0.6,
            'circle-radius': 8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#01ffff',
            'circle-stroke-opacity': 1
          }),
          fill: new FillStyle({
            'fill-color': '#01ffff',
            'fill-opacity': 0.6,
            'fill-outline-color': '#01ffff'
          }),
          strokeLine: new LineStyle({
            'line-width': 3,
            'line-color': '#01ffff',
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
    },
    showPopup: {
      type: Boolean,
      default: true
    },
    popupStyle: {
      type: Object,
      default: () => {
        return {
          keyWidth: 80,
          valueWidth: 150,
          keyMaxWidth: 160,
          valueMaxWidth: 300
        };
      }
    },
    multiSelect: {
      type: Boolean,
      default: false
    },
    clickTolerance: {
      type: Number,
      default: 5
    }
  },
  data() {
    return {
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
      activeResultIndexList: [],
      activeQueryJob: null,
      isQuery: false,
      jobInfos: [],
      resultLayers: [],
      highlightCompRefName: 'query-highlight'
    };
  },
  computed: {
    resultDisplayTitle() {
      return function(properties) {
        return `SmID：${getValueCaseInsensitive(properties, 'smid')}`;
      };
    },
    featureFieldsMap() {
      if (this.resultLayers.length > 0) {
        const { fields } = this.queryResult;
        return this.resultLayers.reduce((list, layerId) => {
          list[layerId] = fields;
          return list;
        }, {});
      }
      return null;
    },
    displayFieldsMap() {
      if (this.resultLayers.length > 0) {
        const { fields } = this.activeQueryJob;
        return this.resultLayers.reduce((list, layerId) => {
          list[layerId] = fields;
          return list;
        }, {});
      }
      return null;
    }
  },
  watch: {
    iportalData(newVal, oldVal) {
      if (!this.isSameData([newVal, oldVal])) {
        this.clearResult();
        this.formatJobInfos();
      }
    },
    restData(newVal, oldVal) {
      if (!this.isSameData([newVal, oldVal])) {
        this.clearResult();
        this.formatJobInfos();
      }
    },
    restMap(newVal, oldVal) {
      if (!this.isSameData([newVal, oldVal])) {
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
    this.clearResult();
  },
  created() {
    this.viewModel = new QueryViewModel(this.$props);
  },
  removed() {
    this.clearResult();
  },
  methods: {
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
                    queryParameter: Object.assign({}, item, { queryMode: item.queryMode || 'SQL' })
                  });
              }, this);
          }
        }, this);
      }
    },
    queryButtonClicked(jobInfo, value) {
      // @ts-ignore
      Message.destroy();
      if (JSON.stringify(this.activeQueryJob) === JSON.stringify(jobInfo) && this.selectValue === value && this.queryResult) {
        // @ts-ignore
        Message.warning(this.$t('query.resultAlreadyExists'));
        return;
      }
      this.clearResult();
      this.isQuery = true;
      this.activeTab = 'result';
      this.activeQueryJob = jobInfo;
      this.selectValue = value;
      this.query(JSON.parse(JSON.stringify(jobInfo)), this.selectValue);
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
      if (this.activeResultIndexList.includes(index)) {
        this.activeResultIndexList.splice(this.activeResultIndexList.indexOf(index), 1);
      } else if (this.multiSelect) {
        this.activeResultIndexList.push(index);
      } else{
        this.activeResultIndexList = [index];
      }
      const highlightComp = this.$refs[this.highlightCompRefName];
      const features = this.activeResultIndexList.map(i => this.resultFeatures[i]);
      highlightComp && highlightComp.updateHighlightDatas({ features, layerId: this.resultLayers[0] });
    },
    registerEvents() {
      this.viewModel.on('querysucceeded', e => {
        this.isQuery = false;
        this.queryResult = {
          ...e.result,
          result: e.result.result.map(item => item.properties)
        };
        this.resultFeatures = e.result.result;
        this.resultLayers = e.layers;
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
        // @ts-ignore
        Message.warning(e.message.toString());
        /**
         * @event queryFailed
         * @desc 查询失败后触发。
         * @property {Object} e  - 事件对象。
         */
        this.$emit('query-failed', e);
      });
    },
    getPopupContainer(triggerNode) {
      return triggerNode.parentNode;
    },
    clearResult() {
      this.activeTab = 'job';
      this.activeResultIndexList = [];
      this.resultLayers = [];
      this.queryResult = null;
      this.activeQueryJob = null;
      this.viewModel && this.viewModel.clear(this.highlightLayerIds);
    },
    handleMapSeletionChanged(e) {
      this.highlightLayerIds = e.highlightLayerIds;
      if (e.dataSelectorMode !== 'ALL') {
        this.activeResultIndexList = [];
      }
      this.$emit('datachange', { ...e, layerName: this.queryResult.name, fields: this.activeQueryJob.fields });
    },
    isSameData(compareDatas) {
      const nextList = compareDatas.map(data => data && data.map(item => {
        if (item.fields && item.fields.length > 0) {
          return {
            ...item,
            fields: item.fields.map(sub => omit(sub, ['slotName']))
          };
        }
        return item;
      }));
      return isEqual(...nextList);
    }
  }
};
</script>
