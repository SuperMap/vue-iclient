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
    <div id="miniMap" class="miniMap">
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
import MiniMapViewModel from 'vue-iclient-core/controllers/mapboxgl/MiniMapViewModel'
import { miniMapPropsDefault } from './types'
import SmSpin from '@supermapgis/common/components/spin/Spin'
import SmCollapseCard from '@supermapgis/common/components/collapse-card/collapse-card.vue'

defineOptions({
  name: 'SmMiniMap',
  inheritAttrs: false
})

const props = withDefaults(defineProps<MiniMapProps>(), miniMapPropsDefault)
defineEmits<MiniMapEvents>()

const miniMapRef = ref(null);
const spinning = ref(true);
const miniMap = ref(null);
const viewModel = new MiniMapViewModel();

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
});

onBeforeUnmount(() => {
  viewModel.off('minimaploaded', minimapLoadedFn);
});
</script>