<template>
  <div :class="['sm-widget-open-file',mapboxglClass]">
    <label for="input_file" class="sm-widget-open-file__title">
      <span>{{ text }}</span>
    </label>
    <input
      id="input_file"
      class="sm-widget-open-file__input"
      type="file"
      :accept="accept"
      @change="fileSelect($event)"
    >
  </div>
</template>

<script>
import Theme from '../mixin/theme';
import Control from '../mixin/control';
import MapGetter from '../mixin/map-getter';
import OpenFileViewModel from '../../viewmodel/OpenFileViewModel';
import geoJSONLayer from './GeojsonLayer';
import bbox from '@turf/bbox';
import Vue from 'vue';
import UniqueId from 'lodash.uniqueid';

export default {
  name: 'SmOpenFile',
  mixins: [Theme, Control, MapGetter],
  props: {
    iconClass: {
      type: String,
      default: 'smwidgets-icons-layer-style'
    },
    fitBounds: {
      type: Boolean,
      default: true
    },
    addToMap: {
      type: Boolean,
      default: true
    },
    text: {
      type: String,
      default: '打开文件'
    },
    notify: {
      type: Boolean,
      default: true
    },
    layerStyle: {
      type: Object
    },
    clearLastLayer: {
      type: Boolean,
      default: false
    },
    accept: {
      type: Array,
      default: function() {
        return [
          '.json',
          '.geojson',
          '.csv',
          '.xlsx',
          '.xls',
          '.shp',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel'
        ];
      }
    }
  },
  data() {
    return {
      transformType: {
        Point: 'circle',
        Polygon: 'fill',
        LineString: 'line',
        MultiPolygon: 'fill'
      },
      mapboxglClass: '',
      prevLayerId: ''
    };
  },
  methods: {
    fileSelect(e) {
      this.viewModel && this.viewModel.readFile(e);
    },
    getUniqueId() {
      return UniqueId(`layer-${this.$options.name.toLowerCase()}-`);
    }
  },
  loaded() {
    this.parentIsWebMapOrMap && (this.mapboxglClass = 'mapboxgl-ctrl');
    this.viewModel = new OpenFileViewModel();
    // 打开失败
    this.viewModel.on('openfilefailed', e => {
      this.notify &&
        this.$message({
          message: e.message,
          type: 'error'
        });
      this.$emit('open-file-failed', e);
    });

    this.viewModel.on('errorfileformat', e => {
      this.notify &&
        this.$message({
          message: e.message,
          type: 'error'
        });
      this.$emit('error-file-format', e);
    });

    this.viewModel.on('openfilesucceeded', e => {
      let layerId = this.getUniqueId();

      if (this.clearLastLayer) {
        this.prevLayerId && this.map.removeLayer(this.prevLayerId);
        this.prevLayerId = layerId;
      }

      if (this.addToMap) {
        let type = this.transformType[e.result.features[0].geometry.type];

        const geoJSONLayerExtend = Vue.extend(geoJSONLayer);
        const geoJSONLayerInstance = new geoJSONLayerExtend({
          propsData: {
            data: e.result,
            layerStyle: this.layerStyle[type],
            layerId
          }
        });

        let component = geoJSONLayerInstance.$mount();
        this.map.getContainer().appendChild(component.$el);
      }

      if (this.fitBounds && this.addToMap) {
        this.map.fitBounds(bbox(e.result), { maxZoom: 12 });
      }

      this.notify &&
        this.$message({
          message: this.$t('openFile.openFileSuccess'),
          type: 'success'
        });
      this.$emit('open-file-succeeded', e.result);
    });
  }
};
</script>
