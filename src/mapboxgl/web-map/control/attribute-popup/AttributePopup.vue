<template>
  <div
    ref="popupRef"
    v-if="showPopup"
    v-show="isRender && showPopup"
    class="sm-component-attribute-popup"
    :style="[getTextColorStyle, popupBgStyleValue, popupWidth]"
  >
    <SelectLayer :show="showSelectLayer" :layerInfos="selectedLayers" @select="handleSelect" @close="handleClose" />
    <div v-show="showPopupContent" class="content">
      <div class="header">
        <i v-show="currentIndex === 0" class="sm-components-icon-left" @click="handleReturn()"></i>
        <div class="title ellipsis" :title="currentLayerName">{{ currentLayerName }}</div>
        <div v-show="isMultipleClick && enablePopupDatasLength > 0" class="switchDataText">
          <i
            :class="['icon', 'left-icon', 'sm-components-icon-solid-triangle-left', currentIndex === 0 && 'disabled']"
            @click="changeIndex(-1)"
          />
          <span :title="paginationContent">{{ paginationContent }}</span>
          <i
            :class="[
              'icon',
              'right-icon',
              'sm-components-icon-solid-triangle-right',
              currentIndex === enablePopupDatasLength - 1 && 'disabled'
            ]"
            @click="changeIndex(1)"
          />
        </div>
        <i class="sm-components-icon-close" @click="handleClose()"></i>
      </div>
      <PopupContent
        ref="popupContentRef"
        :data="currentData"
        :popupInfo="popupInfo"
        :popupConfig="popupConfigValue"
        :style="popupHeight"
      />
    </div>
  </div>
</template>

<script>
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import MapGetter from 'vue-iclient/src/mapboxgl/_mixin/map-getter';
import PopupContent from './PopupContent.vue';
import SelectLayer from './SelectLayer.vue';
import popupMixin from './mixins/popup-mixin';
import popupConfigMixin from './mixins/popup-config-mixin';
import resizeMixin from './mixins/resize-mixin';
import AttributePopupViewModel from './AttributePopupViewModel';
import { setPopupArrowStyle } from 'vue-iclient/src/common/_utils/util';
import isEqual from 'lodash.isequal';
import { getDefaultLayerStyle } from 'vue-iclient/src/mapboxgl/_types/index.js';

export default {
  name: 'SmAttributePopup',
  mixins: [MapGetter, Theme, popupMixin, popupConfigMixin, resizeMixin],
  components: { PopupContent, SelectLayer },
  props: {
    showPopup: {
      type: Boolean,
      default: true
    },
    clickTolerance: {
      type: Number,
      default: 5
    },
    layerStyle: {
      type: Object,
      default() {
        return getDefaultLayerStyle();
      }
    },
    useMapPopup: {
      type: Boolean,
      default: true
    },
    multiSelect: {
      type: Boolean,
      default: false
    },
    popupInfos: {
      type: Array,
      default: () => []
    },
    popupConfig: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      eventsCursor: { mousemove: 'mousemove', mouseleave: 'grab' },
      mapPopupInfos: [],
      allPopupDatas: [],
      lnglats: [],
      activeTargetName: '',
      clickedLayers: [],
      clickedLngLat: null,
      isMultipleClick: false,
      isSecMultipleClick: false,
      currentIndex: 0,
      currentLayerId: '',
      currentCoordinate: [],
      showSelectLayer: true,
      allPupDatasDisabled: [],
      identifyFieldsOptions: [],
      contentHeight: '',
      viewModel: null
    };
  },
  computed: {
    popupInfosValue() {
      const infos = this.useMapPopup ? this.mapPopupInfos : this.popupInfos;
      return infos.map(item => {
        const newItem = { ...item };
        if (typeof item.layerId === 'string' && item.layerId) {
          newItem.layerId = [item.layerId];
        }
        newItem.layerId = newItem.layerId?.filter(id => !id?.includes('-strokeLine')) || [];
        return newItem;
      });
    },
    popupConfigValue() {
      const MSStyle = {
        maxHeight: '394px',
        maxWidth: '280px',
        autoResize: true,
        valueWordWrap: 'wrap'
      };
      return this.useMapPopup ? MSStyle : this.popupConfig;
    },
    highlightLayerIds() {
      return this.popupInfosValue?.flatMap(item => item.layerId) || [];
    },
    sourceLayers() {
      return this.popupInfosValue?.map(item => item.layerId) || [];
    },
    popupBgStyleValue() {
      return { ...(this.tablePopupBgColor || {}), ...(this.popupStyle || {}) };
    },
    selectedLayers() {
      return this.popupInfosValue
        .filter(item => {
          return this.clickedLayers.some(layer => item.layerId.includes(layer.id));
        })
        .map(item => {
          const selectedLayer = this.clickedLayers.find(layer => item.layerId.includes(layer.id));
          return { id: selectedLayer?.id, type: selectedLayer?.type, name: item.title };
        });
    },
    showPopupContent() {
      return Boolean(!this.showSelectLayer && this.currentLayerId);
    },
    isSelectLayer() {
      return this.clickedLayers.length > 0;
    },
    currentLayerName() {
      const info = this.popupInfosValue?.find(item => item.layerId.includes(this.currentLayerId));
      return info?.title || this.currentLayerId;
    },
    popupInfo() {
      return this.popupInfosValue?.find(item => item.layerId.includes(this.currentLayerId)) || {};
    },
    paginationContent() {
      return `${this.currentIndex + 1}/${this.enablePopupDatasLength}`;
    },
    enablePopupDatas() {
      return this.allPopupDatas?.filter((item, index) => !this.allPupDatasDisabled[index]) || [];
    },
    enablePopupDatasLength() {
      return this.enablePopupDatas?.length || 0;
    },
    enableLngLats() {
      return this.lnglats?.filter((item, index) => !this.allPupDatasDisabled[index]) || [];
    },
    currentData() {
      return this.enablePopupDatas[this.currentIndex] || [];
    },
    identifyField() {
      return this.popupInfos?.find(item => {
        return Array.isArray(item.layerId)
          ? item.layerId.includes(this.currentLayerId)
          : item.layerId === this.currentLayerId;
      })?.identifyField;
    }
  },
  watch: {
    useMapPopup() {
      this.removePopup();
      this.removed();
    },
    currentCoordinate: {
      handler(newVal) {
        if (newVal && newVal.length) {
          this.addPopup(newVal, this.$refs.popupRef, this.popupBgStyleValue);
        }
      },
      deep: true
    },
    currentIndex() {
      this.currentCoordinate = this.enableLngLats[this.currentIndex] || [];
    },
    highlightLayerIds: {
      handler(next, prev) {
        if (!isEqual(next, prev)) {
          this.clearPopupData();
          this.viewModel?.setTargetLayers(next, this.sourceLayers);
        }
      },
      deep: true
    },
    layerStyle(val) {
      this.viewModel?.setHighlightStyle(val);
    },
    multiSelect(val) {
      this.viewModel?.setMultiSelection(val);
      this.clearPopupData();
    },
    featureFieldsMap: {
      handler(val) {
        this.viewModel?.setFeatureFieldsMap(val);
      },
      deep: true
    },
    displayFieldsMap: {
      handler(val) {
        this.viewModel?.setDisplayFieldsMap(val);
      },
      deep: true
    },
    clickTolerance(val) {
      this.viewModel?.setClickTolerance(val);
    },
    clickedLngLat(val) {
      if (!val) return;
      this.removePopup();
      this.$nextTick(() => {
        this.currentLayerId = this.getCurrentLayerId();
        if (this.currentLayerId) {
          this.queryFeaturesByLayerId(this.currentLayerId);
        }
        this.currentCoordinate = this.isSelectLayer ? [val.lng, val.lat] : null;
      });
    },
    selectedLayers: {
      handler(val) {
        if (val.length <= 1) {
          this.showSelectLayer = false;
          return;
        }
        if (this.isMultipleClick && this.isSecMultipleClick) {
          this.showSelectLayer = false;
          return;
        }
        this.showSelectLayer = true;
      },
      deep: true
    },
    allPopupDatas: {
      handler(val) {
        if (!val?.length) {
          this.removePopup();
        }
        this.allPupDatasDisabled = val?.map((item, index) => this.allPupDatasDisabled[index] || false) || [];
        this.identifyFieldsOptions = this.identifyField
          ? val?.map((data, index) => {
            const item = data.find(item => item.title === this.identifyField);
            return { label: item.value, value: item.value, checked: !this.allPupDatasDisabled[index] };
          })
          : [];
      },
      deep: true
    },
    enablePopupDatasLength(val) {
      if (this.currentIndex >= val) {
        this.currentIndex = Math.max(val - 1, 0);
      }
      if (val === 0) {
        this.currentIndex = 0;
      }
    },
    lnglats() {
      this.currentCoordinate = this.enableLngLats[this.currentIndex] || [];
      this.currentIndex = this.enableLngLats.length ? this.enableLngLats.length - 1 : 0;
    },
    popupBgStyleValue(val) {
      setPopupArrowStyle(val.backgroundColor);
    },
    currentLayerId() {
      this.contentHeight = '';
    }
  },
  created() {
    this.init();
    this.initPopupViewModel();
  },
  mounted() {
    const resizeCallback = el => {
      this.contentHeight = el.scrollHeight ? el.scrollHeight + 'px' : '';
    };
    this.$nextTick(() => {
      this.addResizeListener(this.$refs.popupContentRef?.$el, resizeCallback);
    });
  },
  beforeDestroy() {
    this.clearPopupData();
    this.removed();
    this.removeResizeListener(this.$refs.popupContentRef?.$el);
  },
  loaded() {
    this.removePopup();
    this.removed();
    this.mapPopupInfos = this.viewModel.webmap._handler.getPopupInfos();
    this.setLayerIds(this.highlightLayerIds, this.sourceLayers);
  },
  methods: {
    init() {
      this.viewModel = new AttributePopupViewModel({
        name: 'popup',
        layerIds: this.highlightLayerIds,
        sourceLayers: this.sourceLayers,
        style: this.layerStyle,
        clickTolerance: this.clickTolerance,
        multiSelection: this.multiSelect,
        eventsCursor: this.eventsCursor
      });
      this.registerEvents();
    },
    registerEvents() {
      this.viewModel.on('layerclick', e => {
        if (!e.isMultipleClick || !e.isSecMultipleClick) {
          this.clickedLayers = e.layers;
        }
        this.clickedLngLat = e.lngLat;
        this.isMultipleClick = e.isMultipleClick;
        this.isSecMultipleClick = e.isSecMultipleClick;
      });
      this.viewModel.on('mapselectionchanged', e => {
        const features = e.features;
        if (features[0]) {
          this.allPopupDatas = e.popupInfos;
          this.lnglats = e.lnglats;
        }
        if (!features[0]) {
          this.clearPopupData();
        }
        this.activeTargetName = e.targetId;
      });
    },
    setLayerIds(layerIds, sourceLayers) {
      this.viewModel?.setTargetLayers(layerIds, sourceLayers);
    },
    queryFeaturesByLayerId(layerId) {
      this.viewModel?.queryFeaturesByLayerId(layerId);
    },
    setHighlightLayerFilter(layerId, identifyFields) {
      this.viewModel?.setHighlightLayerFilter(layerId, identifyFields);
    },
    clearPopupData(clear = true) {
      this.allPopupDatas = [];
      this.lnglats = [];
      if (clear) {
        this.viewModel?.clear();
      }
    },
    removed() {
      this.viewModel?.clear();
    },
    getCurrentLayerId() {
      if (!this.isSelectLayer) {
        return '';
      }
      if (this.isSecMultipleClick) {
        return this.currentLayerId;
      }
      if (this.selectedLayers.length === 1) {
        return this.clickedLayers[0].id;
      }
      return '';
    },
    changeIndex(delta) {
      if (this.currentIndex + delta < 0 || this.currentIndex + delta >= this.enablePopupDatasLength) {
        return;
      }
      this.currentIndex += delta;
    },
    handleSelect(id) {
      this.currentLayerId = id;
      this.showSelectLayer = false;
      this.queryFeaturesByLayerId(this.currentLayerId);
    },
    handleClose() {
      this.showSelectLayer = false;
      this.currentLayerId = '';
      this.removePopup();
      this.removed();
    },
    handleReturn() {
      this.showSelectLayer = true;
      this.currentLayerId = '';
      this.removed();
    },
    handleCheckedChange(e, index) {
      const values = this.identifyFieldsOptions.filter(item => item.checked).map(item => item.value);
      this.setHighlightLayerFilter(this.currentLayerId, { field: this.identifyField, values });
      this.allPupDatasDisabled[index] = !e.target.checked;
    }
  }
};
</script>
