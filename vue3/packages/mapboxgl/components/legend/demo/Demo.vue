<script setup lang="ts">
import Legend from '../legend.vue'
import WebMap from '@supermapgis/mapboxgl/components/web-map/webmap.vue'
import Button from '@supermapgis/common/components/button/Button'
import { mapEvent } from 'vue-iclient-core'
import { ref } from 'vue'
import type { LegendMode } from '../types'
import '../style'

const SERVER_URL = 'http://172.16.14.44:8190/iportal'

interface LegendCase {
  mapId: number
  target: string
  title: string
  desc: string
}

// 三张部署在内网 iPortal 上的地图，用于对比不同类型图层的图例效果
const legendCases: LegendCase[] = [
  {
    mapId: 202233113,
    target: 'legend-map-1',
    title: '点线面-图例-dv',
    desc: '基础点、线、面图层'
  },
  {
    mapId: 719993873,
    target: 'legend-map-2',
    title: 'ms-图例',
    desc: '点聚合、柱状、面等二维专题图层'
  },
  {
    mapId: 777784856,
    target: 'legend-map-3',
    title: 'ms-图例_l7',
    desc: 'L7 三维渲染图层（柱体、热力、3D 线等）'
  }
]

const activeCase = ref<LegendCase>(legendCases[0])

// 切换示例时重置图层勾选状态，由新地图的 @load 重新填充
function selectCase(item: LegendCase) {
  if (item.mapId === activeCase.value.mapId) {
    return
  }
  activeCase.value = item
  layerList.value = []
  layerNames.value = []
}

const position = ref('bottom-left')
const mode = ref<LegendMode>('panel')
const isShowTitle = ref(true)
// 面板模式下需要展示“专题字段”，否则等级符号/分段等图例看不到专题字段
const isShowField = ref(true)
const bgColor = ref<string>()

interface LayerItem {
  id: string
  title: string
}

// 地图上的全部图层，勾选后在图例中展示，实现多图层图例切换
const layerList = ref<LayerItem[]>([])
const layerNames = ref<string[]>([])

const changePosition = (pos: string) => {
  position.value = pos
}

const changeBg = () => {
  bgColor.value = bgColor.value === '#d90f' ? '#f0f' : '#d90f'
}

const toggleMode = () => {
  if (mode.value === 'simple') {
    mode.value = 'panel'
    isShowTitle.value = true
    isShowField.value = true
  } else {
    mode.value = 'simple'
    isShowTitle.value = false
    isShowField.value = false
  }
}

// 图层目录可能是分组结构，这里拍平成图层项
function flattenLayers(layers: Record<string, any>[] = []): LayerItem[] {
  return layers.reduce<LayerItem[]>((list, layer) => {
    if (layer.children && layer.children.length) {
      list.push(...flattenLayers(layer.children))
    } else {
      const id = layer.id || layer.layerId || layer.name
      if (id) {
        list.push({ id, title: layer.title || layer.name || id })
      }
    }
    return list
  }, [])
}

// 地图加载完成后从 webmap 实例读取图层列表
function handleLoad() {
  const webMapViewModel: any = mapEvent.getWebMap(activeCase.value.target)
  layerList.value = flattenLayers(webMapViewModel?.getAppreciableLayers?.() || [])
  // 默认展示前三个图层的图例
  layerNames.value = layerList.value.slice(0, 3).map(layer => layer.id)
}

// 切换某个图层是否显示图例
function toggleLayer(id: string) {
  const index = layerNames.value.indexOf(id)
  if (index === -1) {
    layerNames.value = [...layerNames.value, id]
  } else {
    layerNames.value = layerNames.value.filter(name => name !== id)
  }
}

function toggleAll() {
  layerNames.value =
    layerNames.value.length === layerList.value.length ? [] : layerList.value.map(layer => layer.id)
}
</script>
<template>
  <div style="position:relative">
    <div class="legend-demo__cases">
      <Button
        v-for="item in legendCases"
        :key="item.mapId"
        :type="item.mapId === activeCase.mapId ? 'primary' : 'default'"
        @click="selectCase(item)"
      >
        {{ item.title }}（mapId={{ item.mapId }}）
      </Button>
    </div>
    <p class="legend-demo__case-desc">{{ activeCase.desc }}</p>
    <div class="legend-demo__toolbar">
      <Button type="primary" @click="changeBg">切换背景</Button>
      <Button type="primary" @click="changePosition('top-right')">切换位置</Button>
      <Button type="primary" @click="toggleMode">切换模式（simple / panel）</Button>
      <Button @click="toggleAll">全选 / 清空图层</Button>
    </div>
    <div v-if="layerList.length" class="legend-demo__layers">
      <span class="legend-demo__layers-label">图例图层：</span>
      <label v-for="layer in layerList" :key="layer.id" class="legend-demo__layer">
        <input
          type="checkbox"
          :checked="layerNames.indexOf(layer.id) !== -1"
          @change="toggleLayer(layer.id)"
        />
        <span>{{ layer.title }}</span>
      </label>
    </div>
    <WebMap
      :key="activeCase.mapId"
      :server-url="SERVER_URL"
      :map-id="activeCase.mapId"
      :target="activeCase.target"
      @load="handleLoad"
    >
      <Legend
        :key="activeCase.target"
        :position="position"
        :map-target="activeCase.target"
        :mode="mode"
        :is-show-title="isShowTitle"
        :is-show-field="isShowField"
        :layer-names="layerNames"
        :background="bgColor"
        :collapsed="false"
      />
    </WebMap>
  </div>
</template>
<style lang="scss">
@use '@supermapgis/common/theme-chalk/button.scss';
@use '@supermapgis/mapboxgl/theme-chalk/webmap.scss';

.legend-demo__toolbar {
  margin-bottom: 8px;
}

.legend-demo__layers {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 16px;
  max-height: 88px;
  margin-bottom: 8px;
  overflow: auto;

  &-label {
    font-weight: 700;
  }
}

.legend-demo__cases {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.legend-demo__case-desc {
  margin-bottom: 8px;
  color: rgb(0 0 0 / 65%);
}

.legend-demo__layer {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.sm-component-web-map {
  height: 700px !important;
  width: 1500px !important;
}
</style>
