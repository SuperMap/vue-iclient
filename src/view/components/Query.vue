<template>
  <sm-card
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    class="sm-query"
    v-show="isShow"
  >
    <div class="sm-query__body" :style="[getBackgroundStyle, getTextColorStyle]">
      <div class="sm-query__choose-panel clearfix">
        <div
          class="sm-query__job-button is-active"
          :title="$t('query.queryJob')"
          @click="jobButtonClicked"
          :style="activeTab === 'job' ? getColorStyle(0) : ''"
        >{{$t('query.queryJob')}}</div>
        <div
          class="sm-query__result-button"
          :title="$t('query.queryReuslt')"
          @click="resultButtonClicked"
          :style="activeTab === 'result' ? getColorStyle(0) : ''"
        >{{$t('query.queryReuslt')}}</div>
      </div>
      <div class="sm-query__job-info">
        <div
          class="sm-query__job-info-panel"
          v-show="jobInfos.length > 0"
          v-for="(jobInfo,index) in jobInfos"
          :key="index"
        >
          <div
            class="sm-query__job-info-header"
            :style="getTextColorStyle"
            v-if="jobInfo.name"
            @click="jobInfoClicked"
            @mouseleave="resetHoverStyle"
            @mouseenter="changeHoverStyle"
          >
            <span class="smwidgets-icons-preview"></span>
            <span class="sm-query__job-info-name">{{jobInfo.name}}</span>
            <div class="smwidgets-icons-legend-unfold"></div>
          </div>
          <div class="sm-query__job-info-body hidden" v-if="jobInfo.attributeFilter">
            <div class="sm-query__attribute">
              <div>{{$t('query.attributeCondition')}}</div>
              <div
                class="sm-query__attribute-name"
                :style="getColorStyle(0)"
              >{{jobInfo.attributeFilter}}</div>
            </div>
            <div class="sm-query__spatial-filter">
              <div>{{$t('query.spatialFilter')}}</div>
              <el-select
                v-model="value"
                class="sm-query__el-select"
                size="mini"
                :popper-append-to-body="false"
                @visible-change="changeChosenStyle"
              >
                <el-option
                  v-for="item in selectOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </div>
            <div class="sm-query__query-button">
              <el-button
                type="primary"
                size="mini"
                class="sm-query__el-button"
                :style="{backgroundColor: getColorStyle(0).color, color: getTextColor}"
                @click="queryButtonClicked(jobInfo,value)"
              >{{$t('query.applicate')}}</el-button>
            </div>
          </div>
        </div>
      </div>
      <div class="sm-query__result-info hidden">
        <div v-show="!queryResult" class="sm-query__no-result">{{$t('query.noResult')}}</div>
        <span class="sm-query__result-header" v-if="queryResult" :style="getColorStyle(0)">{{queryResult.name}}</span>
        <div class="sm-query__result-body" v-if="queryResult">
          <ul>
            <li
              v-for="(item,index) in queryResult.result"
              :key="index"
              :title="'SmID：'+(item.properties.SmID || item.properties.SMID)"
              @click="queryResultListClicked"
              @mouseenter="changeChosenResultStyle"
              @mouseleave="resetChosenResultStyle"
            >{{'SmID：'+(item.properties.SmID || item.properties.SMID)}}</li>
          </ul>
        </div>
      </div>
    </div>
  </sm-card>
</template>
<script>
import Theme from '../mixin/Theme';
import Widget from './Widget';
import iPortalDataParameter from '../commontypes/iPortalDataParameter';
import RestDataParameter from '../commontypes/RestDataParameter';
import RestMapParameter from '../commontypes/RestMapParameter';
import QueryViewModel from '../../viewmodel/QueryViewModel.js';
import TablePopup from './TablePopup';
import Vue from 'vue';

let validators = (value, propType) => {
  let valid = true;
  value.forEach(item => {
    if (!(item instanceof propType)) {
      valid = false;
    }
  });
  return valid;
};

export default {
  name: 'SmQuery',
  relativeMap: true,
  extends: Widget,
  mixins: [Theme],
  data() {
    return {
      isHidden: false,
      message: null,
      value: 'mapBounds',
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
      activeTab: 'job'
    };
  },
  props: {
    iconClass: {
      type: String,
      default: 'smwidgets-icons-search'
    },
    headerName: {
      type: String,
      default: '查询'
    },
    maxReturn: {
      type: Number,
      default: 200
    },
    circleStyle: {
      type: Object
    },
    lineStyle: {
      type: Object
    },
    fillStyle: {
      type: Object
    },
    iportalData: {
      type: Array,
      validator(value) {
        return validators(value, iPortalDataParameter);
      }
    },
    restData: {
      type: Array,
      validator(value) {
        return validators(value, RestDataParameter);
      }
    },
    restMap: {
      type: Array,
      validator(value) {
        return validators(value, RestMapParameter);
      }
    }
  },
  computed: {
    jobInfos() {
      let jobInfos = [];
      Object.keys(this.$props).forEach(key => {
        if (key === 'iportalData' || key === 'restData' || key === 'restMap') {
          this.$props[key] &&
            this.$props[key].forEach(item => {
              item.name && jobInfos.push(item);
            }, this);
        }
      }, this);
      return jobInfos;
    }
  },
  loaded() {
    this.viewModel = new QueryViewModel(this.map, this.$props);
    this.resultButton = this.$el.querySelector('.sm-query__result-button');
    this.jobButton = this.$el.querySelector('.sm-query__job-button');
    this.resultInfoContainer = this.$el.querySelector('.sm-query__result-info');
    this.jobInfoContainer = this.$el.querySelector('.sm-query__job-info');
    this.registerEvents();
  },
  updated() {
    this.changeSelectInputStyle();
    this.changeLoadingStyle();
    const results = this.$el.querySelectorAll('.sm-query__result-body li');
    for(let result of results) {
      result.style.color = this.getTextColor;
    }
  },
  methods: {
    queryButtonClicked(jobInfo, value) {
      this.$message.closeAll();
      if (this.jobInfo === jobInfo && this.selectValue === value) {
        this.$message({
          showClose: true,
          message: this.$t('query.resultAlreadyExists'),
          type: 'warning',
          duration: 1000
        });
        return;
      }
      this.queryResult = null;
      this.popup && this.popup.remove() && (this.popup = null);
      this.loadingInstance = this.$loading.service({
        target: this.resultInfoContainer,
        fullscreen: false,
        text: this.$t('query.querying'),
        background: 'transparent'
      });
      this.jobButton.classList.add('disabled');
      this.resultButtonClicked();
      this.$el.querySelector('.sm-query__no-result').classList.add('hidden');
      this.jobInfo = jobInfo;
      this.selectValue = value;
      this.query(this.jobInfo, this.selectValue);
      this.changeLoadingStyle();
    },
    changeLoadingStyle() {
      const spinDom = this.$el.querySelector('.sm-query__result-info .path');
      const loadingText = this.$el.querySelector('.sm-query__result-info .el-loading-text');
      spinDom && (spinDom.style.stroke = this.getColorStyle(0).color);
      loadingText && (loadingText.style.color = this.getColorStyle(0).color);
    },
    query(parameter, bounds) {
      this.viewModel.query(parameter, bounds);
    },
    jobButtonClicked() {
      this.activeTab = 'job';
      this.resultButton.classList.remove('is-active');
      this.jobButton.classList.add('is-active');
      this.jobInfoContainer.classList.remove('hidden');
      this.resultInfoContainer.classList.add('hidden');
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
        className === 'smwidgets-icons-preview' ||
        className === 'sm-query__job-info-name' ||
        className === 'smwidgets-icons-legend-unfold'
      ) {
        parentNode = e.target.parentNode.parentNode;
        e.stopPropagation();
      } else {
        parentNode = e.target.parentNode;
        e.preventDefault();
      }
      let classList = parentNode.querySelector('.sm-query__job-info-body')
        .classList;
      let foldIcon = parentNode.querySelector('.sm-query__job-info-header')
        .children[2];
      if (classList.contains('hidden')) {
        classList.remove('hidden');
        foldIcon.classList.add('smwidgets-icons-legend-fold');
        foldIcon.classList.remove('smwidgets-icons-legend-unfold');
        this.chosenPanelNode = parentNode;
        this.changeSelectInputStyle();
      } else {
        classList.add('hidden');
        foldIcon.classList.add('smwidgets-icons-legend-unfold');
        foldIcon.classList.remove('smwidgets-icons-legend-fold');
        this.chosenPanelNode = null;
      }
    },
    changeSelectInputStyle() {
        const selectDom = this.chosenPanelNode && this.chosenPanelNode.querySelector('.el-input__inner');
        if(selectDom) {
          selectDom.style.borderColor = this.getTextColor;
          selectDom.style.color = this.getTextColor;
          selectDom.style.backgroundColor = 'transparent';  
        }
    },
    changeChosenStyle(visible) {
      const chosenOption = this.chosenPanelNode && this.chosenPanelNode.querySelector('.el-select-dropdown__item.selected');
      if(chosenOption) {
        chosenOption.style.color =  visible ? this.getColorStyle(0).color : '#606266';
      }
    },
    changeChosenResultStyle(e) {
      const { target } = e;
      target.style.color = this.getColorStyle(0).color;
    },
    resetChosenResultStyle(e) {
      const { target } = e;
      target.style.color = this.getTextColor;
    },
    queryResultListClicked(e) {
      this.popup && this.popup.remove() && (this.popup = null);
      let filter = e.target.innerHTML;
      let feature = this.viewModel.getFilterFeature(filter);
      this.addPopup(feature);
    },

    registerEvents() {
      this.viewModel.on('querysucceeded', e => {
        this.$el
          .querySelector('.sm-query__no-result')
          .classList.remove('hidden');
        this.queryResult = e.result;
        this.viewModel.getPopupFeature();
        this.addPopupToFeature();
        this.loadingInstance.close();
        this.jobButton.classList.remove('disabled');
      });
      this.viewModel.on('queryfailed', e => {
        this.$el
          .querySelector('.sm-query__no-result')
          .classList.remove('hidden');
          this.$message({
          showClose: true,
          message: e.message,
          type: 'warning',
          duration: 1000
        });
        this.loadingInstance.close();
        this.jobButton.classList.remove('disabled');
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
      let popup = Vue.extend(TablePopup);
      if (featuerInfo.info.length >= 1) {
        let state = {
          columns: [
            { label: this.$t('query.attribute'), prop: 'attribute', width: 80 },
            {
              label: this.$t('query.attributeValue'),
              prop: 'attributeValue',
              minWidth: 100
            }
          ],
          data: featuerInfo.info
        };
        let popupContainer = new popup({
          propsData: { state }
        }).$mount();

        this.$nextTick(() => {
          this.popup = this.viewModel.addPopup(
            featuerInfo.coordinates,
            popupContainer.$el
          );
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
    }
  }
};
</script>

