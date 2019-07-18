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
import mapEvent from '../../../_types/map-event';
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
      default: '绘制'
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
  loaded() {
    const mapTarget = this.getTargetName();
    this.viewModel = new DrawViewModel(this.map, mapTarget);
    this.initEvent();
  },
  removed() {
    this.activeMode = null;
    this.viewModel && this.viewModel.clear();
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
        if ((this.mapTarget && !mapEvent.$options.getMap(this.mapTarget)) || (this.map && !this.map.loaded())) {
          this.$message.destroy();
          this.$message.warning('关联的地图尚未加载完整，请稍后！');
        } else if (this.map && this.map.loaded()) {
          this.activeMode = mode;
          if (mode === 'trash') {
            this.viewModel.trash();
            this.activeMode = null;
            return;
          }
          this.viewModel.openDraw(mode);
          drawEvent.$emit('draw-reset', { componentName: this.$options.name });
        } else {
          this.nonMapTip();
        }
      }, 0);
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
