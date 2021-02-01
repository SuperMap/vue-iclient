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
          <sm-layer-select ref="layerSelectRef" v-model="selectLayer" :filter="filtercb" @change="handleLayerChange" />
        </div>
        <div :class="['sm-component-layer-color__capture', isSelect && 'selected']">
          <sm-icon
            v-if="allowCapture"
            iconClass="layer-picker"
            :title="$t('layerColor.capture')"
            @click.native="toggleSelectLayer"
          ></sm-icon>
        </div>
        <div v-for="(propertyInfo, index) in propertyList" :key="index" class="sm-component-layer-color__color-picker">
          <span>{{ propertyMap[propertyInfo.name] }}</span>
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
import SmColorPicker from '../../../../common/color-picker/ColorPicker';
import SmOptGroup from '../../../../common/select/OptGroup';
import SmLayerSelect from '../../../../common/layer-select/LayerSelect';

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
    SmCollapsePanel,
    SmColorPicker,
    SmOptGroup,
    SmLayerSelect
  },
  mixins: [MapGetter, Control, Theme, BaseCard],
  props: {
    collapsed: {
      type: Boolean, // 是否折叠
      default: true
    },
    iconClass: {
      type: String,
      default: 'sm-components-icon-layer-color'
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
    allowCapture: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      sourceNames: [],
      selectLayer: {
        id: '',
        type: ''
      },
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
  created() {
    this.viewModel = new LayerColorViewModel();
    this.viewModel.on('changeSelectLayer', this._changeSelectLayer);
  },
  methods: {
    getPropertyColor(propertyName) {
      if (this.selectLayer) {
        const { id } = this.selectLayer;
        const color = this.viewModel.getLayerColor(id, propertyName);
        if (typeof color === 'string') {
          return color || '';
        }
      }
    },
    filtercb(item, type) {
      if (item.type === 'raster') {
        return {
          show: false
        };
      }
      if (type === 'sourceLayer' || type === 'source') {
        return {
          disabled: true
        };
      }
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
        this.viewModel.setLayerColor(this.selectLayer.id, property, color);
      }
    },
    updateProperty(layerId, type) {
      this.propertyList = this._getLayerColorProperty(layerId, type);
      if (this.propertyList.length) {
        for (let info of this.propertyList) {
          let color = this.getPropertyColor(info.name);
          if (color) {
            info.color = color;
          }
        }
      }
    },
    _getLayerColorProperty(layerId, type) {
      const propertyList = TYPE_MAP[type];
      return propertyList.map(name => {
        return { name, color: '' };
      });
    },
    handleLayerChange({ id, type }, label, extra) {
      this.selectLayer.id = id;
      this.selectLayer.type = type;
      this.updateProperty(id, extra.type);
    },
    _changeSelectLayer(featureInfo) {
      const {
        layer: { id, type }
      } = featureInfo;
      this.selectLayer.id = id;
      this.selectLayer.type = type;
      this.updateProperty(id, type);
    }
  },
  loaded() {
    !this.parentIsWebMapOrMap && this.$el.classList.add('layer-color-container');
  }
};
</script>
