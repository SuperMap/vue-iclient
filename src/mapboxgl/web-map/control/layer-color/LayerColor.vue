<template>
  <sm-collapse-card
    v-show="isShow"
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :background="background"
    :textColor="textColor"
    :split-line="splitLine"
    class="sm-component-layer-color"
  >
    <sm-card class="sm-component-layer-color__a-card" :bordered="false" :style="headingTextColorStyle">
      <div class="sm-component-layer-color__content">
        <div :class="['sm-component-layer-color__layer', capture && 'select-margin']">
          <span>{{ $t('layerColor.layer') }}</span>
          <sm-layer-select
            ref="layerSelectRef"
            v-model="selectLayer"
            :mapTarget="mapTarget"
            :filter="filtercb"
            @change="handleLayerChange"
          />
        </div>
        <div v-if="capture" :class="['sm-component-layer-color__capture', isSelect && 'selected']">
          <sm-icon
            iconClass="layer-picker"
            :title="$t('layerColor.capture')"
            @click.native="toggleSelectLayer"
          ></sm-icon>
        </div>
        <div
          v-for="(propertyInfo, index) in propertyList"
          :key="index"
          :class="['sm-component-layer-color__color-picker', capture && 'select-margin']"
        >
          <span>{{ propertyMap(propertyInfo.name) }}</span>
          <sm-color-picker
            :value="propertyInfo.color"
            @change="
              color => {
                changePropertyColor(propertyInfo.name, color);
              }
            "
          ></sm-color-picker>
        </div>
        <div class="sm-component-layer-color__btn-group">
          <sm-button v-if="reset" type="primary" size="small" @click="resetAllLayerColor">{{
            $t('layerColor.reset')
          }}</sm-button>
        </div>
      </div>
    </sm-card>
  </sm-collapse-card>
</template>

<script lang="ts">
import { Component, Prop, Mixins } from 'vue-property-decorator';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import Control from 'vue-iclient/src/mapboxgl/_mixin/control';
import MapGetter from 'vue-iclient/src/mapboxgl/_mixin/map-getter';
import BaseCard from 'vue-iclient/src/common/_mixin/Card';
import SmCard from 'vue-iclient/src/common/card/Card.vue';
import SmButton from 'vue-iclient/src/common/button/Button.vue';
import SmIcon from 'vue-iclient/src/common/icon/Icon.vue';
import LayerColorViewModel from './LayerColorViewModel';
import SmColorPicker from 'vue-iclient/src/common/color-picker/ColorPicker.vue';
import SmLayerSelect from 'vue-iclient/src/mapboxgl/layer-select/LayerSelect.vue';

const TYPE_MAP = {
  circle: ['circle-color', 'circle-stroke-color'],
  line: ['line-color'],
  fill: ['fill-color', 'fill-outline-color'],
  background: ['background-color'],
  symbol: ['icon-color', 'icon-halo-color', 'text-color', 'text-halo-color'],
  'line-extrusion': ['line-extrusion-color'],
  'fill-extrusion': ['fill-extrusion-color'],
  'point-extrusion': ['point-extrusion-color'],
  'line-curve-extrusion': ['line-curve-extrusion-color'],
  'line-curve': ['line-curve-color'],
  'heatmap-extrusion': ['heatmap-extrusion-color'],
  radar: ['radar-color']
};

interface selectLayerParams {
  id: string;
  type: string;
  renderLayers: any
}

@Component({
  name: 'SmLayerColor',
  components: {
    SmCard,
    SmButton,
    SmIcon,
    SmColorPicker,
    SmLayerSelect
  }
})
class SmLayerColor extends Mixins(MapGetter, Control, Theme, BaseCard) {
  selectLayer: selectLayerParams = {
    id: '',
    type: '',
    renderLayers: []
  };

  selectProperty: string = '';
  propertyList: Array<string> = [];

  get propertyMap() {
    return name => {
      return {
        'circle-color': this.$t('layerColor.circleColor'),
        'circle-stroke-color': this.$t('layerColor.strokeColor'),
        'line-color': this.$t('layerColor.lineColor'),
        'fill-color': this.$t('layerColor.fillColor'),
        'fill-outline-color': this.$t('layerColor.strokeColor'),
        'icon-color': this.$t('layerColor.iconColor'),
        'icon-halo-color': this.$t('layerColor.strokeColor'),
        'text-color': this.$t('layerColor.textColor'),
        'text-halo-color': this.$t('layerColor.strokeColor'),
        'line-extrusion-color': this.$t('layerColor.lineColor'),
        'fill-extrusion-color': this.$t('layerColor.fillColor'),
        'point-extrusion-color': this.$t('layerColor.circleColor'),
        'line-curve-extrusion-color': this.$t('layerColor.lineColor'),
        'line-curve-color': this.$t('layerColor.lineColor'),
        'heatmap-extrusion-color': this.$t('layerColor.fillColor'),
        'radar-color': this.$t('layerColor.fillColor')
      }[name];
    };
  }

  isSelect: boolean = false;

  @Prop({ default: 'sm-components-icon-layer-color' }) iconClass: string;
  @Prop({
    default() {
      return this.$t('layerColor.title');
    }
  })
  headerName: string;

  @Prop({ default: true }) reset: boolean;
  @Prop({ default: true }) capture: boolean;

  created() {
    this.viewModel = new LayerColorViewModel();
    this.viewModel.on('changeSelectLayer', this._changeSelectLayer);
  }

  getPropertyColor(propertyName) {
    if (this.selectLayer) {
      const { id } = this.selectLayer;
      const color = this.viewModel.getLayerColor(id, propertyName);
      if (typeof color === 'string') {
        return color || '';
      }
    }
    return '';
  }

  filtercb(type) {
    if (type === 'raster' || type === 'heatmap') {
      return {
        show: false
      };
    }
    if (type === 'group') {
      return {
        disabled: true
      };
    }
    return null;
  }

  resetAllLayerColor() {
    this.viewModel.resetAllColor();
    this.selectLayer = {
      id: '',
      type: '',
      renderLayers: []
    };
    this.propertyList = [];
  }

  toggleSelectLayer() {
    if (this.isSelect) {
      this.viewModel.endSelectLayer();
      this.isSelect = false;
    } else {
      this.viewModel.startSelectLayer();
      this.isSelect = true;
    }
  }

  changePropertyColor(property, color) {
    if (this.selectLayer) {
      this.selectLayer.renderLayers.forEach(id => {
        this.viewModel.setLayerColor(id, property, color);
      });
    }
  }

  updateProperty(layerId, type) {
    this.propertyList = this._getLayerColorProperty(layerId, type);
    if (this.propertyList.length) {
      for (let info of this.propertyList) {
        // @ts-ignore
        let color = this.getPropertyColor(info.name);
        if (color) {
          // @ts-ignore
          info.color = color;
        }
      }
    }
  }

  _getLayerColorProperty(layerId, type) {
    const propertyList = TYPE_MAP[type];
    return propertyList.map(name => {
      return { name, color: '' };
    });
  }

  handleLayerChange({ id, type, renderLayers }, label, extra) {
    this.selectLayer.id = id;
    this.selectLayer.type = type;
    this.selectLayer.renderLayers = renderLayers;
    this.updateProperty(id, extra.type);
    if (this.isSelect) {
      this.toggleSelectLayer();
    }
  }

  _changeSelectLayer(featureInfo) {
    const {
      layer: { id, type }
    } = featureInfo;
    this.selectLayer.id = id;
    this.selectLayer.type = type;
    this.selectLayer.renderLayers = [id];
    this.updateProperty(id, type);
  }

  loaded() {
    !this.parentIsWebMapOrMap && this.$el.classList.add('layer-color-container');
  }
}

export default SmLayerColor;
</script>
