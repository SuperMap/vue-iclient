<template>
  <sm-collapse-card
    v-show="isShow"
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :split-line="splitLine"
    class="sm-component-draw"
  >
    <div class="sm-component-draw__panel" :style="[getBackgroundStyle, getTextColorStyle]">
      <span
        v-for="item in modes"
        :key="item.icon"
        :class="['sm-component-draw__draw-item', {'sm-component-draw__draw-active': activeMode && activeMode === item.value}]"
        :title="item.title"
        @click="updateMode(item.value)"
      >
        <i :class="`sm-components-icon-${item.icon}`"></i>
      </span>
    </div>
  </sm-collapse-card>
</template>

<script>
import drawEvent from '../../../_types/draw-event';
import Theme from '../../../../common/_mixin/Theme';
import Card from '../../../../common/_mixin/Card';
import MapGetter from '../../../_mixin/map-getter';
import Control from '../../../_mixin/control';
import DrawViewModel from './DrawViewModel';
import uniqueId from 'lodash.uniqueid';
import '../../../../../static/libs/mapbox-gl-draw/mapbox-gl-draw.css';

export default {
  name: 'SmDraw',
  mixins: [MapGetter, Control, Theme, Card],
  props: {
    iconClass: {
      type: String,
      default: 'sm-components-icon-edit'
    },
    headerName: {
      type: String,
      default() {
        return this.$t('draw.draw');
      }
    },
    collapsed: {
      type: Boolean, // 是否折叠
      default: true
    },
    splitLine: {
      type: Boolean,
      default: false
    },
    layerStyle: {
      type: Object
    }
  },
  data() {
    return {
      modes: [
        { icon: 'point', value: 'draw_point', title: 'Point Tool' },
        { icon: 'line', value: 'draw_line_string', title: 'LineString Tool' },
        { icon: 'ploygon', value: 'draw_polygon', title: 'Polygon Tool' },
        { icon: 'delete', value: 'trash', title: 'Delete' }
      ],
      activeMode: null
    };
  },
  watch: {
    layerStyle: {
      handler() {
        this.viewModel && this.viewModel.setLayerStyle(this.layerStyle);
      },
      deep: true
    }
  },
  created() {
    this.componentName = uniqueId(this.$options.name);
    this.viewModel = new DrawViewModel(this.componentName);
    this.initEvent();
  },
  removed() {
    this.activeMode = null;
    const targetName = this.getTargetName();
    drawEvent.$options.deleteDrawingState(targetName, this.componentName);
  },
  methods: {
    initEvent() {
      this.viewModel.on('draw-create', data => {
        this.activeMode = null;
        this.$emit('draw-created', data.popupInfo);
      });
    },
    updateMode(mode) {
      setTimeout(() => {
        const mapNotLoaded = this.mapNotLoadedTip();
        if (mapNotLoaded) return;
        if (this.map && this.map.loaded()) {
          this.activeMode = mode;
          if (mode === 'trash') {
            this.viewModel.trash();
            this.activeMode = null;
            this.$emit('draw-removed', {});
            return;
          }
          this.viewModel.openDraw(mode);
          drawEvent.$emit('draw-reset', { componentName: this.$options.name });
        }
      }, 0);
    },
    // 提供对外方法：清空features
    clear() {
      this.activeMode = null;
      this.viewModel && this.viewModel.clearAllFeatures();
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
