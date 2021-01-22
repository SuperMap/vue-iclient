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
    class="sm-component-fill-extrusion"
  >
    <div class="sm-component-fill-extrusion__content">
      <div class="content-item">
        <label>{{ $t('fillExtrusion.polygonLayer') }}</label>
        <sm-layer-select
          v-model="editLayerSelected"
          :style="getBackgroundStyle"
          :dropdown-style="collapseCardBackgroundStyle"
          :get-popup-container="triggerNode => triggerNode.parentElement"
          :filter="filterSourceAndLayer"
          @change="getSourceLayerFields"
        />
      </div>
      <template v-if="currentFillExtrusionOption">
        <div class="content-item">
          <label>{{ $t('fillExtrusion.hideOriginalLayer') }}</label>
          <sm-switch v-model="currentFillExtrusionOption.hideOriginLayer" :style="disabledTextColorStyle" />
        </div>
        <div class="content-item">
          <label />
          <sm-radio-group v-model="currentFillExtrusionOption.heightFieldWay" name="radiogroup">
            <sm-radio v-if="currentFillExtrusionOption.fields.length > 0" value="default">
              {{ $t('fillExtrusion.fieldName') }}
            </sm-radio>
            <sm-radio v-else value="customField">
              {{ $t('fillExtrusion.fieldName') }}
            </sm-radio>
            <sm-radio value="customNum">
              {{ $t('fillExtrusion.customNum') }}
            </sm-radio>
          </sm-radio-group>
        </div>
        <div class="content-item">
          <label>{{ $t('fillExtrusion.height') }}</label>
          <sm-select
            v-if="currentFillExtrusionOption.heightFieldWay === 'default'"
            v-model="currentFillExtrusionOption.heightField"
            :options="currentFillExtrusionOption.fields"
            :style="getBackgroundStyle"
            :dropdownStyle="collapseCardBackgroundStyle"
            :getPopupContainer="triggerNode => triggerNode.parentElement"
          />
          <sm-input
            v-if="currentFillExtrusionOption.heightFieldWay === 'customField'"
            v-model="currentFillExtrusionOption.customField"
            :style="getBackgroundStyle"
            :placeholder="$t('fillExtrusion.customFieldPlaceholder')"
          />
          <div v-if="currentFillExtrusionOption.heightFieldWay === 'customNum'" class="content-holder">
            <sm-slider v-model="currentFillExtrusionOption.height" :min="0" :max="1000" />
            <sm-input-number v-model="currentFillExtrusionOption.height" :style="getBackgroundStyle" />
          </div>
        </div>
        <div v-if="currentFillExtrusionOption.heightFieldWay !== 'customNum'" class="content-item">
          <label>{{ $t('fillExtrusion.multiple') }}</label>
          <sm-input-number v-model="currentFillExtrusionOption.multiple" :style="getBackgroundStyle" />
        </div>
        <div class="content-item">
          <label>{{ $t('fillExtrusion.fillColor') }}</label>
          <sm-color-picker v-model="currentFillExtrusionOption.color" />
        </div>
        <div class="content-item">
          <label>{{ $t('fillExtrusion.layerOpacity') }}</label>
          <sm-input-number
            v-model="currentFillExtrusionOption.opacity"
            :max="1"
            :min="0"
            :step="0.1"
            :style="getBackgroundStyle"
          />
        </div>
        <div class="content-item">
          <label />
          <sm-button type="primary" @click="restSourceLayers">{{ $t('fillExtrusion.reset') }}</sm-button>
        </div>
      </template>
    </div>
    <sm-fill-extrusion-layer
      v-for="item in fillExtrusionList"
      :key="item.fillExtrusionLayerId"
      v-bind="getFillExtrusionLayerOptions(item)"
    />
  </sm-collapse-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator';
import Theme from '../../../../common/_mixin/Theme';
import Control from '../../../_mixin/control';
import MapGetter from '../../../_mixin/map-getter';
import BaseCard from '../../../../common/_mixin/Card';
import SmLayerSelect from '../../../../common/layer-select/LayerSelect.vue';
import SmSelect from '../../../../common/select/Select.vue';
import SmSwitch from '../../../../common/switch/Switch.vue';
import SmRadioGroup from '../../../../common/radio/Group.vue';
import SmRadio from '../../../../common/radio/Radio.vue';
import SmInput from '../../../../common/input/Input.vue';
import SmInputNumber from '../../../../common/input/Number.vue';
import SmSlider from '../../../../common/slider/Slider.vue';
import SmColorPicker from '../../../../common/color-picker/ColorPicker.vue';
import SmFillExtrusionLayer from '../../layer/fill-extrusion/FillExtrusionLayer.vue';
import FillExtrusionViewModel, {
  sourceListParams,
  layerStyleParams,
  fillExtrusionLayerParams
} from './FillExtrusionViewModel';
import isEqual from 'lodash.isequal';

interface fieldParams {
  label: string;
  value: string;
  title: string;
}

interface fillExtrusionParams {
  selectedType?: string;
  sourceName?: string;
  layerId?: string;
  hideOriginLayer?: boolean;
  fillExtrusionLayerId?: string;
  fields?: fieldParams[];
  heightFieldWay?: string;
  heightField?: string;
  customField?: string;
  multiple?: number;
  height?: number;
  color?: string;
  layerColor?: any;
  opacity?: number;
  sourceLayer?: string;
  minzoom?: number;
  maxzoom?: number;
  filter?: any[];
}

interface fillLayerSelectedOption {
  id: string;
  type: string;
}

interface extraOption {
  id?: string;
  type: string;
  visibility: string;
  source?: string;
  minzoom?: number;
  maxzoom?: number;
  sourceLayer?: string;
}

interface filterOption {
  show?: boolean;
  disabled?: boolean;
}

const TYPE_TO_FIELD_LIST = {
  source: 'sourceName',
  sourceLayer: 'sourceLayer',
  layer: 'layerId'
};

@Component({
  name: 'SmFillExtrusion',
  components: {
    SmLayerSelect,
    SmSelect,
    SmSwitch,
    SmRadioGroup,
    SmRadio,
    SmInput,
    SmInputNumber,
    SmSlider,
    SmColorPicker,
    SmFillExtrusionLayer
  }
})
export default class FillExtrusion extends Mixins(MapGetter, Control, Theme, BaseCard) {
  viewModel: FillExtrusionViewModel;
  sourceList: sourceListParams[];
  fillExtrusionOptions: fillExtrusionParams[] = [];
  editLayerSelected: fillLayerSelectedOption = null;

  @Prop({ default: false }) collapsed: boolean;
  @Prop({ default: 'sm-components-icon-layer-list' }) iconClass: string;
  @Prop({ default: false }) splitLine: boolean;
  @Prop({
    default() {
      return this.$t('fillExtrusion.title');
    }
  })
  headerName: string;

  get currentFillExtrusionOption(): fillExtrusionParams {
    const matchSourceOption = this.getMatchFillExtrusionOption(this.editLayerSelected);
    return matchSourceOption;
  }

  get currentListenerFields() {
    if (!this.currentFillExtrusionOption || this.currentFillExtrusionOption.layerId) {
      return undefined;
    }
    const {
      color,
      customField,
      height,
      heightField,
      heightFieldWay,
      hideOriginLayer,
      multiple,
      opacity
    } = this.currentFillExtrusionOption;
    return {
      color,
      customField,
      height,
      heightField,
      heightFieldWay,
      hideOriginLayer,
      multiple,
      opacity
    };
  }

  get fillExtrusionList(): fillExtrusionParams[] {
    return this.fillExtrusionOptions.filter(item => !!item.layerId);
  }

  get fillExtrusionListWithoutLayerId(): fillExtrusionParams[] {
    return this.fillExtrusionOptions.filter(item => !item.layerId);
  }

  @Watch('currentFillExtrusionOption.hideOriginLayer')
  handleLayerShowChanged(next) {
    if (!this.currentFillExtrusionOption || !this.currentFillExtrusionOption.layerId) {
      return;
    }
    this.handleHideOriginLayerChanged(this.currentFillExtrusionOption.layerId, next);
  }

  @Watch('currentListenerFields')
  handleCurrentListenerFieldsChanged(next, prev) {
    if (!prev || !next || isEqual(next, prev)) {
      return;
    }
    if (!this.currentFillExtrusionOption.layerId) {
      const { type: selectedType, id: selectedId } = this.editLayerSelected;
      const listenFields = Object.keys(next);
      const changedLayerList = [];
      this.fillExtrusionOptions = this.fillExtrusionOptions.map(option => {
        if (
          option.layerId &&
          option.selectedType === 'layer' &&
          option[TYPE_TO_FIELD_LIST[selectedType]] === selectedId
        ) {
          const changeData = {};
          listenFields.forEach(item => {
            if (next[item] !== prev[item] && next[item] !== option[item]) {
              changeData[item] = next[item];
              if (item === 'hideOriginLayer') {
                changedLayerList.push({
                  layerId: option.layerId,
                  hideOriginLayer: next[item]
                });
              }
            }
          });
          return Object.assign({}, option, changeData);
        }
        return option;
      });
      changedLayerList.forEach(option => {
        this.handleHideOriginLayerChanged(option.layerId, option.hideOriginLayer);
      });
    }
  }

  created() {
    this.viewModel = new FillExtrusionViewModel();
  }

  filterSourceAndLayer(data: any, type: string): filterOption {
    if (['source', 'sourceLayer'].includes(type)) {
      const sourceOption = this.viewModel.getSourceOption(data.source || data, data.sourceLayer);
      if (!sourceOption || !sourceOption.layers) {
        return {
          show: false
        };
      }
      if (type === 'source' && sourceOption.sourceLayers) {
        return {
          disabled: true
        };
      }
    } else if (type === 'layer' && data.type !== 'fill') {
      return {
        show: false
      };
    }
    return undefined;
  }

  filterNumericFields(fields: Object): fieldParams[] {
    const fieldOptions: fieldParams[] = [];
    if (fields) {
      for (let key in fields) {
        if (!isNaN(parseFloat(fields[key]))) {
          fieldOptions.push({
            label: key,
            value: key,
            title: key
          });
        }
      }
    }
    return fieldOptions;
  }

  initFillExtrusionOptions(options: fillExtrusionParams): fillExtrusionParams {
    return {
      hideOriginLayer: false,
      heightFieldWay: undefined,
      sourceName: undefined,
      heightField: undefined,
      customField: undefined,
      multiple: 1,
      height: 0,
      opacity: 1,
      ...options,
      color: typeof options.layerColor === 'string' ? options.layerColor : ''
    };
  }

  handleSourceUpdated({ sourceList }): void {
    this.sourceList = sourceList;
  }

  // eslint-disable-next-line
  getMatchLayerData(selectedData: fillLayerSelectedOption, extra: extraOption): mapboxglTypes.Layer {
    const { type: selectedType, id: selectedId } = selectedData;
    // eslint-disable-next-line
    let layerData: mapboxglTypes.Layer;
    switch (selectedType) {
      case 'source':
        layerData = {
          id: undefined,
          source: selectedId
        };
        break;
      case 'sourceLayer':
        layerData = {
          id: undefined,
          source: extra.source,
          'source-layer': selectedId
        };
        break;
      case 'layer':
        const matchLayer = this.viewModel.getLayer(selectedId);
        matchLayer && (layerData = Object.assign({}, matchLayer));
        break;
    }
    return layerData;
  }

  getMatchFillExtrusionOption(selectedData: fillLayerSelectedOption): fillExtrusionParams {
    if (!selectedData || !selectedData.type || !selectedData.id) {
      return undefined;
    }
    const { type: selectedType, id: selectedId } = selectedData;
    const matchSourceOption: fillExtrusionParams = this.fillExtrusionOptions.find(
      option => selectedType === option.selectedType && option[TYPE_TO_FIELD_LIST[selectedType]] === selectedId
    );
    return matchSourceOption;
  }

  getSourceLayerFields(selectedData: fillLayerSelectedOption, label: string[], extra: extraOption): void {
    const layer = this.getMatchLayerData(selectedData, extra);
    const layerId: string = layer.id;
    const matchOption = this.getMatchFillExtrusionOption(selectedData);
    if (matchOption) {
      return;
    }
    // @ts-ignore
    const sourceName: string = layer.source;
    const sourceLayer: string = layer['source-layer'];
    const fields = this.viewModel.getLayerFields(sourceName);
    const filedsOptions = this.filterNumericFields(fields);
    const heightFieldWay = filedsOptions.length > 0 ? 'default' : 'customField';
    const heightField = filedsOptions[0] && filedsOptions[0].value;
    const layerColor = layer.paint && layer.paint['fill-color'];
    const optionData: fillExtrusionParams = {
      selectedType: selectedData.type,
      sourceName,
      layerId,
      sourceLayer,
      fields: filedsOptions,
      heightFieldWay,
      heightField,
      layerColor,
      filter: layer.filter
    };
    if (!layerId) {
      const matchSource = this.viewModel.getSourceOption(sourceName, sourceLayer);
      const layers = matchSource.layers;
      if (!layers) {
        return;
      }
      const options = layers.map(item => {
        return this.initFillExtrusionOptions({
          ...optionData,
          selectedType: 'layer',
          layerId: item.id,
          sourceLayer: item['source-layer'],
          fillExtrusionLayerId: `${item.id}-fill-extrusion-${+new Date()}`,
          layerColor: item.paint && item.paint['fill-color']
        });
      });
      this.fillExtrusionOptions.push(
        ...options,
        this.initFillExtrusionOptions({
          ...optionData,
          fillExtrusionLayerId: `${sourceLayer || sourceName}-fill-extrusion-${+new Date()}`
        })
      );
    } else {
      this.fillExtrusionOptions.push(
        this.initFillExtrusionOptions({
          ...optionData,
          fillExtrusionLayerId: `${layerId}-fill-extrusion-${+new Date()}`
        })
      );
    }
  }

  getFillExtrusionLayerStyle(sourceOption: fillExtrusionParams): layerStyleParams {
    let { color, layerColor, opacity, heightField, customField, height, heightFieldWay, multiple = 1 } = sourceOption;
    height = heightFieldWay === 'customNum' ? height : 0;
    if (heightFieldWay === 'customField') {
      heightField = customField;
    } else if (heightFieldWay === 'customNum') {
      heightField = undefined;
    }
    return {
      paint: {
        'fill-extrusion-color': color || layerColor,
        'fill-extrusion-opacity': opacity,
        'fill-extrusion-height': heightField ? ['*', ['get', heightField], multiple] : height
      }
    };
  }

  getFillExtrusionLayerOptions(sourceOption: fillExtrusionParams): fillExtrusionLayerParams {
    const { sourceName, fillExtrusionLayerId, sourceLayer, minzoom, maxzoom, filter } = sourceOption;
    return {
      layerId: fillExtrusionLayerId,
      sourceId: sourceName,
      layerStyle: this.getFillExtrusionLayerStyle(sourceOption),
      sourceLayer,
      minzoom,
      maxzoom,
      filter
    };
  }

  handleHideOriginLayerChanged(layerId: string, hideOriginLayer: boolean) {
    const value = hideOriginLayer ? 'none' : 'visible';
    this.viewModel.toggleShowCorrespondingLayer(layerId, value);
  }

  restSourceLayers(): void {
    this.fillExtrusionList.forEach(item => {
      this.handleHideOriginLayerChanged(item.layerId, false);
    });
    this.fillExtrusionOptions = [];
    this.editLayerSelected = null;
  }
}
</script>
