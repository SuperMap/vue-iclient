<template>
  <sm-collapse-card
    v-show="isShow"
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName || t('draw.draw')"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :split-line="splitLine"
    class="sm-component-draw"
  >
    <div class="sm-component-draw__panel" :style="textColorStyle">
      <span
        v-for="item in modes"
        :key="item.icon"
        :class="[
          'sm-component-draw__draw-item',
          { 'sm-component-draw__draw-active': activeMode && activeMode === item.value }
        ]"
        :title="item.title"
        :style="gisControlHeaderBgStyle"
        @click="updateMode(item.value)"
      >
        <i :class="`sm-components-icon-${item.icon}`"></i>
      </span>
    </div>
  </sm-collapse-card>
</template>

<script setup lang="ts">
import type { Map } from 'mapbox-gl'
import { ref, onMounted, onBeforeUnmount } from 'vue';
import type { DrawProps, DrawEvents } from './types'
import { drawPropsDefault } from './types'
import { useMapGetter, useLocale, useTheme } from '@supermapgis/common/hooks/index.common'
import { useMapControl } from '@supermapgis/mapboxgl/hooks'
import DrawViewModel from 'vue-iclient-core/controllers/mapboxgl/DrawViewModel';
import uniqueId from 'lodash.uniqueid';
import drawEvent from 'vue-iclient-core/controllers/mapboxgl/types/DrawEvent'
import SmCollapseCard from '@supermapgis/common/components/collapse-card/collapse-card.vue'

const props = withDefaults(defineProps<DrawProps>(), drawPropsDefault)
const emit = defineEmits<DrawEvents>()

const COMPONENT_NAME = 'SmDraw'
const componentName = uniqueId(COMPONENT_NAME)
const { t } = useLocale()
const viewModel = new DrawViewModel(componentName, props.defaultLayerStyle, () => ({ t }));
const {
  textColorStyle,
  gisControlHeaderBgStyle
} = useTheme(props)
const { mapNotLoadedTip, getMap, getTargetName } = useMapGetter<Map>({
  removed,
  viewModel
})
const { isShow } = useMapControl()

const activeMode = ref<string | null>(null);
const modes = [
  { icon: 'point', value: 'draw_point', title: 'Point Tool' },
  { icon: 'line', value: 'draw_line_string', title: 'LineString Tool' },
  { icon: 'ploygon', value: 'draw_polygon', title: 'Polygon Tool' },
  { icon: 'delete', value: 'trash', title: 'Delete' }
];

// 方法
const drawCreateFn = (data: any) => {
  activeMode.value = null;
  emit('draw-created', data.popupInfo);
};

const updateMode = (mode: string) => {
  setTimeout(() => {
    const mapNotLoaded = mapNotLoadedTip();
    console.log(mapNotLoaded)
    if (mapNotLoaded) return;
    if (getMap() && getMap().loaded()) {
      activeMode.value = mode;
      if (mode === 'trash') {
        viewModel.trash();
        activeMode.value = null;
        emit('draw-removed', {});
        return;
      }
      viewModel.openDraw(mode);
      drawEvent.notifyResetDraw(componentName)
    }
  }, 0);
};

// 提供对外方法：清空features
const clear = () => {
  activeMode.value = null;
  viewModel.clearAllFeatures();
};

function removed() {
  activeMode.value = null;
  const targetName = getTargetName();
  drawEvent.deleteDrawingState(targetName, componentName.value);
};

// 生命周期
onMounted(() => {
  viewModel.on('draw-create', drawCreateFn);
});

onBeforeUnmount(() => {
  viewModel.off('draw-create', drawCreateFn);
});
defineExpose({ clear })
</script>
