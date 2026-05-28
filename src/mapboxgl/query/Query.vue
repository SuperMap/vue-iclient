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
    <div
      v-if="sqlBuilderVisibleIndex !== null"
      class="sm-component-query__sql-builder-mask"
      @click="closeSqlBuilder"
    />
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
                <div class="sm-component-query__sql-config-wrap">
                  <div class="sm-component-query__sql-input-row">
                    <sm-input
                      v-model="jobInfo.queryParameter.attributeFilter"
                      allowClear
                      class="sm-component-query__item-config sm-component-query__sql-input"
                      :style="getTextColorStyle"
                      :placeholder="$t('query.sqlQueryPlaceholder')"
                    />
                    <a-popover
                      v-if="jobInfo.queryParameter.showSqlBuilderButton !== false"
                      :ref="`sqlBuilderPopover-${index}`"
                      :visible="sqlBuilderVisibleIndex === index"
                      trigger="click"
                      placement="bottomRight"
                      overlay-class-name="sm-component-query__sql-builder-popover"
                      :get-popup-container="getSqlBuilderPopupContainer"
                      :destroy-tooltip-on-hide="true"
                      @visibleChange="handleSqlBuilderVisibleChange($event, jobInfo, index)"
                    >
                      <button
                        type="button"
                        class="sm-component-query__sql-config-button"
                        :title="$t('query.sqlQueryPlaceholder')"
                      >
                        <sm-icon type="more" />
                      </button>
                      <div slot="content" class="sm-component-query__sql-builder-panel" :style="getTextColorStyle">
                        <template v-for="(condition, conditionIndex) in sqlBuilderConditions">
                          <div
                            v-if="conditionIndex > 0"
                            :key="`connector-${conditionIndex}`"
                            class="sm-component-query__sql-builder-connector"
                          >
                            <sm-select
                              v-model="sqlBuilderConnectors[conditionIndex - 1]"
                              class="sm-component-query__sql-builder-logic"
                              :get-popup-container="getSqlBuilderSelectPopupContainer"
                              :style="getTextColorStyle"
                              @change="syncSqlBuilderExpression(jobInfo)"
                            >
                              <sm-select-option value="AND">AND</sm-select-option>
                              <sm-select-option value="OR">OR</sm-select-option>
                            </sm-select>
                          </div>
                          <div :key="`condition-${conditionIndex}`" class="sm-component-query__sql-builder-condition">
                            <button
                              v-if="sqlBuilderConditions.length > 1"
                              type="button"
                              class="sm-component-query__sql-builder-condition-close"
                              :title="$t('query.sqlBuilderDelete')"
                              @click="removeSqlBuilderCondition(conditionIndex)"
                            >
                              <i class="sm-components-icon-close" />
                            </button>
                            <div class="sm-component-query__sql-builder-line">
                              <span>{{ $t('query.sqlBuilderField') }}</span>
                              <sm-select
                                v-if="getSqlBuilderFields(jobInfo).length > 0"
                                v-model="condition.field"
                                class="sm-component-query__sql-builder-control"
                                :get-popup-container="getSqlBuilderSelectPopupContainer"
                                :style="getTextColorStyle"
                                @change="handleSqlBuilderFieldChange(condition, jobInfo)"
                              >
                                <sm-select-option
                                  v-for="field in getSqlBuilderFields(jobInfo)"
                                  :key="field.value"
                                  :value="field.value"
                                >
                                  {{ field.label }}
                                </sm-select-option>
                              </sm-select>
                              <sm-input
                                v-else
                                v-model="condition.field"
                                class="sm-component-query__sql-builder-control"
                                :style="getTextColorStyle"
                                :placeholder="$t('query.sqlBuilderField')"
                                @input="syncSqlBuilderExpression(jobInfo)"
                              />
                            </div>
                            <div class="sm-component-query__sql-builder-line">
                              <span>{{ $t('query.sqlBuilderOperator') }}</span>
                              <sm-select
                                v-model="condition.operator"
                                class="sm-component-query__sql-builder-control"
                                :get-popup-container="getSqlBuilderSelectPopupContainer"
                                :style="getTextColorStyle"
                                @change="syncSqlBuilderExpression(jobInfo)"
                              >
                                <sm-select-option
                                  v-for="operator in getSqlBuilderOperators(condition, jobInfo)"
                                  :key="operator"
                                  :value="operator"
                                >
                                  {{ getSqlBuilderOperatorLabel(operator) }}
                                </sm-select-option>
                              </sm-select>
                            </div>
                            <div class="sm-component-query__sql-builder-line">
                              <span>{{ $t('query.sqlBuilderValue') }}</span>
                              <div class="sm-component-query__sql-builder-value-row">
                                <sm-select
                                  v-if="!isSqlBuilderValueDisabled(condition.operator)"
                                  v-model="condition.value"
                                  mode="combobox"
                                  showSearch
                                  class="sm-component-query__sql-builder-control"
                                  :get-popup-container="getSqlBuilderSelectPopupContainer"
                                  :style="getTextColorStyle"
                                  :placeholder="$t('query.sqlBuilderValue')"
                                  @focus="handleSqlBuilderValueFocus(conditionIndex)"
                                  @search="handleSqlBuilderValueSearch(conditionIndex, $event)"
                                  @change="handleSqlBuilderValueChange(conditionIndex, jobInfo)"
                                >
                                  <sm-select-option
                                    v-for="valueOption in getSqlBuilderFieldValueOptions(condition, conditionIndex)"
                                    :key="`${condition.field}-${valueOption.value}`"
                                    :value="`${valueOption.value}`"
                                  >
                                    {{ valueOption.label }}
                                  </sm-select-option>
                                </sm-select>
                                <span v-else class="sm-component-query__sql-builder-empty-value">--</span>
                              </div>
                            </div>
                          </div>
                        </template>
                        <div class="sm-component-query__sql-builder-actions">
                          <sm-button type="primary" size="small" @click="addSqlBuilderCondition(jobInfo)">{{ $t('query.sqlBuilderAddCondition') }}</sm-button>
                          <sm-button type="primary" size="small" @click="closeSqlBuilder">{{ $t('query.sqlBuilderCancel') }}</sm-button>
                          <sm-button
                            type="primary"
                            size="small"
                            class="sm-component-query__sql-builder-apply"
                            @click="confirmSqlBuilder(jobInfo)"
                          >
                            {{ $t('query.applicate') }}
                          </sm-button>
                        </div>
                      </div>
                    </a-popover>
                  </div>
                </div>
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
                <i v-if="activeResultIndexList.includes(index) && multiSelect" class="sm-components-icon-complete" />
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
      :textColor="popupStyle.textColor || textColor"
      :mapTarget="mapTarget"
      :customColumnRenders="$scopedSlots"
      :showPopup="showPopup"
      :ref="highlightCompRefName"
      :title="queryResult && queryResult.name"
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
import getFeatures from 'vue-iclient/src/common/_utils/get-features';
import Popover from 'ant-design-vue/es/popover';
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
    SmLayerHighlight,
    APopover: Popover
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
      highlightCompRefName: 'query-highlight',
      sqlBuilderVisibleIndex: null,
      sqlBuilderDraft: {
        expression: ''
      },
      sqlBuilderConditions: [],
      sqlBuilderConnectors: [],
      sqlBuilderFieldMap: {},
      sqlBuilderFieldValueMap: {},
      sqlBuilderValueFeatureMap: {},
      sqlBuilderValueFeaturePromiseMap: {},
      sqlBuilderFieldValueSearchMap: {}
    };
  },
  computed: {
    resultDisplayTitle() {
      return function(properties) {
        let { field, fieldCaption } = this.activeQueryJob.identifyField || {};
        field = field || 'smid';
        fieldCaption = fieldCaption || 'SmID';
        return `${fieldCaption}：${getValueCaseInsensitive(properties, field)}`;
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
    getSqlBuilderPopupContainer(triggerNode) {
      return (triggerNode && triggerNode.closest && triggerNode.closest('.sm-component-query')) || document.body;
    },
    getSqlBuilderSelectPopupContainer() {
      return document.body;
    },
    getSqlBuilderFields(jobInfo) {
      return this.normalizeSqlBuilderFields([
        this.sqlBuilderFieldMap[this.getSqlBuilderJobCacheKey(jobInfo)]
      ]);
    },
    normalizeSqlBuilderFields(fieldSources, captionSources = [], typeSource = []) {
      const fields = fieldSources.find(item => Array.isArray(item) && item.length) || [];
      const captions = captionSources.find(item => Array.isArray(item) && item.length) || [];
      const fieldMap = {};
      fields.forEach((field, index) => {
        const value = typeof field === 'string' ? field : field.name || field.field || field.fieldName || field.value;
        if (!value || fieldMap[value]) {
          return;
        }
        fieldMap[value] = {
          value,
          label: (typeof field === 'string' ? captions[index] : field.fieldCaption || field.caption || field.title || field.label) || value,
          type: (typeof field === 'string' ? typeSource[index] : field.type || field.fieldType || field.dataType) || typeSource[index]
        };
      });
      return Object.values(fieldMap);
    },
    getSqlBuilderFieldInfo(field, jobInfo) {
      return this.getSqlBuilderFields(jobInfo).find(item => item.value === field) || null;
    },
    isSqlBuilderNumberField(field, jobInfo) {
      const fieldInfo = this.getSqlBuilderFieldInfo(field, jobInfo) || {};
      const type = `${fieldInfo.type || ''}`.toUpperCase();
      if (/(INT|LONG|FLOAT|DOUBLE|DECIMAL|NUMBER|NUMERIC|REAL|SHORT|BYTE)/.test(type)) {
        return true;
      }
      if (/(TEXT|STRING|CHAR|CLOB|TIME|DATE|BOOL)/.test(type)) {
        return false;
      }
      const values = this.sqlBuilderFieldValueMap[this.getSqlBuilderFieldValueCacheKey(jobInfo, field)] || [];
      const validValues = values.filter(value => value !== null && value !== undefined && value !== '');
      if (!validValues.length) {
        return null;
      }
      return validValues.every(value => typeof value === 'number' || /^-?\d+(\.\d+)?$/.test(`${value}`.trim()));
    },
    getSqlBuilderOperators(condition, jobInfo) {
      if (!arguments.length) {
        return ['=', '<>', '>', '>=', '<', '<=', 'LIKE', 'IS NULL', 'IS NOT NULL'];
      }
      const commonOperators = ['=', '<>'];
      const isNumberField = this.isSqlBuilderNumberField(condition.field, jobInfo);
      if (!condition || !condition.field || isNumberField || isNumberField === null) {
        return ['=', '<>', '>', '>=', '<', '<=', 'IS NULL', 'IS NOT NULL'];
      }
      return commonOperators.concat(['LIKE', 'IS NULL', 'IS NOT NULL']);
    },
    getSqlBuilderOperatorLabel(operator) {
      return operator === '<>' ? '!=' : operator;
    },
    createSqlBuilderCondition(jobInfo) {
      const fields = this.getSqlBuilderFields(jobInfo);
      return {
        field: (fields[0] && fields[0].value) || '',
        operator: '=',
        value: ''
      };
    },
    parseSqlBuilderExpression(expression, jobInfo) {
      const text = `${expression || ''}`.trim();
      if (!text) {
        return null;
      }
      const fields = this.getSqlBuilderFields(jobInfo).map(item => item.value);
      const operators = ['IS NOT NULL', 'IS NULL', '>=', '<=', '<>', 'LIKE', '=', '>', '<'];
      const parts = text.split(/\s+(AND|OR)\s+/i);
      const conditions = [];
      const connectors = [];
      for (let index = 0; index < parts.length; index += 2) {
        const conditionText = parts[index].trim();
        const connector = parts[index - 1];
        const condition = this.parseSqlBuilderCondition(conditionText, fields, operators);
        if (!condition) {
          return null;
        }
        conditions.push(condition);
        if (connector) {
          connectors.push(connector.toUpperCase());
        }
      }
      return conditions.length ? { conditions, connectors } : null;
    },
    parseSqlBuilderCondition(conditionText, fields, operators) {
      const fieldPattern = fields.length ? fields.map(this.escapeRegExp).join('|') : '[\\w.]+';
      const operatorPattern = operators.map(this.escapeRegExp).join('|');
      const matcher = new RegExp(`^(${fieldPattern})\\s*(${operatorPattern})(?:\\s+(.+))?$`, 'i');
      const match = conditionText.match(matcher);
      if (!match) {
        return null;
      }
      const operator = operators.find(item => item.toUpperCase() === match[2].toUpperCase()) || match[2].toUpperCase();
      const value = this.isSqlBuilderValueDisabled(operator) ? '' : this.unformatSqlValue(match[3]);
      return {
        field: match[1],
        operator,
        value
      };
    },
    escapeRegExp(value) {
      return `${value}`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },
    unformatSqlValue(value) {
      const text = `${value || ''}`.trim();
      if (/^'.*'$/.test(text)) {
        return text.slice(1, -1).replace(/''/g, "'");
      }
      return text;
    },
    openSqlBuilder(jobInfo, index) {
      this.sqlBuilderVisibleIndex = index;
      const parsedExpression = this.parseSqlBuilderExpression(jobInfo.queryParameter.attributeFilter, jobInfo);
      this.sqlBuilderDraft = {
        expression: jobInfo.queryParameter.attributeFilter || ''
      };
      this.sqlBuilderConditions = parsedExpression ? parsedExpression.conditions : [this.createSqlBuilderCondition(jobInfo)];
      this.sqlBuilderConnectors = parsedExpression ? parsedExpression.connectors : [];
      this.refreshSqlBuilderPopoverAlign(index);
      const fields = this.getSqlBuilderFields(jobInfo);
      if (!fields.length) {
        return this.loadSqlBuilderFieldValues(jobInfo, '').then(() => {
          if (!this.sqlBuilderConditions[0].field) {
            const loadedFields = this.getSqlBuilderFields(jobInfo);
            this.sqlBuilderConditions[0].field = (loadedFields[0] && loadedFields[0].value) || '';
          }
          const field = this.sqlBuilderConditions[0] && this.sqlBuilderConditions[0].field;
          const loadValuesPromise = field ? this.loadSqlBuilderFieldValues(jobInfo, field) : Promise.resolve([]);
          return loadValuesPromise.then(() => {
            this.refreshSqlBuilderPopoverAlign(index);
          });
        });
      }
      this.sqlBuilderConditions.forEach(condition => {
        this.loadSqlBuilderFieldValues(jobInfo, condition.field).then(() => {
          this.refreshSqlBuilderPopoverAlign(index);
        });
      });
    },
    refreshSqlBuilderPopoverAlign(index = this.sqlBuilderVisibleIndex) {
      this.$nextTick(() => {
        window.requestAnimationFrame(() => {
          const popoverRef = this.$refs[`sqlBuilderPopover-${index}`];
          const popover = Array.isArray(popoverRef) ? popoverRef[0] : popoverRef;
          const tooltip = popover && popover.$refs && popover.$refs.tooltip;
          const vcTooltip = tooltip && tooltip.$refs && tooltip.$refs.tooltip;
          const trigger = vcTooltip && vcTooltip.$refs && vcTooltip.$refs.trigger;
          trigger && trigger.forcePopupAlign && trigger.forcePopupAlign();
        });
      });
    },
    handleSqlBuilderVisibleChange(visible, jobInfo, index) {
      if (visible) {
        this.openSqlBuilder(jobInfo, index);
      } else {
        this.closeSqlBuilder();
      }
    },
    formatSqlValue(value, isNumberField) {
      const text = `${value}`.trim();
      if (!text) {
        return '';
      }
      if (isNumberField || (isNumberField === null && /^-?\d+(\.\d+)?$/.test(text)) || /^'.*'$/.test(text) || /^\w+\(.+\)$/.test(text)) {
        return text;
      }
      return `'${text.replace(/'/g, "''")}'`;
    },
    isSqlBuilderValueDisabled(operator) {
      return operator === 'IS NULL' || operator === 'IS NOT NULL';
    },
    buildSqlCondition(condition, jobInfo) {
      const { field, operator, value } = condition || {};
      if (!field || !operator) {
        return '';
      }
      if (this.isSqlBuilderValueDisabled(operator)) {
        return `${field} ${operator}`;
      }
      const isNumberField = this.isSqlBuilderNumberField(field, jobInfo);
      const formattedValue = this.formatSqlValue(value, isNumberField);
      if (!formattedValue) {
        return '';
      }
      if (operator === 'LIKE') {
        const likeValue = `${value}`.trim();
        const normalizedValue = likeValue.includes('%') ? likeValue : `%${likeValue}%`;
        return `${field} ${operator} ${this.formatSqlValue(normalizedValue, false)}`;
      }
      return `${field} ${operator} ${formattedValue}`;
    },
    buildSqlExpressionFromConditions(jobInfo) {
      return this.sqlBuilderConditions.reduce((expression, condition, index) => {
        const conditionExpression = this.buildSqlCondition(condition, jobInfo);
        if (!conditionExpression) {
          return expression;
        }
        if (!expression) {
          return conditionExpression;
        }
        return `${expression} ${this.sqlBuilderConnectors[index - 1] || 'AND'} ${conditionExpression}`;
      }, '');
    },
    syncSqlBuilderExpression(jobInfo) {
      this.sqlBuilderDraft.expression = this.buildSqlExpressionFromConditions(jobInfo);
    },
    handleSqlBuilderFieldChange(condition, jobInfo) {
      const operators = this.getSqlBuilderOperators(condition, jobInfo);
      if (!operators.includes(condition.operator)) {
        condition.operator = operators[0];
      }
      condition.value = '';
      this.$set(this.sqlBuilderFieldValueSearchMap, this.sqlBuilderConditions.indexOf(condition), '');
      this.loadSqlBuilderFieldValues(jobInfo, condition.field);
      this.syncSqlBuilderExpression(jobInfo);
    },
    handleSqlBuilderValueFocus(conditionIndex) {
      this.$set(this.sqlBuilderFieldValueSearchMap, conditionIndex, '');
    },
    handleSqlBuilderValueSearch(conditionIndex, value) {
      this.$set(this.sqlBuilderFieldValueSearchMap, conditionIndex, value);
    },
    handleSqlBuilderValueChange(conditionIndex, jobInfo) {
      const condition = this.sqlBuilderConditions[conditionIndex];
      if (!condition || !condition.value) {
        this.$set(this.sqlBuilderFieldValueSearchMap, conditionIndex, '');
      }
      this.syncSqlBuilderExpression(jobInfo);
    },
    getSqlBuilderJobCacheKey(jobInfo) {
      const queryParameter = (jobInfo && jobInfo.queryParameter) || {};
      return `${queryParameter.url || ''}|${queryParameter.dataName || ''}|${queryParameter.layerName || ''}`;
    },
    getSqlBuilderFieldValueCacheKey(jobInfo, field) {
      return `${this.getSqlBuilderJobCacheKey(jobInfo)}|${field}`;
    },
    getSqlBuilderFieldValueOptions(condition, conditionIndex) {
      const values = this.sqlBuilderFieldValueMap[this.getSqlBuilderFieldValueCacheKey(this.jobInfos[this.sqlBuilderVisibleIndex], condition.field)] || [];
      const searchValue = this.sqlBuilderFieldValueSearchMap[conditionIndex];
      const matchedValues = searchValue
        ? values.filter(value => `${value}`.indexOf(`${searchValue}`) !== -1)
        : values;
      return matchedValues.slice(0, 100).map(value => ({ label: value, value }));
    },
    async querySqlBuilderValueFeatures(jobInfo) {
      const queryParameter = (jobInfo && jobInfo.queryParameter) || {};
      const data = await getFeatures({
        ...queryParameter,
        attributeFilter: '',
        keyWord: '',
        maxFeatures: 1000,
        returnFeaturesOnly: true
      });
      return data && data.features ? data.features : [];
    },
    async loadSqlBuilderValueFeatures(jobInfo) {
      const jobCacheKey = this.getSqlBuilderJobCacheKey(jobInfo);
      if (this.sqlBuilderValueFeatureMap[jobCacheKey]) {
        return this.sqlBuilderValueFeatureMap[jobCacheKey];
      }
      if (this.sqlBuilderValueFeaturePromiseMap[jobCacheKey]) {
        return this.sqlBuilderValueFeaturePromiseMap[jobCacheKey];
      }
      const promise = this.querySqlBuilderValueFeatures(jobInfo)
        .then(features => {
          this.$set(this.sqlBuilderValueFeatureMap, jobCacheKey, features);
          this.cacheSqlBuilderFields(jobInfo, features);
          this.$delete(this.sqlBuilderValueFeaturePromiseMap, jobCacheKey);
          return features;
        })
        .catch(error => {
          this.$delete(this.sqlBuilderValueFeaturePromiseMap, jobCacheKey);
          throw error;
        });
      this.$set(this.sqlBuilderValueFeaturePromiseMap, jobCacheKey, promise);
      return promise;
    },
    async loadSqlBuilderFieldValues(jobInfo, field) {
      const cacheKey = this.getSqlBuilderFieldValueCacheKey(jobInfo, field);
      if (this.sqlBuilderFieldValueMap[cacheKey]) {
        return this.sqlBuilderFieldValueMap[cacheKey];
      }
      const features = await this.loadSqlBuilderValueFeatures(jobInfo);
      if (!field) {
        return [];
      }
      const valueSet = new Set();
      const values = [];
      features.some(feature => {
        const properties = feature.properties || feature;
        let value = getValueCaseInsensitive(properties, field);
        if ((value === undefined || value === null || value === '') && Array.isArray(feature.fieldNames) && Array.isArray(feature.fieldValues)) {
          const fieldIndex = feature.fieldNames.findIndex(fieldName => `${fieldName}`.toUpperCase() === `${field}`.toUpperCase());
          value = fieldIndex > -1 ? feature.fieldValues[fieldIndex] : value;
        }
        if (value === null || value === undefined || value === '') {
          return false;
        }
        const valueKey = `${typeof value}:${value}`;
        if (!valueSet.has(valueKey)) {
          valueSet.add(valueKey);
          values.push(value);
        }
        return values.length >= 100;
      });
      this.$set(this.sqlBuilderFieldValueMap, cacheKey, values);
      return values;
    },
    cacheSqlBuilderFields(jobInfo, features) {
      const fieldMap = {};
      features.some(feature => {
        if (Array.isArray(feature.fieldNames)) {
          feature.fieldNames.forEach(fieldName => {
            if (fieldName && !fieldMap[fieldName]) {
              fieldMap[fieldName] = fieldName;
            }
          });
        }
        if (feature.properties) {
          Object.keys(feature.properties).forEach(fieldName => {
            if (fieldName && !fieldMap[fieldName]) {
              fieldMap[fieldName] = fieldName;
            }
          });
        }
        return Object.keys(fieldMap).length >= 100;
      });
      if (Object.keys(fieldMap).length) {
        this.$set(this.sqlBuilderFieldMap, this.getSqlBuilderJobCacheKey(jobInfo), Object.values(fieldMap));
      }
    },
    addSqlBuilderCondition(jobInfo) {
      this.sqlBuilderConditions.push(this.createSqlBuilderCondition(jobInfo));
      this.sqlBuilderConnectors.push('AND');
      this.syncSqlBuilderExpression(jobInfo);
    },
    removeSqlBuilderCondition(index) {
      if (this.sqlBuilderConditions.length === 1) {
        return;
      }
      this.sqlBuilderConditions.splice(index, 1);
      if (index === 0) {
        this.sqlBuilderConnectors.splice(0, 1);
      } else {
        this.sqlBuilderConnectors.splice(index - 1, 1);
      }
      this.syncSqlBuilderExpression();
    },
    confirmSqlBuilder(jobInfo) {
      this.syncSqlBuilderExpression(jobInfo);
      jobInfo.queryParameter.attributeFilter = this.sqlBuilderDraft.expression;
      this.closeSqlBuilder();
    },
    closeSqlBuilder() {
      this.sqlBuilderVisibleIndex = null;
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
