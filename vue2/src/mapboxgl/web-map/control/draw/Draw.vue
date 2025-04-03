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
    <div class="sm-component-draw__panel" :style="getTextColorStyle">
      <span
        v-for="item in modes"
        :key="item.icon"
        :class="[
          'sm-component-draw__draw-item',
          { 'sm-component-draw__draw-active': activeMode && activeMode === item.value }
        ]"
        :title="item.title"
        :style="collapseCardHeaderBgStyle"
        @click="updateMode(item.value)"
      >
        <i :class="`sm-components-icon-${item.icon}`"></i>
      </span>
    </div>
  </sm-collapse-card>
</template>

<script lang="ts">
import type { DrawGetOptions } from 'vue-iclient-core/controllers/mapboxgl/types/DrawEvent';
import drawEvent from 'vue-iclient-core/controllers/mapboxgl/types/DrawEvent';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import Card from 'vue-iclient/src/common/_mixin/Card';
import MapGetter from 'vue-iclient/src/common/_mixin/map-getter';
import Control from 'vue-iclient/src/mapboxgl/_mixin/control';
import DrawViewModel from 'vue-iclient-core/controllers/mapboxgl/DrawViewModel';
import uniqueId from 'lodash.uniqueid';
import { Component, Prop, Mixins } from 'vue-property-decorator';
import 'vue-iclient-core/libs/mapbox-gl-draw/mapbox-gl-draw.css';
import { geti18n } from 'vue-iclient/src/common/_lang/index';

@Component({
  name: 'SmDraw',
  removed() {
    this.activeMode = null;
    const targetName = this.getTargetName();
    drawEvent.deleteDrawingState(targetName, this.componentName);
  }
})
class Draw extends Mixins(MapGetter, Control, Theme, Card) {
  activeMode: string = null;
  componentName: string;
  modes: Array<Object> = [
    { icon: 'point', value: 'draw_point', title: 'Point Tool' },
    { icon: 'line', value: 'draw_line_string', title: 'LineString Tool' },
    { icon: 'ploygon', value: 'draw_polygon', title: 'Polygon Tool' },
    { icon: 'delete', value: 'trash', title: 'Delete' }
  ];

  @Prop({ default: 'sm-components-icon-edit' }) iconClass: string;
  @Prop({
    default() {
      return this.$t('draw.draw');
    }
  })
  headerName: string;

  @Prop() defaultLayerStyle: DrawGetOptions['styles'];

  created() {
    this.componentName = uniqueId(this.$options.name);
    this.viewModel = new DrawViewModel(this.componentName, this.defaultLayerStyle, geti18n);
    this.initEvent();
  }

  beforeDestroy() {
    this.viewModel.off('draw-create', this.drawCreateFn);
  }

  initEvent() {
    this.viewModel.on('draw-create', this.drawCreateFn);
  }

  drawCreateFn(data) {
    this.activeMode = null;
    this.$emit('draw-created', data.popupInfo);
  }

  updateMode(mode: string) {
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
        drawEvent.notifyResetDraw(this.$options.name);
      }
    }, 0);
  }

  // 提供对外方法：清空features
  clear() {
    this.activeMode = null;
    this.viewModel && this.viewModel.clearAllFeatures();
  }
}

export default Draw;
</script>

<style lang="scss" scoped></style>
