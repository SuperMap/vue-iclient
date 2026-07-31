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
import { cloneDeep, isEqual } from 'lodash-es';
import sceneEvent from 'vue-iclient-core/types/scene-event';
import { LayerManager, type LayerCheckData } from 'vue-iclient-core/utils/scene';
import { watch, computed, onMounted, onBeforeUnmount } from 'vue';
import SmSceneLayerList from '@supermapgis/mapboxgl/components/scene-layer-list/scene-layer-list.vue'
import SmSceneLayerManager from '@supermapgis/mapboxgl/components/scene-layer-manager/scene-layer-manager.vue'
import SmSceneFlyTo from '@supermapgis/mapboxgl/components/scene-fly-to/scene-fly-to.vue'
import SmSceneFullscreen from '@supermapgis/mapboxgl/components/scene-fullscreen/scene-fullscreen.vue'
import SmSceneMeasure from '@supermapgis/mapboxgl/components/scene-measure/scene-measure.vue'
import SmSceneViewModeSwitcher from '@supermapgis/mapboxgl/components/scene-view-mode-switcher/scene-view-mode-switcher.vue'
import SmSceneZoom from '@supermapgis/mapboxgl/components/scene-zoom/scene-zoom.vue'
import SmSceneMapSwitch from '@supermapgis/mapboxgl/components/scene-map-switch/scene-map-switch.vue'
import SmSceneSkylineAnalysis from '@supermapgis/mapboxgl/components/scene-skyline-analysis/scene-skyline-analysis.vue'
import SmSceneSplitScreen from '@supermapgis/mapboxgl/components/scene-split-screen/scene-split-screen.vue'
import SmSceneSunlightAnalysis from '@supermapgis/mapboxgl/components/scene-sunlight-analysis/scene-sunlight-analysis.vue'
import SmSceneRollerShutter from '@supermapgis/mapboxgl/components/scene-roller-shutter/scene-roller-shutter.vue'
import SmSceneAttributePopup from '@supermapgis/mapboxgl/components/scene-attribute-popup/scene-attribute-popup.vue'

defineOptions({
  name: 'SmWebScene'
})

const props = withDefaults(defineProps<WebSceneProps>(), webScenePropsDefault)
const emit = defineEmits<WebSceneEvents>()

const componentMap: Record<string, any> = {
  SmSceneLayerList,
  SmSceneLayerManager,
  SmSceneFlyTo,
  SmSceneFullscreen,
  SmSceneMeasure,
  SmSceneViewModeSwitcher,
  SmSceneZoom,
  SmSceneMapSwitch,
  SmSceneSkylineAnalysis,
  SmSceneSplitScreen,
  SmSceneSunlightAnalysis,
  SmSceneRollerShutter,
  SmSceneAttributePopup
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
let layerManager: LayerManager | null = null;
let layerManagerVersion = 0;
let layerOperationQueue = Promise.resolve();
const loadedLayers = new Map<string, LayerCheckData>();

const isCurrentLayerManager = (manager: LayerManager, managerVersion: number) => {
  return manager === layerManager && managerVersion === layerManagerVersion;
};

const getConfiguredLayers = () => {
  const layers = Array.isArray(props.layers) ? cloneDeep(props.layers) : [];
  const uniqueLayers = new Map<string, LayerCheckData>();
  layers.forEach(layer => {
    const id = String(layer?.id || '').trim();
    const config = layer?.config;
    const isRestDataLayerValid =
      layer?.type !== 'data' ||
      (config?.type === 'rest' &&
        !!String(config.url || '').trim() &&
        !!String(config.datasourceName || '').trim() &&
        !!String(config.datasetName || '').trim());
    if (!id || uniqueLayers.has(id) || !isRestDataLayerValid) {
      return;
    }
    uniqueLayers.set(id, {
      ...layer,
      id
    });
  });
  return uniqueLayers;
};

const syncConfiguredLayers = async (manager: LayerManager, managerVersion: number) => {
  if (!isCurrentLayerManager(manager, managerVersion)) {
    return;
  }
  const configuredLayers = getConfiguredLayers();
  for (const [id, loadedLayer] of loadedLayers) {
    if (!configuredLayers.has(id)) {
      try {
        await manager.check(loadedLayer, false);
        if (isCurrentLayerManager(manager, managerVersion)) {
          loadedLayers.delete(id);
        }
      } catch (error) {
        console.error(`[SmWebScene] Failed to remove scene layer "${id}".`, error);
      }
    }
  }
  for (const [id, configuredLayer] of configuredLayers) {
    if (!isCurrentLayerManager(manager, managerVersion)) {
      return;
    }
    const loadedLayer = loadedLayers.get(id);
    if (!loadedLayer) {
      try {
        await manager.check(configuredLayer, true);
        if (isCurrentLayerManager(manager, managerVersion)) {
          loadedLayers.set(id, configuredLayer);
        }
      } catch (error) {
        console.error(`[SmWebScene] Failed to add scene layer "${id}".`, error);
      }
      continue;
    }
    if (!isEqual(loadedLayer, configuredLayer)) {
      try {
        await manager.handleDataChange({
          ...configuredLayer,
          checked: true
        });
        if (isCurrentLayerManager(manager, managerVersion)) {
          loadedLayers.set(id, configuredLayer);
        }
      } catch (error) {
        console.error(`[SmWebScene] Failed to update scene layer "${id}".`, error);
      }
    }
  }
};

const enqueueLayerSync = () => {
  const manager = layerManager;
  const managerVersion = layerManagerVersion;
  if (!manager) {
    return;
  }
  layerOperationQueue = layerOperationQueue
    .then(() => syncConfiguredLayers(manager, managerVersion))
    .catch(error => {
      console.error('[SmWebScene] Failed to synchronize scene layers.', error);
    });
};

const initializeLayerManager = (viewer: unknown) => {
  const managerVersion = ++layerManagerVersion;
  layerOperationQueue = layerOperationQueue
    .then(async () => {
      if (layerManager) {
        await layerManager.removeAll();
      }
      if (managerVersion !== layerManagerVersion) {
        return;
      }
      layerManager = new LayerManager(viewer);
      loadedLayers.clear();
      await syncConfiguredLayers(layerManager, managerVersion);
    })
    .catch(error => {
      console.error('[SmWebScene] Failed to initialize scene layers.', error);
    });
};

const disposeLayerManager = () => {
  layerManagerVersion += 1;
  const manager = layerManager;
  layerManager = null;
  loadedLayers.clear();
  if (manager) {
    layerOperationQueue = layerOperationQueue
      .then(() => manager.removeAll())
      .then(() => {
        if (!layerManager) {
          loadedLayers.clear();
        }
      })
      .catch(error => {
        console.error('[SmWebScene] Failed to remove scene layers.', error);
      });
  }
};

const changeViewerPositionFn = (e: any) => {
  emit('viewer-position-changed', e.position);
};

const changeScanPositionFn = (e: any) => {
  emit('viewer-scan-position-changed', e.centerPostion);
};

const instanceDidLoadFn = (e: any) => {
  if (e.instance?.viewer) {
    initializeLayerManager(e.instance.viewer);
  }
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

watch(
  () => props.layers,
  () => {
    enqueueLayerSync();
  },
  { deep: true }
);

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
  disposeLayerManager();
  webSceneViewModel.off('viewerpositionchanged', changeViewerPositionFn);
  webSceneViewModel.off('scanpositionchanged', changeScanPositionFn);
  webSceneViewModel.off('instancedidload', instanceDidLoadFn);
  webSceneViewModel.removeInputAction();
  webSceneViewModel = null;
  sceneEvent.deleteScene(props.target);
});
</script>
