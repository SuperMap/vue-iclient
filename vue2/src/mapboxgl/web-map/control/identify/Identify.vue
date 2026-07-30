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
    :title="title"
    @mapselectionchanged="handleMapSelectionChanged"
  />
</template>

<script>
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import MapGetter from 'vue-iclient/src/common/_mixin/map-getter';
import { getDefaultLayerStyle } from 'vue-iclient-controllers-mapboxgl/src/types';
import SmLayerHighlight from 'vue-iclient/src/mapboxgl/layer-highlight/LayerHighlight';

export default {
  name: 'SmIdentify',
  mixins: [MapGetter, Theme],
  components: { SmLayerHighlight },
  props: {
    title: {
      type: String
    },
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
        return getDefaultLayerStyle();
      }
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    keyMaxWidth: {
      type: [Number, String],
      default: 100
    },
    valueMaxWidth: {
      type: [Number, String],
      default: 160
    },
    keyWidth: {
      type: [Number, String],
      default: 100
    },
    valueWidth: {
      type: [Number, String],
      default: 160
    },
    keyWordStyle: {
      type: String,
      default: 'ellipsis'
    },
    valueWordStyle: {
      type: String,
      default: 'ellipsis'
    },
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
        keyWordStyle: this.keyWordStyle,
        valueWordStyle: this.valueWordStyle,
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
