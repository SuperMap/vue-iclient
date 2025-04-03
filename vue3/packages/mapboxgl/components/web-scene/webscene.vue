<template>
  <div :id="target" class="sm-component-web-scene">
    <slot></slot>
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
import WebSceneViewModel from 'vue-iclient-core/controllers/mapboxgl/WebSceneViewModel';
import { isEqual } from 'lodash-es';
import sceneEvent from 'vue-iclient-core/types/scene-event';
import { watch, onMounted, onBeforeUnmount, defineProps, defineEmits } from 'vue';

defineOptions({
  name: 'SmWebScene'
})

const props = withDefaults(defineProps<WebSceneProps>(), webScenePropsDefault)
const emit = defineEmits<WebSceneEvents>()

let webSceneViewModel: WebSceneViewModel | null = null;

const changeViewerPositionFn = (e: any) => {
  emit('viewer-position-changed', e.position);
};

const changeScanPositionFn = (e: any) => {
  emit('viewer-scan-position-changed', e.centerPosition);
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
  webSceneViewModel = new WebSceneViewModel(props.target, props.sceneUrl, props.options, props.widgetsPath, props.cesiumPath);
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
