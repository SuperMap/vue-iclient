<template>
  <SmMapPopup
    class="sm-component-layer-highlight"
    :ref="uniqueName"
    :showIcon="multiSelection"
    :data="allPopupDatas"
    :lnglats="lnglats"
    :defaultIndex="currentIndex"
    :background="background"
    :textColor="textColor"
    :mapTarget="mapTarget"
    :columns="tablePopupProps.columns"
    :showHeader="false"
    @change="handleChange"
  />
</template>

<script>
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import MapGetter from 'vue-iclient/src/mapboxgl/_mixin/map-getter';
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
          valueMaxWidth: 300
        };
      }
    },
    customColumnRenders: {
      type: Object
    }
  },
  data() {
    return {
      currentIndex: 0,
      allPopupDatas: [],
      lnglats: []
    };
  },
  computed: {
    popupProps() {
      return this.allPopupDatas[this.currentIndex] || [];
    },
    columnStyle() {
      const { autoResize, keyWidth, valueWidth, keyMaxWidth, valueMaxWidth } = this.popupStyle;
      let style = { keyStyle: {}, valueStyle: {} };
      if (!autoResize) {
        if (keyWidth) {
          style.keyStyle.width = keyWidth + 'px';
        }
        if (valueWidth) {
          style.valueStyle.width = valueWidth + 'px';
        }
        return style;
      } else {
        if (keyMaxWidth) {
          style.keyStyle.maxWidth = keyMaxWidth + 'px';
        }
        if (valueMaxWidth) {
          style.valueStyle.maxWidth = valueMaxWidth + 'px';
        }
      }
      return style;
    },
    tablePopupProps() {
      const state = {
        columns: [
          {
            dataIndex: 'attribute',
            customRender: (text, record) => {
              return <div style={this.columnStyle.keyStyle}>{record.alias || text}</div>;
            }
          },
          {
            dataIndex: 'attributeValue',
            customRender: (text, record) => {
              const valueCustomRender = record.slotName && ((this.customColumnRenders || {})[record.slotName] || this.$parent && this.$parent.$scopedSlots[record.slotName]);
              if (valueCustomRender) {
                return <div style={this.columnStyle.valueStyle}>{valueCustomRender({ value: text })}</div>;
              }
              return <div style={this.columnStyle.valueStyle}>{text}</div>;
            }
          }
        ]
      };
      return { ...state, showHeader: false };
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
        this.$emit('mapselectionchanged', e);
      });
    },
    handleChange(index) {
      this.currentIndex = index;
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

