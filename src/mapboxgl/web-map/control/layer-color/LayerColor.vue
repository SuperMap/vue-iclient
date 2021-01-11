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
          <sm-select v-model="selectLayer">
            <sm-opt-group v-for="(source, index) in sourceNames" :key="index" :label="source">
              <sm-select-option
                v-for="(layerInfo, index1) in selectSourceLayers(source)"
                :key="index1"
                :value="layerInfo.value"
              >
                {{ layerInfo.value }}
              </sm-select-option>
            </sm-opt-group>
          </sm-select>
        </div>
        <!-- <div v-if="propertyList.length > 1" class="sm-component-layer-color__layer-color-type">
          <span>{{ $t('layerColor.property') }}</span>
          <sm-select v-model="selectProperty">
            <sm-select-option v-for="(property, index) in propertyList" :key="index" :value="property">
              {{ propertyMap[property] }}
            </sm-select-option>
          </sm-select>
        </div> -->
        <div v-for="(propertyInfo, index) in propertyList" :key="index" class="sm-component-layer-color__color-picker">
          <span>{{ propertyMap[propertyInfo.name] }}</span>
          <sm-color-picker
            v-show="selectLayer"
            :value="propertyInfo.color"
            @change="
              color => {
                changePropertyColor(propertyInfo.name, color);
              }
            "
          ></sm-color-picker>
        </div>
        <div class="sm-component-layer-color__btn-group">
          <sm-button v-if="allowIdentify" type="primary" size="small" @click="toggleSelectLayer">{{
            isSelect ? this.$t('layerColor.deselect') : this.$t('layerColor.select')
          }}</sm-button>
          <sm-button v-if="allowReset" type="primary" size="small" @click="resetAllLayerColor">{{
            $t('layerColor.reset')
          }}</sm-button>
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
import SmOptGroup from '../../../../common/select/OptGroup';

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
    SmColorPicker,
    SmOptGroup
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
      layerList: [],
      selectLayer: '',
      selectProperty: '',
      propertyList: [],
      propertyMap: {
        'circle-color': this.$t('layerColor.circleColor'),
        'circle-stroke-color': this.$t('layerColor.strokeColor'),
        'line-color': this.$t('layerColor.lineColor'),
        'fill-color': this.$t('layerColor.fillColor'),
        'fill-outline-color': this.$t('layerColor.strokeColor'),
        'icon-color': this.$t('layerColor.iconColor'),
        'icon-halo-color': this.$t('layerColor.strokeColor'),
        'text-color': this.$t('layerColor.textColor'),
        'text-halo-color': this.$t('layerColor.strokeColor')
      },
      isSelect: false
    };
  },
  computed: {
    selectSourceLayers() {
      return function (sourceName) {
        let res = this.layerList.filter(layerInfo => {
          return layerInfo.source === sourceName;
        });
        return res;
      };
    }
  },
  watch: {
    layerList() {
      if (!this.selectLayer && this.layerList.length) {
        this.selectLayer = this.layerList[0].value;
      }
      this.updateProperty(this.selectLayer);
    },
    selectLayer(val) {
      if (val) {
        this.updateProperty(val);
      }
    }
  },
  created() {
    this.viewModel = new LayerColorViewModel();
    this.viewModel.on('changeSelectLayer', this._changeSelectLayer);
  },
  methods: {
    getPropertyColor(propertyName) {
      if (this.selectLayer) {
        const color = this.viewModel.getLayerColor(this.selectLayer, propertyName);
        if (typeof color === 'string') {
          return color || '';
        }
      }
    },
    transformDatas(sourceList) {
      let _sourceList = clonedeep(sourceList);
      let layerList = [];
      let sourceNames = [];
      Object.keys(_sourceList).forEach(sourceName => {
        let source = _sourceList[sourceName];
        if (source.type === 'raster') {
          return;
        }
        sourceNames.push(source.id);
        let layers = source.layers;
        layers.forEach(layer => {
          layerList.push({
            source: source.id,
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
    _getLayerColorProperty(layerId) {
      const layerInfo = this.layerList.find(layerInfo => {
        return layerInfo.value === layerId;
      });
      const propertyList = TYPE_MAP[layerInfo.type];
      return propertyList.map(name => {
        return { name, color: '' };
      });
    },
    resetAllLayerColor() {
      this.viewModel.resetAllColor();
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
    changePropertyColor(property, color) {
      if (this.selectLayer) {
        this.viewModel.setLayerColor(this.selectLayer, property, color);
      }
    },
    updateProperty(layerId) {
      this.propertyList = this._getLayerColorProperty(layerId);
      if (this.propertyList.length) {
        for (let info of this.propertyList) {
          let color = this.getPropertyColor(info.name);
          if (color) {
            info.color = color;
          }
        }
      }
    },
    _changeSelectLayer(featureInfo) {
      const {
        layer: { id }
      } = featureInfo;
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
