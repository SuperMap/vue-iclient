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
        <label :title="$t('fillExtrusion.polygonLayer')" :style="headingTextColorStyle">{{
          $t('fillExtrusion.polygonLayer')
        }}</label>
        <sm-layer-select
          v-model="editLayerSelected"
          size="middle"
          :style="getBackgroundStyle"
          :dropdown-style="collapseCardBackgroundStyle"
          :get-popup-container="triggerNode => triggerNode.parentElement"
          :filter="filterSourceAndLayer"
          @change="getSourceLayerFields"
        />
      </div>
      <template v-if="currentFillExtrusionOption">
        <div class="content-item">
          <label :title="$t('fillExtrusion.hideOriginalLayer')" :style="headingTextColorStyle">{{
            $t('fillExtrusion.hideOriginalLayer')
          }}</label>
          <sm-switch
            v-model="currentFillExtrusionOption.hideOriginLayer"
            size="small"
            :style="disabledTextColorStyle"
          />
        </div>
        <div class="content-item height-item">
          <label :title="$t('fillExtrusion.height')" :style="headingTextColorStyle">{{
            $t('fillExtrusion.height')
          }}</label>
          <sm-radio-group v-model="currentFillExtrusionOption.heightFieldWay" name="radiogroup" size="middle">
            <sm-radio-button v-if="currentFillExtrusionOption.fields.length > 0" value="default">
              <span :style="currentFillExtrusionOption.heightFieldWay === 'default' ? headingTextColorStyle : null">{{
                $t('fillExtrusion.fieldName')
              }}</span>
            </sm-radio-button>
            <sm-radio-button v-else value="customField">
              <span
                :style="currentFillExtrusionOption.heightFieldWay === 'customField' ? headingTextColorStyle : null"
              >{{ $t('fillExtrusion.fieldName') }}</span
              >
            </sm-radio-button>
            <sm-radio-button value="customNum">
              <span :style="currentFillExtrusionOption.heightFieldWay === 'customNum' ? headingTextColorStyle : null">{{
                $t('fillExtrusion.customNum')
              }}</span>
            </sm-radio-button>
          </sm-radio-group>
        </div>
        <div class="sub-content-holder">
          <div class="content-item">
            <label :title="$t('fillExtrusion.heightValue')" :style="headingTextColorStyle">{{
              $t('fillExtrusion.heightValue')
            }}</label>
            <sm-select
              v-if="currentFillExtrusionOption.heightFieldWay === 'default'"
              v-model="currentFillExtrusionOption.heightField"
              size="middle"
              :options="currentFillExtrusionOption.fields"
              :style="getBackgroundStyle"
              :getPopupContainer="triggerNode => triggerNode.parentElement"
            />
            <sm-input
              v-if="currentFillExtrusionOption.heightFieldWay === 'customField'"
              v-model="currentFillExtrusionOption.customField"
              size="middle"
              :style="getBackgroundStyle"
              :placeholder="$t('fillExtrusion.customFieldPlaceholder')"
            />
            <div v-if="currentFillExtrusionOption.heightFieldWay === 'customNum'" class="content-holder">
              <sm-slider
                v-model="currentFillExtrusionOption.height"
                :min="0"
                :max="1000"
                :tipFormatter="
                  () => {
                    return currentFillExtrusionOption.height;
                  }
                "
              />
              <sm-input-number
                v-model="currentFillExtrusionOption.height"
                size="middle"
                :min="0"
                :style="getBackgroundStyle"
              />
            </div>
          </div>
          <div v-if="currentFillExtrusionOption.heightFieldWay !== 'customNum'" class="content-item">
            <label :title="$t('fillExtrusion.multiple')" :style="headingTextColorStyle">{{
              $t('fillExtrusion.multiple')
            }}</label>
            <sm-input-number
              v-model="currentFillExtrusionOption.multiple"
              size="middle"
              :min="0"
              :style="getBackgroundStyle"
            />
          </div>
        </div>
        <div class="content-item">
          <label :title="$t('fillExtrusion.fillColor')" :style="headingTextColorStyle">{{
            $t('fillExtrusion.fillColor')
          }}</label>
          <sm-color-picker v-model="currentFillExtrusionOption.color" />
        </div>
        <div class="content-item">
          <label :title="$t('fillExtrusion.layerOpacity')" :style="headingTextColorStyle">{{
            $t('fillExtrusion.layerOpacity')
          }}</label>
          <div class="content-holder">
            <sm-slider v-model="currentFillExtrusionOption.opacity" :min="0" :max="1" :step="0.1" />
            <sm-input-number
              v-model="currentFillExtrusionOption.opacity"
              :max="1"
              :min="0"
              :step="0.1"
              size="middle"
              :style="getBackgroundStyle"
            />
          </div>
        </div>
        <div class="content-item">
          <label />
          <sm-button type="primary" size="middle" @click="restSourceLayers">{{ $t('fillExtrusion.reset') }}</sm-button>
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
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import Control from 'vue-iclient/src/mapboxgl/_mixin/control';
import MapGetter from 'vue-iclient/src/mapboxgl/_mixin/map-getter';
import BaseCard from 'vue-iclient/src/common/_mixin/Card';
import SmLayerSelect from 'vue-iclient/src/common/layer-select/LayerSelect.vue';
import SmSelect from 'vue-iclient/src/common/select/Select.vue';
import SmSwitch from 'vue-iclient/src/common/switch/Switch.vue';
import SmRadioGroup from 'vue-iclient/src/common/radio/Group.vue';
import SmRadioButton from 'vue-iclient/src/common/radio/Button.vue';
import SmInput from 'vue-iclient/src/common/input/Input.vue';
import SmInputNumber from 'vue-iclient/src/common/input-number/InputNumber.vue';
import SmSlider from 'vue-iclient/src/common/slider/Slider.vue';
import SmColorPicker from 'vue-iclient/src/common/color-picker/ColorPicker.vue';
import SmButton from 'vue-iclient/src/common/button/Button.vue';
import SmFillExtrusionLayer from 'vue-iclient/src/mapboxgl/web-map/layer/fill-extrusion/FillExtrusionLayer.vue';
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
    SmRadioButton,
    SmInput,
    SmInputNumber,
    SmSlider,
    SmColorPicker,
    SmButton,
    SmFillExtrusionLayer
  },
  removed() {
    this.restSourceLayers();
  }
})
export default class FillExtrusion extends Mixins(MapGetter, Control, Theme, BaseCard) {
  viewModel: FillExtrusionViewModel;
  sourceList: sourceListParams[];
  fillExtrusionOptions: fillExtrusionParams[] = [];
  editLayerSelected: fillLayerSelectedOption = null;
  currentLayerChanged: boolean;

  @Prop({ default: 'sm-components-icon-fill-extension' }) iconClass: string;
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

  @Watch('currentFillExtrusionOption.hideOriginLayer')
  handleLayerShowChanged(next: boolean, prev: boolean) {
    const layerId = this.currentFillExtrusionOption && this.currentFillExtrusionOption.layerId;
    this.currentLayerChanged = false;
    if (prev === void 0 || !layerId || this.currentLayerChanged) {
      return;
    }
    this.handleHideOriginLayerChanged(this.currentFillExtrusionOption, next);
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
                  option: option,
                  hideOriginLayer: next[item]
                });
              }
            }
          });
          return Object.assign({}, option, changeData);
        }
        return option;
      });
      changedLayerList.forEach(item => {
        this.handleHideOriginLayerChanged(item.option, item.hideOriginLayer);
      });
    }
  }

  created() {
    this.viewModel = new FillExtrusionViewModel();
  }

  // eslint-disable-next-line
  filterSourceAndLayer(data: any, type: string, map: mapboxglTypes.Map): filterOption {
    if (['source', 'sourceLayer'].includes(type)) {
      const sourceOption = this.viewModel.getSourceOption(data.source || data, data.sourceLayer, map);
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
    this.currentLayerChanged = true;
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
          fillExtrusionLayerId: undefined
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

  handleHideOriginLayerChanged(item: fillExtrusionParams, hideOriginLayer: boolean) {
    const value = hideOriginLayer ? 'none' : 'visible';
    const fillExtrusionLayerIdList = this.fillExtrusionList.map(item => item.fillExtrusionLayerId);
    this.viewModel.toggleShowCorrespondingLayer({
      value,
      layerId: item.layerId,
      fillExtrusionLayerIdList,
      source: item.sourceName,
      sourceLayer: item.sourceLayer
    });
  }

  restSourceLayers(): void {
    this.fillExtrusionList.forEach(item => {
      this.handleHideOriginLayerChanged(item, false);
    });
    this.fillExtrusionOptions = [];
    this.editLayerSelected = null;
  }
}
</script>
