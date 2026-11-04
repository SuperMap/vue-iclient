<template>
  <sm-collapse-card
    ref="miniMapRef"
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :background="background"
    :textColor="textColor"
    :split-line="splitLine"
    class="sm-component-minimap"
    @content-show-state="handleMinimapResize"
  >
    <div id="miniMap" class="miniMap" ref="containerRef">
      <sm-spin v-if="spinning" size="small" :tip="t('info.loading')" :spinning="spinning" />
    </div>
  </sm-collapse-card>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import type { Map } from 'mapbox-gl'
import type { MiniMapProps, MiniMapEvents } from './types'
import { useMapGetter, useLocale, useTheme } from '@supermapgis/common/hooks/index.common'
import { useMapControl } from '@supermapgis/mapboxgl/hooks'
import MiniMapViewModel from '@supermapgis/iclient-components-core/mapboxgl/src/MiniMapViewModel'
import { miniMapPropsDefault } from './types'
import SmSpin from '@supermapgis/common/components/spin/Spin'
import SmCollapseCard from '@supermapgis/common/components/collapse-card/collapse-card.vue'

defineOptions({
  name: 'SmMiniMap'
})

const props = withDefaults(defineProps<MiniMapProps>(), miniMapPropsDefault)
defineEmits<MiniMapEvents>()

const miniMapRef = ref(null);
const spinning = ref(true);
const miniMap = ref(null);
const containerRef = ref<HTMLElement | null>(null);
const viewModel = new MiniMapViewModel();
let resizeObserver: ResizeObserver | undefined;

useTheme(props)
const { t } = useLocale()
useMapGetter<Map>({loaded, viewModel})
useMapControl()

const handleMinimapResize = (state: boolean) => {
  nextTick(() => {
    state && resize();
  });
};

const resize = () => {
  viewModel?.resize();
};

const minimapLoadedFn = (e: { miniMap: Map }) => {
  miniMap.value = e.miniMap;
  spinning.value = false;
};

function loaded() {
  viewModel.setContainer(miniMapRef.value.$el.querySelector('#miniMap') || miniMapRef.value.$el);
}

onMounted(() => {
  miniMap.value?.remove();
  viewModel.on('minimaploaded', minimapLoadedFn);

  // 容器尺寸变化时重新测量地图，否则显示区域会停留在旧尺寸
  const el = containerRef.value;
  if (!el || typeof ResizeObserver === 'undefined') {
    return;
  }
  resizeObserver = new ResizeObserver(() => {
    if (el.clientWidth > 0 && el.clientHeight > 0) {
      resize();
    }
  });
  resizeObserver.observe(el);
});

onBeforeUnmount(() => {
  viewModel.off('minimaploaded', minimapLoadedFn);
  resizeObserver?.disconnect();
});
</script>