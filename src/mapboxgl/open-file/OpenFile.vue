<template>
  <div
    :class="['sm-component-open-file', mapboxglClass]"
    :style="[fontStyle]"
  >
    <label for="input_file" class="sm-component-open-file__title">
      <span>{{ text }}</span>
    </label>
    <input
      id="input_file"
      class="sm-component-open-file__input"
      type="file"
      :accept="accept"
      @change="fileSelect($event)"
      @click="preventDefault"
    />
  </div>
</template>

<script>
import Theme from '../../common/_mixin/Theme';
import Control from '../_mixin/control';
import MapGetter from '../_mixin/map-getter';
import OpenFileViewModel from './OpenFileViewModel';
import GeojsonLayer from '../web-map/layer/geojson/GeojsonLayer';
import CircleStyle from '../_types/CircleStyle';
import FillStyle from '../_types/FillStyle';
import LineStyle from '../_types/LineStyle';
import VmUpdater from '../../common/_mixin/VmUpdater';
import Vue from 'vue';

export default {
  name: 'SmOpenFile',
  viewModelProps: ['fitBounds', 'clearLastLayer', 'addToMap'],
  mixins: [Theme, Control, MapGetter, VmUpdater],
  props: {
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
      default() {
        return this.$t('openFile.openFile');
      }
    },
    notify: {
      type: Boolean,
      default: true
    },
    layerStyle: {
      type: Object,
      default: function() {
        return {
          line: new LineStyle(),
          circle: new CircleStyle(),
          fill: new FillStyle()
        };
      }
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
    },
    fontStyle: {
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
      cacheGeojsonLayer: [],
      mapboxglClass: ''
    };
  },
  created() {
    this.viewModel = new OpenFileViewModel();
    // 打开失败
    this.viewModel.on('openfilefailed', this.openfilefailedFn);

    this.viewModel.on('errorfileformat', this.errorfileformatFn);

    this.viewModel.on('openfilesucceeded', this.openfilesucceededFn);
  },
  beforeDestroy() {
    this.viewModel.off('openfilefailed', this.openfilefailedFn);

    this.viewModel.off('errorfileformat', this.errorfileformatFn);

    this.viewModel.off('openfilesucceeded', this.openfilesucceededFn);
  },
  methods: {
    fileSelect(e) {
      this.viewModel && this.viewModel.readFile(e);
    },
    preventDefault(e) {
      const mapNotLoaded = this.mapNotLoadedTip();
      mapNotLoaded && e.preventDefault();
    },
    openfilefailedFn(e) {
      this.notify && this.$message.error(e.message);
      this.$emit('open-file-failed', e);
    },
    errorfileformatFn(e) {
      this.notify && this.$message.error(e.message);
      this.$emit('error-file-format', e);
    },
    openfilesucceededFn(e) {
      let result = e.result;
      if (!result) {
        return;
      }
      if (!e.result.features.length) {
        this.$message({
          message: this.$t('openFile.openEmptyFile'),
          type: 'error'
        });
        this.$emit('open-empty-file', result);
        return;
      }

      if (this.clearLastLayer) {
        const geojsonLayerInstance = this.cacheGeojsonLayer.pop();
        geojsonLayerInstance && geojsonLayerInstance.$destroy();
      }

      if (this.addToMap) {
        let type = this.transformType[result.features[0].geometry.type];

        const GeojsonLayerExtend = Vue.extend(GeojsonLayer);
        const GeojsonLayerInstance = new GeojsonLayerExtend({
          propsData: {
            data: result,
            layerStyle: this.layerStyle[type],
            layerId: e.layerId
          }
        });

        let component = GeojsonLayerInstance.$mount();
        this.cacheGeojsonLayer.push(component);
        const mapTarget = this.getTargetName();
        document.querySelector(`#${mapTarget}`).appendChild(component.$el);
      }

      if (this.fitBounds && this.addToMap) {
        this.viewModel.fitBoundsToData();
      }

      this.notify && this.$message.success(this.$t('openFile.openFileSuccess'));
      this.$emit('open-file-succeeded', result);
    }
  },
  loaded() {
    this.parentIsWebMapOrMap && (this.mapboxglClass = 'mapboxgl-ctrl');
  },
  removed() {
    if (this.cacheGeojsonLayer && this.cacheGeojsonLayer.length) {
      this.cacheGeojsonLayer.forEach(component => {
        component.$destroy();
      });
      this.cacheGeojsonLayer = [];
    }
  }
};
</script>
