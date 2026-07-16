<template>
  <div :id="target" class="sm-component-web-scene">
    <slot></slot>
    <template v-for="(item, _index) in controlComponents" :key="`${item.name}_${_index}`">
      <component :is="componentMap[item.name]" v-bind="item.props"></component>
    </template>
    <div class="scene-control-container">
      <div class="scene-control-top-right"></div>
      <div class="scene-control-top-left"></div>
      <div class="scene-control-bottom-right"></div>
      <div class="scene-control-bottom-left"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WebSceneProps, WebSceneEvents } from './types'
import { webScenePropsDefault } from './types'
import WebSceneViewModel from 'vue-iclient-controllers-mapboxgl/src/WebSceneViewModel';
import { isEqual } from 'lodash-es';
import sceneEvent from 'vue-iclient-core/types/scene-event';
import { watch, computed, onMounted, onBeforeUnmount } from 'vue';
import SmSceneLayerList from '@supermapgis/mapboxgl/components/scene-layer-list/scene-layer-list.vue'
import SmSceneFlyTo from '@supermapgis/mapboxgl/components/scene-fly-to/scene-fly-to.vue'
import SmSceneFullscreen from '@supermapgis/mapboxgl/components/scene-fullscreen/scene-fullscreen.vue'
import SmSceneMeasure from '@supermapgis/mapboxgl/components/scene-measure/scene-measure.vue'
import SmSceneViewModeSwitcher from '@supermapgis/mapboxgl/components/scene-view-mode-switcher/scene-view-mode-switcher.vue'
import SmSceneZoom from '@supermapgis/mapboxgl/components/scene-zoom/scene-zoom.vue'
import SmSceneMapSwitch from '@supermapgis/mapboxgl/components/scene-map-switch/scene-map-switch.vue'
import SmSceneSkylineAnalysis from '@supermapgis/mapboxgl/components/scene-skyline-analysis/scene-skyline-analysis.vue'

defineOptions({
  name: 'SmWebScene'
})

const props = withDefaults(defineProps<WebSceneProps>(), webScenePropsDefault)
const emit = defineEmits<WebSceneEvents>()

const componentMap: Record<string, any> = {
  SmSceneLayerList,
  SmSceneFlyTo,
  SmSceneFullscreen,
  SmSceneMeasure,
  SmSceneViewModeSwitcher,
  SmSceneZoom,
  SmSceneMapSwitch,
  SmSceneSkylineAnalysis
};
const controlComponents: Record<string, any> = computed(() => {
  const controls = []
  for (let key in props) {
    if (key.includes('Control') && props[key]?.show) {
      const controlName = key.replace('Control', '')
      const firstLetter = controlName[0]
      controls.push({
        name: `Sm${controlName.replace(firstLetter, firstLetter.toUpperCase())}`,
        props: {
          ...props[key],
          sceneTarget: props.target
        }
      })
    }
  }
  return controls
})

let webSceneViewModel: WebSceneViewModel | null = null;

const changeViewerPositionFn = (e: any) => {
  emit('viewer-position-changed', e.position);
};

const changeScanPositionFn = (e: any) => {
  emit('viewer-scan-position-changed', e.centerPostion);
};

const instanceDidLoadFn = (e: any) => {
  emit('instance-did-load', e.instance);
};

const registerEvents = () => {
  webSceneViewModel.on('viewerpositionchanged', changeViewerPositionFn);
  webSceneViewModel.on('scanpositionchanged', changeScanPositionFn);
  webSceneViewModel.on('instancedidload', instanceDidLoadFn);
};

watch(() => props.sceneUrl, () => {
  webSceneViewModel?.setSceneUrl(props.sceneUrl);
});

watch(() => props.options.scanEffect, (scanEffect) => {
  webSceneViewModel?.setScanEffect(scanEffect);
});

watch(() => props.options.position, (newVal, oldVal) => {
  if (webSceneViewModel) {
    let position = null;
    if (webSceneViewModel.viewer) {
      const destination = webSceneViewModel.getPosition();
      const orientation = webSceneViewModel.getOrientation();
      position = { orientation, destination };
    }
    if (!isEqual(newVal, oldVal) && !isEqual(newVal, position)) {
      webSceneViewModel.setPosition(newVal, props.flyAnimation);
    }
  }
});

watch(() => props.options.tiandituOptions, (newVal, oldVal) => {
  if (!isEqual(newVal, oldVal)) {
    webSceneViewModel?.setTiandituOption(newVal);
  }
});

onMounted(() => {
  sceneEvent.setScene(props.target, {});
  const { target, sceneUrl, options, widgetsPath, cesiumPath, openConfigPath } = props;
  webSceneViewModel = new WebSceneViewModel(target, sceneUrl, options, widgetsPath, cesiumPath, openConfigPath);
  registerEvents();
});

onBeforeUnmount(() => {
  webSceneViewModel.off('viewerpositionchanged', changeViewerPositionFn);
  webSceneViewModel.off('scanpositionchanged', changeScanPositionFn);
  webSceneViewModel.off('instancedidload', instanceDidLoadFn);
  webSceneViewModel.removeInputAction();
  webSceneViewModel = null;
  sceneEvent.deleteScene(props.target);
});
</script>
