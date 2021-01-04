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
    class="sm-component-map-switch"
  >
    <div class="sm-component-map-switch__panel" :style="headingTextColorStyle">
      <div class="sm-component-map-switch__layers-wrap">
        <div class="sm-component-map-switch__content-holder">
          <div class="sm-component-map-switch__layers">
            <div :class="['layer-item map-item', { 'active-item': currentSelect === 'vec' }]" @click="changeBaseLayer('vec')">
              <div class="sm-component-map-switch__layer-name">{{ $t('tdtMapSwitcher.vector') }}</div>
            </div>
            <div :class="['layer-item image-item', { 'active-item': currentSelect === 'img' }]" @click="changeBaseLayer('img')">
              <div class="sm-component-map-switch__layer-name">{{ $t('tdtMapSwitcher.image') }}</div>
            </div>
            <div :class="['layer-item landform-item', { 'active-item': currentSelect === 'ter' }]" @click="changeBaseLayer('ter')">
              <div class="sm-component-map-switch__layer-name">{{ $t('tdtMapSwitcher.terrain') }}</div>
            </div>
          </div>
          <div v-if="currentSelect" class="sm-component-map-switch__labelSetting">
            <sm-checkbox :checked="labelChecked" @change="togglerLabelLayer($event.target.checked)">
              {{ $t('tdtMapSwitcher.placeName') }}
            </sm-checkbox>
          </div>
        </div>
      </div>
    </div>
  </sm-collapse-card>
</template>

<script>
import Control from '../../_mixin/control.js';
import MapGetter from '../../_mixin/map-getter';
import Card from '../../../common/_mixin/Card';
import Theme from '../../../common/_mixin/Theme';
import SmCheckbox from '../../../common/checkbox/Checkbox';
import TdtMapSwitcherViewModel from './TdtMapSwitcherViewModel';

export default {
  name: 'SmTdtMapSwitcher',
  components: {
    SmCheckbox
  },
  mixins: [Control, MapGetter, Card, Theme],
  props: {
    collapsed: {
      type: Boolean, // 是否折叠
      default: true
    },
    splitLine: {
      type: Boolean,
      default: false
    },
    iconClass: {
      type: String,
      default: 'sm-components-icon-map-switch'
    },
    headerName: {
      type: String,
      default() {
        return this.$t('tdtMapSwitcher.title');
      }
    },
    data: {
      type: Object,
      default() {
        return {
          select: '',
          label: false,
          tk: ''
        };
      }
    }
  },
  data() {
    return {
      labelChecked: true,
      currentSelect: this.data.select
    };
  },
  created() {
    this.viewModel = new TdtMapSwitcherViewModel(this.data.tk);
  },
  methods: {
    changeBaseLayer(type) {
      this.viewModel.changeBaseLayer(type);
      this.togglerLabelLayer(this.labelChecked);
      this.currentSelect = type;
      this.$emit('change-select-map-type', type);
    },
    togglerLabelLayer(checked) {
      this.viewModel.togglerLabelLayer(checked);
      this.labelChecked = checked;
      this.$emit('change-label-status', this.labelChecked);
    }
  },
  loaded() {
    if (this.data.select) {
      this.viewModel.changeBaseLayer(this.data.select);
      this.togglerLabelLayer(this.data.label);
    }
  }
};
</script>
