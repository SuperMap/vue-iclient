<template>
  <component :is="componentId" v-bind="componentProps" @loaded="sourceLayerLoaded"></component>
</template>

<script lang='ts'>
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator';
import MapGetter from 'vue-iclient/src/common/_mixin/map-getter';
import Layer from 'vue-iclient/src/mapboxgl/_mixin/layer';
import SmVectorTileLayer from '../vector-tile/VectorTileLayer.vue';
import SmGeojsonLayer from '../geojson/GeojsonLayer.vue';
import FillExtrusionLayerViewModel, { layerStyleParams } from './FillExtrusionLayerViewModel';
import UniqueId from 'lodash.uniqueid';

@Component({
  name: 'SmFillExtrusionLayer',
  components: {
    SmVectorTileLayer,
    SmGeojsonLayer
  },
  loaded() {
    this.handleDataChanged();
  }
})

class FillExtrusionLayer extends Mixins(MapGetter, Layer) {
  viewModel: FillExtrusionLayerViewModel;
  componentId: string = '';
  componentProps: Object = {};
  layerSourceId: string;

  @Prop() layerStyle: layerStyleParams;
  @Prop() data: any;

  @Watch('sourceId')
  sourceIdChanged(): void {
    this.layerSourceId = this.sourceId;
    this.handleDataChanged();
  }

  @Watch('data')
  dataChanged(): void {
    this.handleDataChanged();
  }

  @Watch('layerStyle')
  layerStyleChanged(): void {
    this.handleLayerStyleChanged();
  }

  created() {
    this.layerSourceId = this.sourceId;
    this.viewModel = new FillExtrusionLayerViewModel(this.$props);
  }

  handleSourceIdChanged() {
    this.viewModel.setSourceId(this.layerSourceId);
  }

  handleDataChanged(): void {
    if (this.data) {
      if (this.data.type === 'FeatureCollection') {
        const layerId = this.sourceId || UniqueId('smgeojsonlayer-fill-extrusion');
        this.componentId = 'SmGeojsonLayer';
        this.componentProps = {
          ...this.$props,
          layerId
        };
        this.layerSourceId = layerId;
      } else if (this.sourceId && this.sourceLayer) {
        this.componentId = 'SmVectorTileLayer';
        this.componentProps = {
          ...this.$props,
          styleOptions: this.data
        };
      }
    } else if (this.sourceId) {
      this.handleSourceIdChanged();
    }
  }

  handleLayerStyleChanged() {
    this.viewModel.setLayerStyle(this.layerStyle);
  }

  sourceLayerLoaded() {
    this.handleSourceIdChanged();
  }
}

export default FillExtrusionLayer;
</script>
