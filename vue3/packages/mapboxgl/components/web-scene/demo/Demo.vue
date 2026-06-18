<script setup lang="ts">
import WebScene from '../webscene.vue'
import { SplitScreen } from 'vue-iclient-core/utils/scene/split-screen'
import '../style'
import { ref, shallowReactive, computed } from 'vue'

const defaultProps = {
  sceneUrl: 'http://localhost:8082/iportal/web/scenes/1773481018',
  widgetsPath: 'http://localhost:8082/iportal/apps/earth/v2/SuperMap3D/Widgets/widgets.css',
  cesiumPath: 'http://localhost:8082/iportal/apps/earth/v2/SuperMap3D/SuperMap3D.js',
  openConfigPath: 'http://localhost:8082/iportal/apps/earth/v2/lib/OpenConfig.js',
  options: {
    scanEffect: {
      status: true,
      type: 'noScan',
      centerPostion: {
        x: null,
        y: null,
        z: null
      },
      period: 2000,
      speed: 500
    },
    position: {
      orientation: {
        pitch: null,
        roll: null,
        heading: null
      },
      destination: {
        x: null,
        y: null,
        z: null
      }
    }
  }
}

const splitModes = [
  { label: '无分屏', value: 'NONE' },
  { label: '水平分屏', value: 'HORIZONTAL' },
  { label: '垂直分屏', value: 'VERTICAL' },
  { label: '四视口', value: 'QUAD' },
  { label: '三视口', value: 'TRIPLE' },
  { label: '水平三视口', value: 'VerticalTrisection' }
]

let splitScreen = null
const layersInfo = shallowReactive([])
const selectedMode = ref('NONE')

const viewportOptions = computed(() => {
  const count = splitScreen.getViewModeCount(selectedMode.value)
  const labels = ['视口一', '视口二', '视口三', '视口四']
  return Array.from({ length: count }, (_, i) => ({ label: labels[i], value: i }))
})

let viewer = null
const instanceDidLoadFn = (e: any) => {
  viewer = e.viewer
  splitScreen = new SplitScreen(viewer)
  setTimeout(() => {
    loadS3MLayers()
  }, 5000)
}

// 异步加载各种S3M图层
const loadS3MLayers = async () => {
  if (!viewer?.scene) return
  const baseURL = 'https://www.supermapol.com/realspace/services/3D-CBD-2/rest/realspace/datas/'
  const s3mConfigs = [
    { url: baseURL + 'Ground@CBD/config', name: 'ground' },
    { url: baseURL + 'Ground2@CBD/config', name: 'ground2'},
    { url: baseURL + 'Building@CBD/config', name: 'build'},
    { url: baseURL + 'Lake@CBD/config',name: 'lake'},
    { url: baseURL + 'Tree@CBD/config', name: 'tree'}
  ]
  const defaultIndices = splitScreen?.getViewportIndices() || [0]
  const promises = s3mConfigs.map(config => {
    return viewer.scene.addS3MTilesLayerByScp(config.url, {
      name: config.name
    })
  })
  viewer.scene.camera.setView({
    destination: new window.SuperMap3D.Cartesian3.fromDegrees(116.4563, 39.8969, 553), // 目标位置：经度116.4563°，纬度39.8969°，高度553米
    orientation: {
      heading: 5.901089214916513, // 航向角（弧度）- 相机水平旋转角度
      pitch: -0.40668579780875524, // 俯仰角（弧度）- 相机垂直倾斜角度
      roll: 6.281842456812987 // 翻滚角（弧度）- 相机绕视线轴旋转角度
    }
  })

  window.SuperMap3D.when.all(promises, function (layers) {
    const names = s3mConfigs.map(item => item.name)
    names.forEach(name => {
      const layer = viewer.scene.layers.find(name) // 建筑图层
      layersInfo.push({
        name: layer.name,
        layer,
        visibleInViewports: [...defaultIndices]
      })
    })
  })
}

// const updateLayers = () => {
//   const sceneLayers = {
//     s3mLayer: viewer.scene.layers._layerQueue,
//     imageryLayer: viewer.imageryLayers._layers,
//     MVTLayer: viewer.scene._vectorTileMaps._layerQueue
//   }
//   console.log(sceneLayers)
//   if (sceneLayers) {
//     const defaultIndices = splitScreen.getViewportIndices()
//     for (let layerType in sceneLayers) {
//       const layerArray = sceneLayers[layerType]
//       layersInfo.push(
//         ...layerArray.map((layer, index) => ({
//           name: layer.name || `图层 ${index + 1}`,
//           layer,
//           visibleInViewports: [...defaultIndices]
//         }))
//       )
//     }
//   }
// }

const handleModeChange = (mode: string) => {
  if (splitScreen) {
    splitScreen.setSplitMode(mode)
    // 重置图层可见性为全选
    const defaultIndices = splitScreen.getViewportIndices()
    layersInfo.forEach((layer, index) => {
      layersInfo[index] = { ...layer, visibleInViewports: [...defaultIndices] }
      // 设置图层在所有新视口中可见
      splitScreen.setLayerVisibility(layer.layer, defaultIndices, true)
    })
  }
}

const toggleViewport = (e: any, layer: any, viewportIndex: number) => {
  if (!layer) return
  layer.setVisibleInViewport(viewportIndex, e.target.checked)
}
</script>

<template>
  <div class="demo-container">
    <!-- 控制面板 -->
    <div class="control-panel">
      <h3>分屏设置</h3>

      <!-- 分屏模式选择 -->
      <div class="control-item">
        <label>分屏模式：</label>
        <select v-model="selectedMode" @change="handleModeChange(selectedMode)">
          <option v-for="mode in splitModes" :key="mode.value" :value="mode.value">
            {{ mode.label }}
          </option>
        </select>
      </div>

      <!-- 图层可见性设置 -->
      <div class="control-item" v-if="layersInfo.length">
        <label>图层视口可见性：</label>
        <div class="layer-list">
          <div v-for="layer in layersInfo" :key="layer.id" class="layer-item">
            <span class="layer-name">{{ layer.name }}</span>
            <div class="viewport-checkboxes">
              <span v-for="vp in viewportOptions" :key="vp.value">
                <input
                  type="checkbox"
                  :checked="layer.visibleInViewports.includes(vp.value)"
                  @change="toggleViewport($event, layer.layer, vp.value)"
                />
                {{ vp.label }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="control-item" v-else>
        <span class="loading">加载中...</span>
      </div>
    </div>

    <!-- 3D场景 -->
    <div class="scene-container">
      <WebScene
        ref="webScene"
        v-bind="defaultProps"
        @instance-did-load="instanceDidLoadFn"
      ></WebScene>
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
  width: 280px;
  padding: 16px;
  background: #f5f5f5;
  border-right: 1px solid #ddd;
  overflow-y: auto;
}

.control-panel h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
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

.control-item select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.layer-list {
  max-height: 400px;
  overflow-y: auto;
}

.layer-item {
  padding: 8px;
  margin-bottom: 8px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
}

.layer-name {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  color: #333;
}

.viewport-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.scene-container {
  flex: 1;
  position: relative;
}

.loading {
  color: #999;
  font-size: 13px;
}
</style>
