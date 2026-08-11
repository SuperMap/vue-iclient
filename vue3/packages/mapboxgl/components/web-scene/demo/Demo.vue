<script setup lang="ts">
import type { LayerCheckData } from 'vue-iclient-core/utils/scene'
import WebScene from '../webscene.vue'
import sceneEvent from 'vue-iclient-core/types/scene-event'
import '../style'
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'

const sceneLibPaths = {
  widgetsPath: '/iportal/apps/earth/v2/SuperMap3D/Widgets/widgets.css',
  cesiumPath: '/iportal/apps/earth/v2/SuperMap3D/SuperMap3D.js',
  openConfigPath: '/iportal/apps/earth/v2/lib/OpenConfig.js'
}

const emptyScanOptions = {
  scanEffect: {
    status: true,
    type: 'noScan' as const,
    centerPostion: { x: null, y: null, z: null },
    period: 2000,
    speed: 500
  }
}

type ScenePreset = {
  id: string
  label: string
  description: string
  props: {
    sceneUrl: string
    target: string
    widgetsPath: string
    cesiumPath: string
    openConfigPath: string
    layers?: LayerCheckData[]
    options: Record<string, any>
  }
}

const scenePresets: ScenePreset[] = [
  {
    id: 'cbd',
    label: 'CBD 场景',
    description: 'iportal 场景 1773481018',
    props: {
      sceneUrl: '/iportal/web/scenes/1773481018',
      target: 'web-scene-demo',
      ...sceneLibPaths,
      options: {
        ...emptyScanOptions,
        position: {
          orientation: { pitch: null, roll: null, heading: null },
          destination: { x: null, y: null, z: null }
        }
      }
    }
  },
  {
    id: 'world',
    label: '世界河流',
    description: 'iportal 场景 1249624952',
    props: {
      sceneUrl: '/iportal/web/scenes/1249624952',
      target: 'web-scene-demo',
      ...sceneLibPaths,
      options: {
        ...emptyScanOptions,
        position: {
          orientation: { pitch: -90, roll: 0, heading: 0 },
          destination: { x: 104, y: 35, z: 6000000 }
        }
      }
    }
  },
  {
    id: 'buildings',
    label: '建筑 + rest/data',
    description: '场景 1753822233，额外挂 Buildings_R',
    props: {
      sceneUrl: '/iportal/web/scenes/1753822233',
      target: 'web-scene-demo',
      ...sceneLibPaths,
      layers: [
        {
          id: 'buildings-r',
          name: 'Buildings_R',
          type: 'data',
          defaultLoad: true,
          autoLocate: true,
          config: {
            type: 'rest',
            url: 'http://172.16.14.44:8090/iserver/services/data-Buildings/rest/data',
            datasourceName: 'Buildings',
            datasetName: 'Buildings_R'
          }
        }
      ],
      options: {
        ...emptyScanOptions,
        position: {
          orientation: { pitch: -45, roll: 0, heading: 0 },
          destination: { x: 106.52, y: 29.52, z: 3000 }
        }
      }
    }
  },
  {
    id: 'jingjin',
    label: '空场景 + 京津面',
    description: '场景 1753822233，挂 Jingjin BaseMap_R',
    props: {
      sceneUrl: '/iportal/web/scenes/1753822233',
      target: 'web-scene-demo',
      ...sceneLibPaths,
      layers: [
        {
          id: 'jingjin-basemap-r',
          name: '京津面',
          type: 'data',
          defaultLoad: true,
          autoLocate: true,
          config: {
            type: 'rest',
            url: 'http://172.16.14.44:8090/iserver/services/data-jingjin/rest/data',
            datasourceName: 'Jingjin',
            datasetName: 'BaseMap_R'
          }
        }
      ],
      options: {
        ...emptyScanOptions,
        position: {
          orientation: { pitch: -90, roll: 0, heading: 0 },
          destination: { x: 116.4, y: 39.9, z: 800000 }
        }
      }
    }
  }
]

const activeSceneId = ref(scenePresets[0].id)
const sceneProps = computed(() => {
  const preset = scenePresets.find(item => item.id === activeSceneId.value) || scenePresets[0]
  return preset.props
})
const activeSceneLabel = computed(
  () => scenePresets.find(item => item.id === activeSceneId.value)?.label || ''
)

const appreciableLayers = ref<any[]>([])
const lastLoadedAt = ref('')

function logAppreciableLayers(webscene: any, reason: string) {
  try {
    const layers = webscene?.getAppreciableLayers?.() || []
    appreciableLayers.value = layers
    lastLoadedAt.value = `${new Date().toLocaleTimeString()} · ${reason}`
    console.log(
      `[WebScene Demo][${activeSceneLabel.value}] getAppreciableLayers (${reason})`,
      layers
    )
  } catch (error) {
    console.error('logAppreciableLayers error', error)
  }
}

function refreshAppreciableLayers(reason: string, settleMs = 0) {
  const target = sceneProps.value.target
  const webscene = sceneEvent.getScene(target)?.webscene
  if (!webscene) {
    return
  }
  logAppreciableLayers(webscene, reason)
  if (settleMs > 0) {
    window.setTimeout(() => {
      // 切换过程中可能又换了预设，避免用旧回调覆盖
      if (sceneProps.value.target !== target) {
        return
      }
      logAppreciableLayers(sceneEvent.getScene(target)?.webscene, `${reason}+layers-settle`)
    }, settleMs)
  }
}

function handleSceneLoaded(e: { sceneTarget: string; webscene?: any }) {
  console.log('handleSceneLoaded', e.sceneTarget)
  logAppreciableLayers(e.webscene, 'load-scene')
  // layers prop 异步上图后再打一次
  window.setTimeout(() => {
    logAppreciableLayers(e.webscene, 'load-scene+layers-settle')
  }, 1500)
}

function handleSceneLayersUpdated(e: { sceneTarget: string }) {
  console.log('handleSceneLayersUpdated', e.sceneTarget)
  if (e.sceneTarget !== sceneProps.value.target) {
    return
  }
  refreshAppreciableLayers('update-layers')
}

const switchScene = (id: string) => {
  if (activeSceneId.value === id) {
    return
  }
  const prevSceneUrl = sceneProps.value.sceneUrl
  activeSceneId.value = id
  appreciableLayers.value = []
  lastLoadedAt.value = ''

  // 同一 sceneUrl 不会触发 load-scene，主动拉取一次
  if (prevSceneUrl === sceneProps.value.sceneUrl) {
    nextTick(() => {
      refreshAppreciableLayers('switch-same-sceneUrl', 1500)
    })
  }
}

onMounted(() => {
  sceneEvent.on({
    'load-scene': handleSceneLoaded,
    'update-layers': handleSceneLayersUpdated
  })
})

onBeforeUnmount(() => {
  sceneEvent.un({
    'load-scene': handleSceneLoaded,
    'update-layers': handleSceneLayersUpdated
  })
})
</script>

<template>
  <div class="demo-container">
    <div class="control-panel">
      <h3>场景切换</h3>
      <div class="scene-switch">
        <button
          v-for="preset in scenePresets"
          :key="preset.id"
          type="button"
          class="scene-btn"
          :class="{ active: activeSceneId === preset.id }"
          @click="switchScene(preset.id)"
        >
          <span class="scene-btn-title">{{ preset.label }}</span>
          <span class="scene-btn-desc">{{ preset.description }}</span>
        </button>
      </div>

      <div class="control-item">
        <label>getAppreciableLayers（{{ activeSceneLabel }}）</label>
        <div v-if="lastLoadedAt" class="loaded-meta">loaded: {{ lastLoadedAt }}</div>
        <pre class="layers-json">{{
          lastLoadedAt
            ? appreciableLayers.length
              ? JSON.stringify(appreciableLayers, null, 2)
              : '[]（已刷新，无可感知图层）'
            : '等待场景 load-scene…'
        }}</pre>
      </div>
    </div>

    <div class="scene-container">
      <WebScene v-bind="sceneProps" />
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  display: flex;
  height: 100%;
  font-family: Arial, sans-serif;
}

.control-panel {
  width: 320px;
  padding: 16px;
  background: #f5f5f5;
  border-right: 1px solid #ddd;
  overflow-y: auto;
}

.control-panel h3 {
  margin: 0 0 12px;
  font-size: 16px;
  color: #333;
}

.scene-switch {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.scene-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  width: 100%;
  padding: 10px 12px;
  text-align: left;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
}

.scene-btn:hover {
  border-color: #409eff;
}

.scene-btn.active {
  border-color: #409eff;
  background: #e8f3ff;
}

.scene-btn-title {
  font-size: 14px;
  color: #333;
  font-weight: 600;
}

.scene-btn-desc {
  font-size: 12px;
  color: #888;
}

.control-item {
  margin-bottom: 16px;
}

.control-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #666;
}

.loaded-meta {
  margin-bottom: 6px;
  font-size: 12px;
  color: #999;
}

.layers-json {
  max-height: 480px;
  margin: 0;
  padding: 8px;
  overflow: auto;
  background: #1e1e1e;
  color: #d4d4d4;
  border-radius: 4px;
  font-size: 11px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-all;
}

.scene-container {
  flex: 1;
  position: relative;
}
</style>
