<template>
  <SmLayerHighlight
    uniqueName="identify-popup"
    :layers="layers"
    :highlightStyle="layerStyle"
    :displayFieldsMap="displayFieldsMap"
    :multiSelection="multiSelect"
    :clickTolerance="clickTolerance"
    :eventsCursor="eventsCursor"
    :popupStyle="popupStyle"
    :background="background"
    :textColor="textColor"
    :mapTarget="mapTarget"
    :showPopup="showPopup"
    @mapselectionchanged="handleMapSelectionChanged"
  />
</template>

<script>
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import MapGetter from 'vue-iclient/src/mapboxgl/_mixin/map-getter';
import CircleStyle from 'vue-iclient/src/mapboxgl/_types/CircleStyle';
import FillStyle from 'vue-iclient/src/mapboxgl/_types/FillStyle';
import LineStyle from 'vue-iclient/src/mapboxgl/_types/LineStyle';
import SmLayerHighlight from 'vue-iclient/src/mapboxgl/layer-highlight/LayerHighlight';

export default {
  name: 'SmIdentify',
  mixins: [MapGetter, Theme],
  components: { SmLayerHighlight },
  props: {
    showPopup: {
      type: Boolean,
      default: true
    },
    multiSelect: {
      type: Boolean,
      default: false
    },
    layers: {
      type: Array,
      default() {
        return [];
      }
    },
    fields: {
      type: Array,
      default() {
        return [];
      }
    },
    clickTolerance: {
      type: Number,
      default: 5
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
          strokeLine: new LineStyle({
            'line-width': 3,
            'line-color': '#409eff',
            'line-opacity': 1
          })
        };
      }
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    keyMaxWidth: {
      type: [Number, String],
      default: 110
    },
    valueMaxWidth: {
      type: [Number, String],
      default: 170
    },
    keyWidth: {
      type: [Number, String],
      default: 110
    },
    valueWidth: {
      type: [Number, String],
      default: 170
    }
  },
  data() {
    return {
      eventsCursor: { mousemove: 'mousemove', mouseleave: 'grab' }
    };
  },
  computed: {
    popupStyle() {
      return {
        keyWidth: this.keyWidth,
        valueWidth: this.valueWidth,
        keyMaxWidth: this.keyMaxWidth,
        valueMaxWidth: this.valueMaxWidth,
        autoResize: this.autoResize
      };
    },
    displayFieldsMap() {
      return this.layers && this.layers.reduce((list, layerId, index) => {
        let fields;
        if (this.fields instanceof Array) {
          // 如果是二维数组
          fields = this.fields[index];
          // 兼容一维数组
          if (typeof fields === 'string') {
            fields = this.fields;
          }
        } else if (this.fields instanceof Object && index === 0) {
          fields = [this.fields];
        }
        const fieldsFormatter = fields && fields.map(field => {
          const isObjArr = field instanceof Object;
          return isObjArr ? field : {
            field: field,
            title: field
          };
        });
        list[layerId] = fieldsFormatter;
        return list;
      }, {});
    }
  },
  methods: {
    handleMapSelectionChanged(e) {
      this.$emit('datachange', { ...e, fields: this.displayFieldsMap[e.targetId] });
    }
  }
};
</script>
