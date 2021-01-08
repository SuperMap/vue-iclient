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
        <div class="sm-component-layer-color__layer">
          <span>{{ $t('layerColor.layer') }}</span>
          <sm-select v-model="selectSource">
            <sm-select-option v-for="(source, index) in sourceNames" :key="index" :value="source">
              {{ source }}
            </sm-select-option>
          </sm-select>
          <sm-select v-model="selectLayer">
            <sm-select-option v-for="(layerInfo, index) in selectSourceLayers" :key="index" :value="layerInfo.value">
              {{ layerInfo.value }}
            </sm-select-option>
          </sm-select>
        </div>
        <div v-if="propertyList.length > 1" class="sm-component-layer-color__layer-color-type">
          <span>{{ $t('layerColor.property') }}</span>
          <sm-select v-model="selectProperty">
            <sm-select-option v-for="(property, index) in propertyList" :key="index" :value="property">
              {{ propertyMap[property] }}
            </sm-select-option>
          </sm-select>
        </div>
        <div class="sm-component-layer-color__color-picker">
          <span>{{ $t('layerColor.color') }}</span>
          <sm-color-picker v-show="selectLayer" v-model="colorValue"></sm-color-picker>
        </div>
        <div class="sm-component-layer-color__btn-group">
          <sm-button v-if="allowReset" type="primary" size="small" @click="resetAllLayerColor">{{
            $t('layerColor.reset')
          }}</sm-button>
          <sm-button v-if="allowIdentify" type="primary" size="small" @click="toggleSelectLayer">{{ isSelect ? this.$t('layerColor.deselect') : this.$t('layerColor.select') }}</sm-button>
        </div>
      </div>
    </sm-card>
  </sm-collapse-card>
</template>

<script>
import Theme from '../../../../common/_mixin/Theme';
import Control from '../../../_mixin/control';
import MapGetter from '../../../_mixin/map-getter';
import BaseCard from '../../../../common/_mixin/Card';
import SmCard from '../../../../common/card/Card';
import SmCollapsePanel from '../../../../common/collapse/Panel';
import LayerColorViewModel from './LayerColorViewModel';
import clonedeep from 'lodash.clonedeep';
import SmSelect from '../../../../common/select/Select';
import SmColorPicker from '../../../../common/color-picker/ColorPicker';

const TYPE_MAP = {
  circle: ['circle-color', 'circle-stroke-color'],
  line: ['line-color'],
  fill: ['fill-color', 'fill-outline-color'],
  symbol: ['icon-color', 'icon-halo-color', 'text-color', 'text-halo-color']
};

export default {
  name: 'SmLayerColor',
  components: {
    SmCard,
    SmSelect,
    SmCollapsePanel,
    SmColorPicker
  },
  mixins: [MapGetter, Control, Theme, BaseCard],
  props: {
    collapsed: {
      type: Boolean, // 是否折叠
      default: true
    },
    iconClass: {
      type: String,
      default: 'sm-components-icon-layer-list'
    },
    splitLine: {
      type: Boolean,
      default: false
    },
    headerName: {
      type: String,
      default() {
        return this.$t('layerColor.title');
      }
    },
    allowReset: {
      type: Boolean,
      default: true
    },
    allowIdentify: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      sourceNames: [],
      layerList: {},
      selectSource: '',
      selectLayer: '',
      selectProperty: '',
      propertyList: [],
      colorValue: '',
      propertyMap: {
        'circle-color': this.$t('layerColor.circleColor'),
        'circle-stroke-color': this.$t('layerColor.circleStrokeColor'),
        'line-color': this.$t('layerColor.lineColor'),
        'fill-color': this.$t('layerColor.fillColor'),
        'fill-outline-color': this.$t('layerColor.fillOutlineColor'),
        'icon-color': this.$t('layerColor.iconColor'),
        'icon-halo-color': this.$t('layerColor.iconHaloColor'),
        'text-color': this.$t('layerColor.textColor'),
        'text-halo-color': this.$t('layerColor.textHaloColor')
      },
      isSelect: false
    };
  },
  computed: {
    selectSourceLayers() {
      return this.layerList[this.selectSource];
    }
  },
  watch: {
    colorValue(val) {
      this.setLayerColor(val);
    },
    sourceNames() {
      if (!this.selectSource) {
        this.selectSource = this.sourceNames[0];
      }
      this.setSelectLayer();
    },
    layerList() {
      if (!this.selectLayer && this.selectSourceLayers) {
        this.selectLayer = this.selectSourceLayers[0].value;
      }
      this.setSelectLayer();
    },
    selectLayer(val) {
      if (val) {
        this.propertyList = this._getLayerColorProperty(val);
        this.selectProperty = this.propertyList[0];
        this.setSelectLayer();
      }
    },
    selectSource(val) {
      if (val) {
        this.selectLayer = this.selectSourceLayers[0].value;
      }
    },
    selectProperty(val) {
      if (val) {
        this.setSelectLayer();
      }
    }
  },
  created() {
    this.viewModel = new LayerColorViewModel();
    this.viewModel.on('changeSelectLayer', this._changeSelectLayer);
  },
  methods: {
    setSelectLayer() {
      if (this.selectLayer && this.selectProperty) {
        const color = this.viewModel.getLayerColor(this.selectLayer, this.selectProperty);
        if (typeof color === 'string') {
          this.colorValue = color || '';
        }
      }
    },
    transformDatas(sourceList) {
      let _sourceList = clonedeep(sourceList);
      let layerList = {};
      let sourceNames = [];
      Object.keys(_sourceList).forEach(sourceName => {
        let source = _sourceList[sourceName];
        if (source.type === 'raster') {
          return;
        }
        sourceNames.push(source.id);
        let layers = source.layers;
        if (!layerList[source.id]) {
          layerList[source.id] = [];
        }
        layers.forEach(layer => {
          layerList[source.id].push({
            value: layer.id,
            type: layer.type
          });
        });
      });
      return { layerList, sourceNames };
    },
    layerUpdate() {
      this.$nextTick(() => {
        this.sourceList = this.viewModel && this.viewModel.initLayerList();
        const { layerList, sourceNames } = this.transformDatas(this.sourceList);
        this.sourceNames = sourceNames;
        this.layerList = layerList;
      });
    },
    setLayerColor(color) {
      if (this.selectLayer && this.selectProperty) {
        this.viewModel.setLayerColor(this.selectLayer, this.selectProperty, color);
      }
    },
    _getLayerColorProperty(layerId) {
      const layerInfo = this.selectSourceLayers.find(layerInfo => {
        return layerInfo.value === layerId;
      });
      return TYPE_MAP[layerInfo.type];
    },
    resetAllLayerColor() {
      this.viewModel.resetAllColor();
      this.setSelectLayer();
    },
    toggleSelectLayer() {
      if (this.isSelect) {
        this.viewModel.endSelectLayer();
        this.isSelect = false;
      } else {
        this.viewModel.startSelectLayer();
        this.isSelect = true;
      }
    },
    _changeSelectLayer(featureInfo) {
      const {
        source,
        layer: { id }
      } = featureInfo;
      this.selectSource = source;
      this.selectLayer = id;
    }
  },
  loaded() {
    !this.parentIsWebMapOrMap && this.$el.classList.add('layer-color-container');
    this.layerUpdate();
    this.layerUpdateFn = this.layerUpdate.bind(this);
    this.viewModel.on('layersUpdated', this.layerUpdateFn);
  },
  removed() {
    this.sourceList = {};
    this.sourceNames = [];
  },
  beforeDestory() {
    this.viewModel && this.viewModel.off('layersUpdated', this.layerUpdateFn);
    this.$options.removed.call(this);
  }
};
</script>
