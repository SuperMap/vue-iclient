<template>
  <div :class="['sm-widget-open-file',mapboxglClass]">
    <label for="input_file" class="sm-widget-open-file__title">
      <span>{{ $t('openFile.selectFile') }}</span>
    </label>
    <input
      id="input_file"
      class="sm-widget-open-file__input"
      type="file"
      accept=".json, .geojson, .csv, .xlsx, .xls, .shp, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      @change="fileSelect($event)"
    >
  </div>
</template>

<script>
import Theme from '../mixin/theme';
import Control from '../mixin/control';
import MapGetter from '../mixin/map-getter';
import OpenFileViewModel from '../../viewmodel/OpenFileViewModel';
import geoJSONLayer from './GeoJSONLayer';
// import center from '@turf/center';
import bbox from '@turf/bbox';
import Vue from 'vue';

export default {
  name: 'SmOpenFile',
  mixins: [Theme, Control, MapGetter],
  // relativeMap: true,
  props: {
    iconClass: {
      type: String,
      default: 'smwidgets-icons-layer-style'
    },
    fitBounds: {
      type: Boolean,
      default: true
    },
    isAddToMap: {
      type: Boolean,
      default: true
    },
    notify: {
      type: Boolean,
      default: true
    },
    layerStyles: {
      type: Object
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
      mapboxglClass: ''
    };
  },
  methods: {
    fileSelect(e) {
      this.viewModel && this.viewModel.readFile(e);
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
      if (this.isAddToMap) {
        let type = this.transformType[e.result.features[0].geometry.type];

        const geoJSONLayerExtend = Vue.extend(geoJSONLayer);
        const geoJSONLayerInstance = new geoJSONLayerExtend({
          propsData: {
            data: e.result,
            layerStyles: this.layerStyles,
            vectorType: type
          }
        });

        let component = geoJSONLayerInstance.$mount();
        this.map.getContainer().appendChild(component.$el);
      }

      if (this.fitBounds && this.isAddToMap) {
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
