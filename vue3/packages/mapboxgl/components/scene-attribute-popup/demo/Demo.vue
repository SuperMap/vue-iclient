<script setup lang="ts">
import type { ScenePopupInfo } from '../types'
import { ref } from 'vue'
import WebScene from '@supermapgis/mapboxgl/components/web-scene/webscene.vue'
import Button from '@supermapgis/common/components/button/Button'
import SceneAttributePopup from '../scene-attribute-popup.vue'
// import SelectedFeatureModalButton from './SelectedFeatureModalButton.vue'
import { getDefaultLayerStyle } from '../types'
import '../style'
import '@supermapgis/mapboxgl/components/web-scene/style'
import '@supermapgis/mapboxgl/components/scene-layer-list/style'

const sceneBaseProps = {
  sceneUrl: '/iportal/web/scenes/1753822233',
  widgetsPath: '/iportal/apps/earth/v2/SuperMap3D/Widgets/widgets.css',
  cesiumPath: '/iportal/apps/earth/v2/SuperMap3D/SuperMap3D.js',
  openConfigPath: '/iportal/apps/earth/v2/lib/OpenConfig.js',
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
    // Buildings_R 数据范围约在重庆（106.44~106.60, 29.41~29.63）
    position: {
      orientation: {
        pitch: -45,
        roll: 0,
        heading: 0
      },
      destination: {
        x: 106.52,
        y: 29.52,
        z: 3000
      }
    }
  }
}

const dataSource = {
  url: 'http://172.16.14.44:8090/iserver/services/data-Buildings/rest/data',
  dataSourceName: 'Buildings',
  datasetName: 'Buildings_R'
}

/** Buildings 数据源下的 County_P 区县面 */
const countyPDataSource = {
  url: 'http://172.16.14.44:8090/iserver/services/data-Buildings/rest/data',
  dataSourceName: 'Buildings',
  datasetName: 'County_P'
}

/** 默认点选场景：WebScene.layers 挂 rest/data 上图 */
const defaultSceneLayers = [
  {
    id: 'Buildings_R',
    name: 'Buildings_R',
    type: 'data' as const,
    autoLocate: true,
    config: {
      type: 'rest',
      url: dataSource.url,
      datasourceName: dataSource.dataSourceName,
      datasetName: dataSource.datasetName
    }
  },
  {
    id: 'County_P',
    name: 'County_P',
    type: 'data' as const,
    autoLocate: false,
    config: {
      type: 'rest',
      url: countyPDataSource.url,
      datasourceName: countyPDataSource.dataSourceName,
      datasetName: countyPDataSource.datasetName,
      label: {
        labelOffsetY: 10,
        labelOffsetX: 0,
        fontFamily: 'Microsoft YaHei',
        field: 'SmID',
        outlineWidth: 1,
        hideTitle: false,
        color: 'rgba(255, 255, 255, 0.95)',
        maxVisibleAltitude: 1.7976931348623157e308,
        fontSize: 18,
        align: 'top',
        strokeColor: 'rgba(255, 255, 255, 0)',
        textMaxWidth: 100
      }
    }
  }
]

/** 京津 BaseMap_R：rest/data 上图到场景（点选走 scene.pick properties） */
const JINGJIN_REST_DATA = {
  url: 'http://172.16.14.44:8090/iserver/services/data-jingjin/rest/data',
  dataSourceName: 'Jingjin',
  datasetName: 'BaseMap_R',
  
}



const worldSceneBaseProps = {
  sceneUrl: '/iportal/web/scenes/1249624952',
  widgetsPath: '/iportal/apps/earth/v2/SuperMap3D/Widgets/widgets.css',
  cesiumPath: '/iportal/apps/earth/v2/SuperMap3D/SuperMap3D.js',
  openConfigPath: '/iportal/apps/earth/v2/lib/OpenConfig.js',
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
    // Rivers 为全球河流数据，定位全中国（中心约 104°E, 35°N）
    position: {
      orientation: {
        pitch: -90,
        roll: 0,
        heading: 0
      },
      destination: {
        x: 104,
        y: 35,
        z: 6000000
      }
    }
  }
}

/** 默认点选：不配 elements，自动展示全部属性。layerId 需等于场景影像 customName / MVT name */
const defaultPopupInfos = ref<ScenePopupInfo[]>([
  {
    layerId: 'Buildings_R',
    title: '建筑（默认）',
    identifyField: 'SMID',
    dataSource
  },
  {
    layerId: 'County_P',
    title: '区县（County_P）',
    identifyField: 'SMID',
    dataSource: countyPDataSource
  }
])

/** 场景 1249624952 河流默认点选：layerId 需与场景中 rest/map 图层 customName（地图名）一致 */
const worldPopupInfos = ref<ScenePopupInfo[]>([
  {
    layerId: 'World',
    title: '首都（默认）',
    identifyField: 'SMID',
    dataSource:  {
      url: 'http://172.16.14.44:8090/iserver/services/data-World/rest/data',
      dataSourceName: 'World',
      datasetName: 'capital'
    }
  },
  {
    layerId: 'World',
    title: 'Ocean_Label',
    identifyField: 'SMID',
    dataSource:  {
      url: 'http://172.16.14.44:8090/iserver/services/data-World/rest/data',
      dataSourceName: 'World',
      datasetName: 'Ocean_Label'
    }
  },
  {
    layerId: 'World',
    title: '国家（默认）',
    identifyField: 'SMID',
    dataSource:  {
      url: 'http://172.16.14.44:8090/iserver/services/data-World/rest/data',
      dataSourceName: 'World',
      datasetName: 'Countries'
    }
  },
  {
    layerId: 'World',
    title: '河流（默认）',
    identifyField: 'SMID',
    dataSource: {
      url: 'http://172.16.14.44:8090/iserver/services/data-World/rest/data',
      dataSourceName: 'World',
      datasetName: 'Rivers'
    }
  }
])

/** 自定义点选：显式配置 elements，含 CUSTOM 组件（按钮打开 Modal 展示选中要素） */
const customPopupInfos = ref<ScenePopupInfo[]>([
  {
    layerId: 'Buildings_R',
    title: '建筑（自定义）',
    identifyField: 'SMID',
    dataSource,
    elements: [
      {
        type: 'TEXT',
        infos: [
          {
            insert: '建筑物属性',
            attributes: {
              size: 'large',
              bold: true,
              color: '#1677ff'
            }
          },
          {
            insert: '\n',
            attributes: {
              align: 'left'
            }
          }
        ]
      },
      {
        type: 'DIVIDER'
      },
      {
        type: 'FIELD',
        fieldName: 'SMID',
        fieldCaption: '要素 ID',
        contentType: 'text'
      },
      {
        type: 'FIELD',
        fieldName: 'SMAREA',
        fieldCaption: '面积',
        contentType: 'text'
      },
      {
        type: 'DIVIDER'
      },
      // {
      //   type: 'CUSTOM',
      //   infos: {
      //     // 必须传组件对象（或全局已注册的组件名字符串）；本地组件用 markRaw 避免被做成响应式
      //     component: markRaw(SelectedFeatureModalButton)
      //   }
      // }
    ]
  },
  {
    // GeoJSON 上图后 dataSource.name = BaseMap_R；点选优先 scene.pick 读 properties，不再请求数据服务
    layerId: 'BaseMap_R',
    title: '京津面（GeoJSON）',
    identifyField: 'SMID',
    dataSource: {
      url: JINGJIN_REST_DATA.url,
      dataSourceName: JINGJIN_REST_DATA.dataSourceName,
      datasetName: JINGJIN_REST_DATA.datasetName
    }
  }
])

const popupConfig = ref({
  autoResize: true,
  maxWidth: '320px',
  maxHeight: '400px',
  // 字段列 / 值列超长时显示省略号（可改为 'wrap' 换行）
  keyWordWrap: 'ellipsis' as const,
  valueWordWrap: 'ellipsis' as const
})

const sceneLayerListControl = {
  show: true,
  position: 'top-left',
  collapsed: false,
  operations: {
    fitBounds: true,
    draggable: true
  }
}

/** 与地图 attribute-popup 相同的 layerStyle 结构；场景按点/线/面取对应 paint */
const buildingLayerStyle = getDefaultLayerStyle('#67c23a')
const worldLayerStyle = getDefaultLayerStyle('#e6a23c')

const bgColor = ref<string>()
const multiSelect = ref(true)
const enabled = ref(true)

const changeBg = () => {
  bgColor.value = bgColor.value === '#d90f' ? '#f0f' : '#d90f'
}

const toggleMultiSelect = () => {
  multiSelect.value = !multiSelect.value
}

const toggleEnabled = () => {
  enabled.value = !enabled.value
}

function normalizeRestFeatures(serviceResult: any): GeoJSON.Feature[] {
  const raw =
    serviceResult?.result?.features || serviceResult?.features || serviceResult?.result || serviceResult
  if (Array.isArray(raw)) {
    return raw
  }
  if (Array.isArray(raw?.features)) {
    return raw.features
  }
  return []
}

async function queryRestDataFeatures() {
  const { FeatureService } = await import('@supermapgis/iclient-common/iServer/FeatureService')
  const { GetFeaturesBySQLParameters } = await import(
    '@supermapgis/iclient-common/iServer/GetFeaturesBySQLParameters'
  )
  const params = new GetFeaturesBySQLParameters({
    datasetNames: [`${JINGJIN_REST_DATA.dataSourceName}:${JINGJIN_REST_DATA.datasetName}`],
    queryParameter: {
      name: `${JINGJIN_REST_DATA.datasetName}@${JINGJIN_REST_DATA.dataSourceName}`,
      attributeFilter: 'SMID > 0'
    },
    hasGeometry: true,
    returnFeaturesOnly: false,
    maxFeatures: 2000,
    fromIndex: 0,
    toIndex: 1999,
    targetPrj: { epsgCode: 4326 }
  })
  const serviceResult = await new FeatureService(JINGJIN_REST_DATA.url).getFeaturesBySQL(params)
  return normalizeRestFeatures(serviceResult)
}

async function onSceneCustomLoaded(e: { Cesium?: any; viewer?: any }) {
  const viewer = e?.viewer
  const SuperMap3D = e?.Cesium || (window as any).SuperMap3D
  if (!viewer || !SuperMap3D) {
    return
  }
  try {
    const features = await queryRestDataFeatures()
    if (!features.length) {
      console.warn('[Demo] Jingjin BaseMap_R 查询无要素')
      return
    }
    const dataSource = await SuperMap3D.GeoJsonDataSource.load(
      { type: 'FeatureCollection', features },
      {
        stroke: SuperMap3D.Color.fromCssColorString('#1677ff'),
        fill: SuperMap3D.Color.fromCssColorString('#1677ff').withAlpha(0.35),
        strokeWidth: 2,
        clampToGround: true
      }
    )
    // name 需与 popupInfos.layerId / datasetName 对齐，点选才能命中 pick 短路
    dataSource.name = JINGJIN_REST_DATA.datasetName
    await viewer.dataSources.add(dataSource)
    viewer.flyTo(dataSource)
  } catch (error) {
    console.warn('[Demo] 加载 Jingjin BaseMap_R 失败', error)
  }
}
</script>

<template>
  <div>
    <div class="demo-toolbar">
      <Button type="primary" @click="changeBg">切换背景</Button>
      <Button type="primary" @click="toggleMultiSelect">
        多选：{{ multiSelect ? '开' : '关' }}
      </Button>
      <Button type="primary" @click="toggleEnabled">
        点选：{{ enabled ? '开' : '关' }}
      </Button>
    </div>
    <p class="demo-tip">
      「默认点选」通过 WebScene.layers 挂 Buildings_R、County_P（rest/data），点选走
      scene.pick；左上角为 sceneLayerListControl 图层列表。layerId 需与 layers[].id
      对齐。多选：Ctrl + 左键仅在同一图层内累加。
    </p>
    <div class="demo-scenes">
      <div class="demo-scene-panel">
        <h4 class="demo-scene-title">默认点选（Control）</h4>
        <WebScene
          v-bind="sceneBaseProps"
          target="scene-default"
          :layers="defaultSceneLayers"
          :scene-layer-list-control="sceneLayerListControl"
          :scene-attribute-popup-control="{
            show: true,
            popupInfos: defaultPopupInfos,
            popupConfig,
            multiSelect: true,
            enabled,
            background: bgColor,
            clickTolerance: 5,
            layerStyle: buildingLayerStyle
          }"
        />
      </div>
      <div class="demo-scene-panel">
        <h4 class="demo-scene-title">自定义 elements</h4>
        <WebScene
          v-bind="sceneBaseProps"
          target="scene-custom"
          :layers="defaultSceneLayers"
          @instance-did-load="onSceneCustomLoaded"
        >
          <SceneAttributePopup
            scene-target="scene-custom"
            :popup-infos="customPopupInfos"
            :popup-config="popupConfig"
            :multi-select="multiSelect"
            :enabled="enabled"
            :background="bgColor"
            :click-tolerance="5"
            :layer-style="buildingLayerStyle"
          />
        </WebScene>
      </div>
      <div class="demo-scene-panel">
        <h4 class="demo-scene-title">河流（场景 1249624952）</h4>
        <WebScene v-bind="worldSceneBaseProps" target="scene-rivers">
          <SceneAttributePopup
            scene-target="scene-rivers"
            :popup-infos="worldPopupInfos"
            :popup-config="popupConfig"
            :multi-select="multiSelect"
            :enabled="enabled"
            :background="bgColor"
            :click-tolerance="50000"
            :layer-style="worldLayerStyle"
          />
        </WebScene>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use '@supermapgis/common/theme-chalk/button.scss';

.demo-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.demo-tip {
  margin: 0 0 8px;
  color: #666;
  font-size: 13px;
}

.demo-scenes {
  display: flex;
  gap: 12px;
  width: 100%;
}

.demo-scene-panel {
  flex: 1;
  min-width: 0;
}

.demo-scene-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
}

#scene-default,
#scene-custom,
#scene-rivers {
  height: 560px;
  position: relative;
  overflow: hidden;
}
</style>
