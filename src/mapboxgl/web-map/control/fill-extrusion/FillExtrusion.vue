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
        <sm-select
          v-model="editLayerId"
          :style="getBackgroundStyle"
          :dropdownStyle="collapseCardBackgroundStyle"
          @change="getSourceLayerFields"
        >
          <sm-select-opt-group
            v-for="(sourceLayers, sourceName) in sourceLayerList"
            :key="sourceName"
            :label="sourceName"
          >
            <sm-select-option v-for="layer in sourceLayers" :key="layer.id" :value="layer.id" :title="layer.id">
              {{ layer.id }}
            </sm-select-option>
          </sm-select-opt-group>
        </sm-select>
      </div>
      <template v-if="currentFillExtrusionOption">
        <div class="content-item">
          <label>{{ $t('fillExtrusion.height') }}</label>
          <div class="item-content">
            <sm-radio-group v-model="currentFillExtrusionOption.heightFieldWay" name="radiogroup">
              <sm-radio v-if="currentFillExtrusionOption.fields.length > 0" value="default">
                {{ $t('fillExtrusion.choiceField') }}
              </sm-radio>
              <sm-radio v-else value="customField">
                {{ $t('fillExtrusion.customField') }}
              </sm-radio>
              <sm-radio value="customNum">
                {{ $t('fillExtrusion.customNum') }}
              </sm-radio>
            </sm-radio-group>
            <sm-select
              v-if="currentFillExtrusionOption.heightFieldWay === 'default'"
              v-model="currentFillExtrusionOption.heightField"
              :options="currentFillExtrusionOption.fields"
              :style="getBackgroundStyle"
              :dropdownStyle="collapseCardBackgroundStyle"
            />
            <sm-input
              v-if="currentFillExtrusionOption.heightFieldWay === 'customField'"
              v-model="currentFillExtrusionOption.customField"
              :style="getBackgroundStyle"
            />
            <sm-input-number
              v-if="currentFillExtrusionOption.heightFieldWay === 'customNum'"
              v-model="currentFillExtrusionOption.height"
              :style="getBackgroundStyle"
            />
          </div>
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
      v-for="item in fillExtrusionOptions"
      :key="item.fillExtrusionLayerId"
      v-bind="getFillExtrusionLayerOptions(item)"
    />
  </sm-collapse-card>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import Theme from '../../../../common/_mixin/Theme';
import Control from '../../../_mixin/control';
import MapGetter from '../../../_mixin/map-getter';
import BaseCard from '../../../../common/_mixin/Card';
import SmSelect from '../../../../common/select/Select.vue';
import SmSelectOptGroup from '../../../../common/select/OptGroup.vue';
import SmSelectOption from '../../../../common/select/Option.vue';
import SmRadioGroup from '../../../../common/radio/Group.vue';
import SmRadio from '../../../../common/radio/Radio.vue';
import SmInput from '../../../../common/input/Input.vue';
import SmInputNumber from '../../../../common/input/Number.vue';
import SmColorPicker from '../../../../common/color-picker/ColorPicker.vue';
import SmFillExtrusionLayer from '../../layer/fill-extrusion/FillExtrusionLayer.vue';
import FillExtrusionViewModel, {
  sourceLayerListParams,
  layerStyleParams,
  fillExtrusionLayerParams
} from './FillExtrusionViewModel';

interface fieldParams {
  label: string;
  value: string;
}

interface fillExtrusionParams {
  sourceName?: string;
  layerId?: string;
  fillExtrusionLayerId?: string;
  fields?: fieldParams[];
  heightFieldWay?: string;
  heightField?: string;
  customField?: string;
  height?: number;
  color?: string;
  layerColor?: any;
  opacity?: number;
  sourceLayer?: string;
  minzoom?: number;
  maxzoom?: number;
  filter?: any[];
}

@Component({
  name: 'SmFillExtrusion',
  components: {
    SmSelect,
    SmSelectOptGroup,
    SmSelectOption,
    SmRadioGroup,
    SmRadio,
    SmInput,
    SmInputNumber,
    SmColorPicker,
    SmFillExtrusionLayer
  }
})
export default class FillExtrusion extends Mixins(MapGetter, Control, Theme, BaseCard) {
  viewModel: FillExtrusionViewModel;
  sourceLayerList: sourceLayerListParams = {};
  fillExtrusionOptions: fillExtrusionParams[] = [];
  editLayerId: string = '';

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
    const matchSourceOption: fillExtrusionParams = this.fillExtrusionOptions.find(
      item => item.layerId === this.editLayerId
    );
    return matchSourceOption;
  }

  created() {
    this.viewModel = new FillExtrusionViewModel();
    this.viewModel.on('sourcesupdated', this.getSourceNames);
  }

  initFillExtrusionOptions(options: fillExtrusionParams): fillExtrusionParams {
    return {
      heightFieldWay: undefined,
      sourceName: undefined,
      heightField: undefined,
      customField: undefined,
      height: 0,
      opacity: 1,
      ...options,
      color: typeof options.layerColor === 'string' ? options.layerColor : ''
    };
  }

  getSourceNames({ sourceLayerList }): void {
    this.sourceLayerList = sourceLayerList;
  }

  getSourceLayerFields(layerId: string): void {
    const matchOption: fillExtrusionParams = this.fillExtrusionOptions.find(item => item.layerId === layerId);
    if (matchOption) {
      return;
    }
    const layer = this.viewModel.getLayer(layerId);
    // @ts-ignore
    const sourceName: string = layer.source;
    const fields = this.viewModel.getLayerFields(sourceName);
    const filedsOptions = [];
    if (fields) {
      for (let key in fields) {
        if (!isNaN(parseFloat(fields[key]))) {
          filedsOptions.push({
            label: key,
            value: key
          });
        }
      }
    }
    const heightFieldWay = filedsOptions.length > 0 ? 'default' : 'customField';
    const heightField = filedsOptions[0] && filedsOptions[0].value;
    const layerColor = this.viewModel.getFillColorOfLayer(layerId);
    this.fillExtrusionOptions.push(
      this.initFillExtrusionOptions({
        sourceName,
        fields: filedsOptions,
        heightFieldWay,
        heightField,
        layerId,
        fillExtrusionLayerId: `${layerId}-fill-extrusion-${+new Date()}`,
        layerColor,
        sourceLayer: layer['sourceLayer'],
        filter: layer.filter
      })
    );
  }

  getFillExtrusionLayerStyle(sourceOption: fillExtrusionParams): layerStyleParams {
    let { color, layerColor, opacity, heightField, customField, height, heightFieldWay } = sourceOption;
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
        'fill-extrusion-height': heightField ? ['get', heightField] : height
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

  restSourceLayers(): void {
    this.fillExtrusionOptions = [];
    this.editLayerId = null;
  }
}
</script>
