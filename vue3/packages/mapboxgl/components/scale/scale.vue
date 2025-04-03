<template>
  <div 
    ref="scaleRef"
    class="sm-component-scale"
    :style="[background && gisControlBgStyle, (textColor && textColorStyle) || { color: colorPrimary } ]"
  >
    <span>{{ content }}</span>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import type { Map } from 'mapbox-gl'
import type { ScaleProps, ScaleEvents } from './types'
import { useMapGetter, useTheme } from '@supermapgis/common/hooks/index.common'
import { useMapControl } from '@supermapgis/mapboxgl/hooks'
import ScaleViewModel from 'vue-iclient-core/controllers/mapboxgl/ScaleViewModel'
import { scalePropsDefault } from './types'

const props = withDefaults(defineProps<ScaleProps>(), scalePropsDefault)
defineEmits<ScaleEvents>()

const scaleRef = ref(null);
const content = ref(null);
const viewModel = new ScaleViewModel({unit: props.unit, maxWidth: props.maxWidth});
const {
  textColorStyle,
  gisControlBgStyle,
  colorPrimary
} = useTheme(props)
useMapGetter<Map>({viewModel})
useMapControl()

const scaleUpdatedFn = (e) => {
  content.value = e.containerContent;
  scaleRef.value.style.width = e.containerWidth;
};

watch(() => props.unit, (newVal) => {
  viewModel?.setUnit(newVal);
});

watch(() => props.maxWidth, (newVal) => {
  viewModel?.setMaxWidth(newVal);
});

onMounted(() => {
  viewModel.on('scaleupdated', scaleUpdatedFn);
});

onBeforeUnmount(() => {
  viewModel.off('scaleupdated', scaleUpdatedFn);
});

</script>