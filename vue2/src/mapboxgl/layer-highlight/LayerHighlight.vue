<template>
  <SmMapPopup
    v-if="showPopup"
    class="sm-component-layer-highlight"
    :ref="uniqueName"
    :showIcon="multiSelection"
    :data="allPopupDatas"
    :lnglats="lnglats"
    :defaultIndex="currentIndex"
    :background="background"
    :textColor="textColor"
    :mapTarget="mapTarget"
    :titleRender="titleRender"
    :valueRender="valueRender"
    :showHeader="false"
    :title="displayTitle"
    @change="handleChange"
  />
</template>

<script>
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import MapGetter from 'vue-iclient/src/common/_mixin/map-getter';
import LayerHighlightViewModel from './LayerHighlightViewModel';
import SmMapPopup from 'vue-iclient/src/mapboxgl/map-popup/MapPopup.vue';
import isEqual from 'lodash.isequal';

export default {
  name: 'SmLayerHighlight',
  mixins: [MapGetter, Theme],
  components: { SmMapPopup },
  props: {
    uniqueName: {
      type: String
    },
    title: {
      type: String
    },
    layers: {
      type: Array,
      default() {
        return [];
      }
    },
    highlightStyle: {
      type: Object
    },
    featureFieldsMap: {
      type: Object
    },
    displayFieldsMap: {
      type: Object
    },
    multiSelection: {
      type: Boolean,
      default: false
    },
    clickTolerance: {
      type: Number,
      default: 5
    },
    filter: {
      type: Array
    },
    eventsCursor: {
      type: Object
    },
    popupStyle: {
      type: Object,
      default: () => {
        return {
          autoResize: true,
          keyWidth: 80,
          valueWidth: 150,
          keyMaxWidth: 160,
          valueMaxWidth: 300,
          keyWordStyle: 'ellipsis',
          valueWordStyle: 'ellipsis'
        };
      }
    },
    customColumnRenders: {
      type: Object
    },
    showPopup: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      currentIndex: 0,
      allPopupDatas: [],
      lnglats: [],
      activeTargetName: ''
    };
  },
  computed: {
    popupProps() {
      return this.allPopupDatas[this.currentIndex] || [];
    },
    columnStyle() {
      const {
        autoResize,
        keyWidth,
        valueWidth,
        keyMaxWidth,
        valueMaxWidth,
        keyWordStyle,
        valueWordStyle
      } = this.popupStyle;
      const style = { keyStyle: {}, valueStyle: {} };
      if (!autoResize) {
        if (keyWidth) {
          style.keyStyle.width = keyWidth + 'px';
        }
        if (valueWidth) {
          style.valueStyle.width = valueWidth + 'px';
        }
      } else {
        if (keyMaxWidth) {
          style.keyStyle.maxWidth = keyMaxWidth + 'px';
        }
        if (valueMaxWidth) {
          style.valueStyle.maxWidth = valueMaxWidth + 'px';
        }
      }
      const ellipsisStyle = {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      };
      if (keyWordStyle === 'ellipsis') {
        style.keyStyle = { ...style.keyStyle, ...ellipsisStyle, height: '22px' };
      }
      if (valueWordStyle === 'ellipsis') {
        style.valueStyle = { ...style.valueStyle, ...ellipsisStyle };
      }
      return style;
    },
    displayTitle() {
      return this.title || this.activeTargetName;
    }
  },
  watch: {
    layers(next, prev) {
      if (!isEqual(next, prev)) {
        this.clearPopupData();
        this.viewModel && this.viewModel.setTargetLayers(next);
      }
    },
    highlightStyle(next) {
      this.viewModel && this.viewModel.setHighlightStyle(next);
    },
    multiSelection(next) {
      this.viewModel && this.viewModel.setMultiSelection(next);
      this.clearPopupData();
    },
    featureFieldsMap(next) {
      this.viewModel && this.viewModel.setFeatureFieldsMap(next);
    },
    displayFieldsMap(next) {
      this.viewModel && this.viewModel.setDisplayFieldsMap(next);
    },
    clickTolerance(next) {
      this.viewModel && this.viewModel.setClickTolerance(next);
    }
  },
  created() {
    this.viewModel = new LayerHighlightViewModel({
      name: this.uniqueName,
      layerIds: this.layers,
      style: this.highlightStyle,
      featureFieldsMap: this.featureFieldsMap,
      displayFieldsMap: this.displayFieldsMap,
      clickTolerance: this.clickTolerance,
      multiSelection: this.multiSelection,
      eventsCursor: this.eventsCursor
    });
    this.registerEvents();
  },
  removed() {
    this.clearPopupData();
  },
  methods: {
    titleRender(text) {
      return (
        <div style={this.columnStyle.keyStyle} title={text}>
          {text}
        </div>
      );
    },
    valueRender(text, record) {
      let targetField;
      Object.keys(this.displayFieldsMap).forEach((layerID) => {
        targetField = this.displayFieldsMap[layerID]?.find((item) => {
          return item.title === record.title || item.field === record.title;
        });
      });
      const slotName = targetField?.slotName;
      const valueCustomRender =
        slotName &&
        ((this.customColumnRenders || {})[slotName] ||
          (this.$parent && this.$parent.$scopedSlots[slotName]));
      const style = this.columnStyle.valueStyle;
      if (valueCustomRender) {
        return (
          <div style={style} title={text}>
            {valueCustomRender({ value: text, style })}
          </div>
        );
      }
      return (
        <div style={style} title={text}>
          {text}
        </div>
      );
    },
    registerEvents() {
      this.viewModel.on('mapselectionchanged', e => {
        const features = e.features;
        if (features[0]) {
          this.allPopupDatas = e.popupInfos;
          this.lnglats = e.lnglats;
          this.currentIndex = this.lnglats.length - 1;
        }
        if (!features[0]) {
          this.clearPopupData();
        }
        this.mapSelectionsParams = {
          ...e,
          dataSeletionIndex: this.currentIndex,
          layerName: e.targetId
        };
        this.activeTargetName = e.targetId;
        this.$emit('mapselectionchanged', this.mapSelectionsParams);
      });
    },
    handleChange(index) {
      this.currentIndex = index;
      this.$emit('mapselectionchanged', { ...this.mapSelectionsParams, dataSeletionIndex: this.currentIndex });
    },
    clearPopupData(clear = true) {
      this.allPopupDatas = [];
      this.lnglats = [];
      this.currentIndex = 0;
      clear && this.viewModel && this.viewModel.clear();
    },
    updateHighlightDatas(data) {
      this.clearPopupData(false);
      this.viewModel && this.viewModel.updateHighlightDatas(data);
    }
  }
};
</script>
