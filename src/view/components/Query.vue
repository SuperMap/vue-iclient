<template>
  <div class="sm-query">
    <div class="sm-query__header">
      <div class="sm-query__header-icon smwidgets-icons-search" @click="displayContainer"></div>
      <span class="sm-query__header-span">{{$t('query.query')}}</span>
      <div class="smwidgets-icons-more" @click="hidenContainer"></div>
    </div>
    <div class="sm-query__body">
      <div class="sm-query__choose-panel clearfix">
        <div
          class="sm-query__job-button is-active"
          title="任务"
          @click="jobButtonClicked"
        >{{$t('query.queryJob')}}</div>
        <div
          class="sm-query__result-button"
          title="结果"
          @click="resultButtonClicked"
        >{{$t('query.queryReuslt')}}</div>
      </div>
      <div class="sm-query__job-info">
        <div
          class="sm-query__job-info-panel"
          v-show="jobInfos.length > 0"
          v-for="(jobInfo,index) in jobInfos"
          :key="index"
        >
          <div class="sm-query__job-info-header" v-if="jobInfo.name" @click="jobInfoClicked">
            <span class="smwidgets-icons-preview"></span>
            <span class="sm-query__job-info-name">{{jobInfo.name}}</span>
            <div class="smwidgets-icons-legend-unfold"></div>
          </div>
          <div class="sm-query__job-info-body hidden" v-if="jobInfo.attributeFilter">
            <div class="sm-query__attribute">
              <div>{{$t('query.attributeCondition')}}</div>
              <div class="sm-query__attribute-name">{{jobInfo.attributeFilter}}</div>
            </div>
            <div class="sm-query__spatdivial-filter">
              <div>{{$t('query.spatialFilter')}}</div>
              <el-select
                v-model="value"
                :placeholder="$t('query.mapBounds')"
                class="sm-query__el-select"
                size="mini"
                :popper-append-to-body="false"
              >
                <el-option
                  v-for="item in selectOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </div>
            <div class="sm-query__query-button" @click="queryButtonClicked(jobInfo,value)">
              <el-button type="primary" plain size="mini" class="sm-query__el-button">{{$t('query.applicate')}}</el-button>
            </div>
          </div>
        </div>
      </div>
      <div class="sm-query__result-info hidden">
        <div v-show="!queryResult" class="sm-query__no-result">{{$t('query.noResult')}}</div>
        <span class="sm-query__result-header" v-if="queryResult">{{queryResult.name}}</span>
        <div class="sm-query__result-body" v-if="queryResult">
          <ul>
            <li
              v-for="(item,index) in queryResult.result"
              :key="index"
              :title="'SmID：'+(item.properties.SmID || item.properties.SMID)"
              @click="queryResultListClicked"
            >{{'SmID：'+(item.properties.SmID || item.properties.SMID)}}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Widget from "./Widget";
import IportalDataParameter from "../commontypes/IportalDataParameter";
import RestDataParameter from "../commontypes/RestDataParameter";
import RestMapParameter from "../commontypes/RestMapParameter";
import QueryViewModel from "../../viewmodel/QueryViewModel.js";
import TablePopup from "./TablePopup";
import Vue from "vue";

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
  name: "SmQuery",
  extends: Widget,
  data() {
    return {
      isHidden: false,
      message: null,
      value: "mapBounds",
      selectOptions: [
        {
          label: this.$t('query.currentMapBounds'),
          value: "currentMapBounds"
        },
        {
          label: this.$t('query.mapBounds'),
          value: "mapBounds"
        }
      ],
      queryResult: null
    };
  },
  props: {
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
    iportalDataQuery: {
      type: Array,
      validator(value) {
        return validators(value, IportalDataParameter);
      }
    },
    restDataQuery: {
      type: Array,
      validator(value) {
        return validators(value, RestDataParameter);
      }
    },
    restMapQuery: {
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
        if (
          key === "iportalDataQuery" ||
          key === "restDataQuery" ||
          key === "restMapQuery"
        ) {
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
    this.resultButton = this.$el.querySelector(".sm-query__result-button");
    this.jobButton = this.$el.querySelector(".sm-query__job-button");
    this.resultInfoContainer = this.$el.querySelector(".sm-query__result-info");
    this.jobInfoContainer = this.$el.querySelector(".sm-query__job-info");
    this.registerEvents();
  },
  methods: {
    queryButtonClicked(jobInfo, value) {
      this.$message.closeAll();
      if (this.jobInfo === jobInfo && this.selectValue === value) {
        this.$message({
          showClose: true,
          message: this.$t('query.resultAlreadyExists'),
          type: "warning",
          duration: 1000
        });
        return;
      }
      this.$el.querySelector(".sm-query__el-select");
      this.queryResult = null;
      this.popup && this.popup.remove() && (this.popup = null);
      this.loadingInstance = this.$loading.service({
        target: this.resultInfoContainer,
        fullscreen: false,
        text: this.$t('query.querying'),
        background: "hsla(0,0%,100%,.9)"
      });
      this.jobButton.classList.add("disabled");
      this.resultButtonClicked();
      this.$el.querySelector(".sm-query__no-result").classList.add("hidden");
      this.jobInfo = jobInfo;
      this.selectValue = value;
      this.query(this.jobInfo, this.selectValue);
    },
    query(parameter, bounds) {
      this.viewModel.query(parameter, bounds);
    },
    jobButtonClicked() {
      this.resultButton.classList.remove("is-active");
      this.jobButton.classList.add("is-active");
      this.jobInfoContainer.classList.remove("hidden");
      this.resultInfoContainer.classList.add("hidden");
    },
    resultButtonClicked() {
      this.jobButton.classList.remove("is-active");
      this.resultButton.classList.add("is-active");
      this.resultInfoContainer.classList.remove("hidden");
      this.jobInfoContainer.classList.add("hidden");
    },
    jobInfoClicked(e) {
      let className = e.target.className;
      let parentNode;
      if (
        className === "smwidgets-icons-preview" ||
        className === "sm-query__job-info-name" ||
        className === "smwidgets-icons-legend-unfold"
      ) {
        parentNode = e.target.parentNode.parentNode;
        e.stopPropagation();
      } else {
        parentNode = e.target.parentNode;
        e.preventDefault();
      }
      let classList = parentNode.querySelector(".sm-query__job-info-body")
        .classList;
      let foldIcon = parentNode.querySelector(".sm-query__job-info-header")
        .children[2];
      if (classList.contains("hidden")) {
        classList.remove("hidden");
        foldIcon.classList.add("smwidgets-icons-legend-fold");
        foldIcon.classList.remove("smwidgets-icons-legend-unfold");
      } else {
        classList.add("hidden");
        foldIcon.classList.add("smwidgets-icons-legend-unfold");
        foldIcon.classList.remove("smwidgets-icons-legend-fold");
      }
    },
    queryResultListClicked(e) {
      this.popup && this.popup.remove() && (this.popup = null);
      let filter = e.target.innerHTML;
      let feature = this.viewModel.getFilterFeature(filter);
      this.addPopup(feature);
    },

    registerEvents() {
      this.viewModel.on("querysucceeded", e => {
        this.$el
          .querySelector(".sm-query__no-result")
          .classList.remove("hidden");
        this.queryResult = e.result;
        this.viewModel.getPopupFeature();
        this.addPopupToFeature();
        this.loadingInstance.close();
        this.jobButton.classList.remove("disabled");
      });
    },
    addPopupToFeature() {
      this.viewModel.on("getfeatureinfosucceeded", e => {
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
            { label:this.$t('query.attribute'),prop: "attribute", width: 80 },
            { label:this.$t('query.attributeValue'), prop: "attributeValue", minWidth: 100 }
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
    hidenContainer(e) {
      this.isHidden = true;
      this.$el.style.background = "unset";
      this.$el
        .querySelector(".sm-query__header")
        .classList.add("hidden-header");
      for (let i = 1; i < this.$el.children.length; i++) {
        this.$el.children[i].style.transform = "scale(0)";
        this.$el.children[i].style.display = "none";
      }
      let children = e.target.parentNode.children;
      for (let i = 1; i < children.length; i++) {
        children[i].style.display = "none";
      }
    },
    displayContainer(e) {
      if (this.isHidden) {
        this.isHidden = false;
        this.$el.style.background = "#fff";
        this.$el
          .querySelector(".sm-query__header")
          .classList.remove("hidden-header");
        for (let i = 1; i < this.$el.children.length; i++) {
          this.$el.children[i].style.display = "block";
          this.$el.children[i].style.transform = "scale(1)";
        }
        let children = e.target.parentNode.children;
        for (let i = 1; i < children.length; i++) {
          children[i].style.display = "inline-block";
        }
      }
    }
  }
};
</script>
