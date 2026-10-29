<template>
  <div 
    ref="scaleRef"
    class="sm-component-scale"
    :style="[background && gisControlBgStyle, textColorStyle ]"
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
import ScaleViewModel from 'vue-iclient-controllers-mapboxgl/src/ScaleViewModel'
import { scalePropsDefault } from './types'

const props = withDefaults(defineProps<ScaleProps>(), scalePropsDefault)
defineEmits<ScaleEvents>()

const scaleRef = ref(null);
const content = ref(null);
const viewModel = new ScaleViewModel({unit: props.unit, maxWidth: props.maxWidth});
const {
  textColorStyle,
  gisControlBgStyle
} = useTheme(props)

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

// Register the listener before useMapGetter can synchronously bind an existing map.
useMapGetter<Map>({viewModel})
useMapControl()

onBeforeUnmount(() => {
  viewModel.off('scaleupdated', scaleUpdatedFn);
});

</script>
