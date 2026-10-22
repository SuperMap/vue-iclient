<script setup lang="ts">
import { ref } from 'vue'
import DataEditor from '../data-editor.vue'
import WebMap from '@supermapgis/mapboxgl/components/web-map/webmap.vue'
import { mapEvent } from 'vue-iclient-core'
import { getDatasetUrl, isRestDataLayer, isStructuredDataLayer } from '../utils'
import type { DataEditorLayer } from '../types'
import '../style'

/** 示例使用内网 iPortal，需要选择包含可编辑数据图层的地图 */
const SERVER_URL = 'http://172.16.14.44:8190/iportal'
/** 数据编辑器请求走 site 的 /iportal 代理，避免携带 cookie 的跨域请求被浏览器拦截 */
const PORTAL_API = '/iportal'
/** 数据编辑器内部请求的服务根地址，与 PORTAL_API 保持一致 */
const EDITOR_ROOT_URL = PORTAL_API
const MAP_ID = 202233113
const TARGET = 'data-editor-map'
/** 从 iPortal 结构化数据资源中最多取几个作为示例 */
const STRUCTURED_DATA_LIMIT = 5
/** 固定展示的结构化数据 id，始终排在列表最前面 */
const PRESET_STRUCTURED_DATA_IDS: (string | number)[] = [159820012]
/** 非要素几何字段，不参与属性编辑 */
const SKIP_FIELDS = ['geometry', 'smpid']

const layers = ref<DataEditorLayer[]>([])
const savedLayerId = ref('')

/**
 * 接口用 WebMap 图层的 dataSource 转换成数据编辑需要的 dataInfo。
 * 数据编辑只支持数据服务（rest/data）与结构化数据，其它类型（地图服务、影像服务、
 * iPortal 上图数据 PORTAL_DATA 等）一律返回 null，不再出现在列表中。
 */
function buildWebMapLayer(item: Record<string, any>): DataEditorLayer | null {
  const dataSource = item.dataSource || {}
  const sourceType = `${dataSource.type || ''}`.toUpperCase()
  const base: DataEditorLayer = {
    id: `${item.layerId || item.id || item.name}`,
    title: `${item.title || item.name || item.layerId || item.id || ''}`,
    fields: item.fields || [],
    renderLayers: item.renderLayers || []
  }
  if (sourceType === 'REST_DATA' || sourceType === 'RESTDATA') {
    const dataName =
      dataSource.dataName ||
      [dataSource.datasourceName, dataSource.datasetName].filter(Boolean).join(':')
    const dataInfo = {
      id: dataSource.id || base.id,
      type: 'iServer',
      dataType: 'RESTDATA',
      url: dataSource.url,
      dataName: dataName || undefined,
      token: dataSource.token
    }
    const layer = { ...base, dataInfo }
    // 数据集地址不完整时数据编辑器无法取到要素，同样不展示
    return isRestDataLayer(layer) && getDatasetUrl(dataInfo) ? layer : null
  }
  if (sourceType === 'STRUCTURE_DATA') {
    const dataId = dataSource.serverId || item.serverId
    if (!dataId) {
      return null
    }
    const layer = {
      ...base,
      dataInfo: {
        id: dataId,
        type: 'iPortal',
        dataType: 'STRUCTUREDDATA',
        url: `${PORTAL_API}/web/datas/${dataId}`,
        displayName: base.title,
        withCredentials: true
      }
    }
    return isStructuredDataLayer(layer) ? layer : null
  }
  return null
}

/** 从 WebMap 中提取支持数据编辑的图层 */
function collectWebMapLayers(): DataEditorLayer[] {
  const webmap: any = mapEvent.getWebMap(TARGET)
  const layerList: Record<string, any>[] = webmap?.getAppreciableLayers?.() || []
  return layerList
    .filter((item) => item.type !== 'background')
    .map(buildWebMapLayer)
    .filter((layer): layer is DataEditorLayer => !!layer)
}

/** 读取结构化数据集信息，只保留含 geometry 字段的数据 */
async function fetchStructuredDataMeta(dataId: string | number) {
  try {
    const response = await fetch(`${PORTAL_API}/web/datas/${dataId}/structureddata.json`, {
      credentials: 'include'
    })
    if (!response.ok) {
      return null
    }
    const meta = await response.json()
    const fieldNames: string[] = (meta.fieldNames || []).map((name: string) => `${name}`)
    if (!fieldNames.some((name) => name.toLowerCase() === 'geometry')) {
      return null
    }
    return { meta, fieldNames }
  } catch {
    return null
  }
}

/** 把 iPortal 结构化数据资源转换成数据编辑图层 */
function buildStructuredDataLayer(
  dataId: string | number,
  title: string,
  fieldNames: string[]
): DataEditorLayer {
  return {
    id: `structured-${dataId}`,
    title,
    fields: fieldNames
      .filter((name) => !SKIP_FIELDS.includes(name.toLowerCase()))
      .map((name) => ({ field: name, alias: name, display: true, editable: true })),
    renderLayers: [],
    dataInfo: {
      id: dataId,
      type: 'iPortal',
      dataType: 'STRUCTUREDDATA',
      url: `${PORTAL_API}/web/datas/${dataId}`,
      displayName: title,
      withCredentials: true
    }
  }
}

/** 读取固定展示的结构化数据，取不到时直接跳过 */
async function collectPresetStructuredDataLayers(): Promise<DataEditorLayer[]> {
  const result = await Promise.all(
    PRESET_STRUCTURED_DATA_IDS.map(async (dataId) => {
      const detail = await fetchStructuredDataMeta(dataId)
      if (!detail) {
        return null
      }
      const title = `${detail.meta?.fileName || detail.meta?.name || dataId}`
      return buildStructuredDataLayer(dataId, title, detail.fieldNames)
    })
  )
  return result.filter((layer): layer is DataEditorLayer => !!layer)
}

/**
 * 当前示例地图（202233113）的图层来自 iPortal 数据上图，数据项为 SHP 未发布服务，
 * 不属于数据编辑支持的类型。这里额外从 iPortal 结构化数据资源中挑几个可编辑数据集，
 * 用于演示数据编辑链路。
 */
async function collectStructuredDataLayers(): Promise<DataEditorLayer[]> {
  try {
    const response = await fetch(`${PORTAL_API}/web/datas.json?pageSize=40`, {
      credentials: 'include'
    })
    if (!response.ok) {
      return []
    }
    const result = await response.json()
    const dataList: Record<string, any>[] = (result.content || []).filter(
      (item) => `${item.type || ''}`.toUpperCase() === 'STRUCTUREDDATA'
    )
    const metas = await Promise.all(
      dataList.slice(0, STRUCTURED_DATA_LIMIT * 2).map(async (item) => ({
        item,
        detail: await fetchStructuredDataMeta(item.id)
      }))
    )
    return metas
      .filter((entry) => !!entry.detail)
      .slice(0, STRUCTURED_DATA_LIMIT)
      .map(({ item, detail }) =>
        buildStructuredDataLayer(item.id, `${item.fileName || item.id}`, detail!.fieldNames)
      )
  } catch {
    return []
  }
}

async function handleLoad() {
  const [webMapLayers, presetLayers, structuredLayers] = await Promise.all([
    Promise.resolve(collectWebMapLayers()),
    collectPresetStructuredDataLayers(),
    collectStructuredDataLayers()
  ])
  const presetIds = new Set(presetLayers.map((layer) => `${layer.dataInfo?.id}`))
  layers.value = [
    ...presetLayers,
    ...structuredLayers.filter((layer) => !presetIds.has(`${layer.dataInfo?.id}`)),
    ...webMapLayers
  ]
}

function handleSaved(layerId: string) {
  savedLayerId.value = layerId
}
</script>

<template>
  <div>
    <p class="data-editor-demo__desc">
      数据编辑示例：列表只展示数据编辑支持的图层，即数据服务（rest/data）与结构化数据。
      下方结构化数据来自 iPortal 数据资源（首个为指定的「北京市住宅小区(1)」），示例地图自身的图层
      若为地图服务或未发布服务的 iPortal 上图数据，则不会出现在列表中。点击图层右侧编辑按钮，
      可在独立地图中新增/删除要素、修改几何与属性。
    </p>
    <p v-if="savedLayerId" class="data-editor-demo__saved">
      已保存图层：{{ savedLayerId }}
    </p>
    <WebMap :server-url="SERVER_URL" :map-id="MAP_ID" :target="TARGET" @load="handleLoad">
      <DataEditor
        :map-target="TARGET"
        :layers="layers"
        :root-url="EDITOR_ROOT_URL"
        :position="'top-left'"
        @saved="handleSaved"
      />
    </WebMap>
  </div>
</template>

<style lang="scss">
@use '@supermapgis/common/theme-chalk/button.scss';
@use '@supermapgis/mapboxgl/theme-chalk/webmap.scss';

.data-editor-demo__desc {
  margin-bottom: 8px;
  color: rgb(0 0 0 / 65%);
}

.data-editor-demo__saved {
  margin-bottom: 8px;
}

.sm-component-web-map {
  width: 100% !important;
  max-width: 1200px;
  height: 700px !important;
}
</style>
