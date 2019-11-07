<template>
  <sm-card
    v-show="isShow"
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    class="sm-component-draw"
  >
    <div class="sm-component-draw__panel" :style="[getBackgroundStyle, getTextColorStyle]">
      <span
        v-for="item in modes"
        :key="item.icon"
        :class="['sm-component-draw__draw-item', {'sm-component-draw__draw-active': activeMode && activeMode === item.value}]"
        :title="item.title"
        :style="{'--icon-color--hover': colorGroupsData[0]}"
        @click="updateMode(item.value)"
      >
        <i :class="`sm-components-icons-${item.icon}`"></i>
      </span>
    </div>
  </sm-card>
</template>

<script>
import drawEvent from '../../../_types/draw-event';
import Theme from '../../../../common/_mixin/theme';
import Card from '../../../../common/_mixin/card';
import MapGetter from '../../../_mixin/map-getter';
import Control from '../../../_mixin/control';
import DrawViewModel from './DrawViewModel';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

export default {
  name: 'SmDraw',
  mixins: [MapGetter, Control, Theme, Card],
  props: {
    iconClass: {
      type: String,
      default: 'sm-components-icons-edit'
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
    layerStyle: {
      type: Object
    }
  },
  data() {
    return {
      modes: [
        { icon: 'point-layer', value: 'draw_point', title: 'Point Tool' },
        { icon: 'line-layer', value: 'draw_line_string', title: 'LineString Tool' },
        { icon: 'polygon-layer', value: 'draw_polygon', title: 'Polygon Tool' },
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
  loaded() {
    const mapTarget = this.getTargetName();
    this.viewModel = new DrawViewModel(this.map, mapTarget);
    this.initEvent();
  },
  removed(deleteState) {
    this.activeMode = null;
    const targetName = this.getTargetName();
    drawEvent.$options.deletDrawOfMap(targetName);
    this.viewModel && this.viewModel.clear(deleteState);
  },
  beforeDestroy() {
    this.$options.removed.call(this);
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
      this.$options.removed.call(this, false);
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
