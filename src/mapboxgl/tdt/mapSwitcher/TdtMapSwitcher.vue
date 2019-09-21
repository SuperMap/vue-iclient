<template>
  <sm-card
    v-show="isShow"
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :background="background"
    :textColor="textColor"
    class="sm-component-map-switch"
  >
    <div class="sm-component-map-switch__panel" :style="[getBackgroundStyle, getTextColorStyle]">
      <transition name="sm-component-zoom-in">
        <div class="sm-component-map-switch__layers-wrap">
          <div class="sm-component-map-switch__content-holder">
            <div class="sm-component-map-switch__layers">
              <div class="layer-item map-item" @click="changeBaseLayer('vec')">
                <div class="sm-component-map-switch__layer-name">{{ $t('tdtMapSwitcher.vector') }}</div>
              </div>
              <div class="layer-item image-item" @click="changeBaseLayer('img')">
                <div class="sm-component-map-switch__layer-name">{{ $t('tdtMapSwitcher.image') }}</div>
              </div>
              <div class="layer-item landform-item" @click="changeBaseLayer('ter')">
                <div class="sm-component-map-switch__layer-name">{{ $t('tdtMapSwitcher.terrain') }}</div>
              </div>
            </div>
            <div v-if="currentSelect" class="sm-component-map-switch__labelSetting">
              <span>{{ $t('tdtMapSwitcher.placeName') }}</span>
              <a-checkbox
                :checked="labelChecked"
                @change="togglerLabelLayer($event.target.checked)"
              />
            </div>
          </div>
        </div>
      </transition>
    </div>
  </sm-card>
</template>

<script>
import Control from '../../_mixin/control.js';
import MapGetter from '../../_mixin/map-getter';
import Card from '../../../common/_mixin/card';
import Theme from '../../../common/_mixin/theme';
import TdtMapSwitcherViewModel from './TdtMapSwitcherViewModel';

export default {
  name: 'SmTdtMapSwitcher',
  mixins: [Control, MapGetter, Card, Theme],
  props: {
    iconClass: {
      type: String,
      default: 'sm-components-icons-baselayer'
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
    this.viewModel = new TdtMapSwitcherViewModel(this.map, this.data.tk);
    if (this.data.select) {
      this.viewModel.changeBaseLayer(this.data.select);
      this.togglerLabelLayer(this.data.label);
    }
  }
};
</script>
