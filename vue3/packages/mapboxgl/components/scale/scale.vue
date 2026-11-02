<template>
  <div
    class="sm-component-scale-container"
    :style="[background && gisControlBgStyle]"
  >
    <div
      class="sm-component-scale"
      :style="[textColorStyle, { width: barWidth, height: '100%' } ]"
    >
      <span>{{ content }}</span>
    </div>
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

const barWidth = ref('');
const content = ref(null);
const viewModel = new ScaleViewModel({unit: props.unit, maxWidth: props.maxWidth});
const {
  textColorStyle,
  gisControlBgStyle
} = useTheme(props)

const scaleUpdatedFn = (e) => {
  content.value = e.containerContent;
  // 比例尺的横条是 .sm-component-scale 的 border-bottom，宽度必须等于按地图比例算出的像素宽。
  // 宽度写在里层的横条元素上，而不是组件根节点：低代码平台会给组件根节点强制写
  // inline 的 width:100%（重渲染时还会再写一遍），写在根节点上的宽度会被顶掉，
  // 横条就会跟着栅格格子的宽度一起变长。
  barWidth.value = e.containerWidth;
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
