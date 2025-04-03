<script setup lang="ts">
import type { Map } from 'mapbox-gl'
import type { WebMapProps, WebMapEvents, Control, MapEventHandler } from './types'
import WebMapViewModel from 'vue-iclient-core/controllers/mapboxgl/WebMapViewModel'
import mapEvent from 'vue-iclient-core/types/map-event'
import MapEvents, { MAP_EVENT_NAMES } from 'vue-iclient-core/controllers/mapboxgl/utils/MapEvents'
import { useVmProps, useLocale, useEventListeners } from '@supermapgis/common/hooks/index.common'
import { addListener, removeListener } from 'resize-detector'
import { debounce, pick } from 'lodash-es'
import { onBeforeUnmount, onMounted, onUnmounted, ref, watch, computed, useTemplateRef } from 'vue'
import { message } from 'ant-design-vue'
import SmSpin from '@supermapgis/common/components/spin/Spin'
import { webMapPropsDefault } from './types'

const viewModelProps = [
  'mapId',
  'serverUrl',
  'mapOptions.center',
  'mapOptions.zoom',
  'mapOptions.crs',
  'mapOptions.style',
  'mapOptions.minZoom',
  'mapOptions.maxZoom',
  'mapOptions.maxBounds',
  'mapOptions.renderWorldCopies',
  'mapOptions.bearing',
  'mapOptions.pitch',
  'mapOptions.rasterTileSize',
  'withCredentials',
  'proxy'
]

defineOptions({
  name: 'SmWebMap',
  inheritAttrs: false
})

const props = withDefaults(defineProps<WebMapProps>(), webMapPropsDefault)

const emit = defineEmits</* @vue-ignore */WebMapEvents>()

const el = useTemplateRef('el')
const spinning = ref(props.defaultLoading)

const controlComponents = computed(() => {
  const controls: Control = {}
  for (let key in props) {
    if (key.includes('Control') && props[key].show) {
      const controlName = key.replace('Control', '')
      const firstLetter = controlName[0]
      controls[`Sm${controlName.replace(firstLetter, firstLetter.toUpperCase())}`] = props[key]
    }
  }
  return controls
})

let viewModel: InstanceType<typeof WebMapViewModel>
let __resizeHandler: () => void

const { t } = useLocale()
const { setViewModel } = useVmProps(props, viewModelProps)
const { eventListenerNames } = useEventListeners()

const resize = () => {
  if (viewModel && viewModel.resize) {
    viewModel.resize(props.keepBounds)
  }
}

const initializeWebMap = () => {
  viewModel = new WebMapViewModel(
    props.mapId,
    pick(props, [
      'target',
      'serverUrl',
      'accessToken',
      'accessKey',
      'tiandituKey',
      'googleMapsLanguage',
      'bingMapsKey',
      'googleMapsAPIKey',
      'withCredentials',
      'excludePortalProxyUrl',
      'isSuperMapOnline',
      'proxy',
      'mapOptions',
      'iportalServiceProxyUrlPrefix',
      'tileTransformRequest'
    ]),
    props.mapOptions
  )
  setViewModel(viewModel)
}

const registerEvents = () => {
  viewModel.on({
    addlayerssucceeded: e => {
      spinning.value = false
      mapEvent.setMap(props.target, e.map, viewModel)
      e.map.resize()
      // 绑定map event
      bindMapEvents(e.map)
      /**
       * @event load
       * @desc webmap 加载完成之后触发。
       * @property {mapboxgl.Map} map - MapBoxGL Map 对象。
       */
      emit('load', { map: e.map })
    },
    mapcreatefailed: e => {
      /**
       * @event getMapFailed
       * @desc 获取 WebMap 地图信息失败。
       * @property {Object} error - 失败原因。
       */
      emit('getMapFailed', { error: e.error })
      notifyErrorTip({ e, defaultTip: 'mapCreatedFailed' })
      spinning.value = false
    },
    layercreatefailed: e => {
      /**
       * @event getLayerDatasourceFailed
       * @desc 获取图层数据失败。
       * @property {Object} error - 失败原因。
       * @property {Object} layer - 图层信息。
       * @property {mapboxgl.Map} map - MapBoxGL Map 对象。
       */
      emit('getLayerDatasourceFailed', { error: e.error, layer: e.layer, map: e.map })
      if (e.error === 'SAMPLE DATA is not supported') {
        notifyErrorTip({ defaultTip: 'sampleDataNotSupport', showErrorMsg: false })
      } else if (e.error_code === 'DRILL_LAYERS_NOT_SUPPORTED') {
        notifyErrorTip({ defaultTip: 'drillLayersNotSupport', showErrorMsg: false })
      } else {
        notifyErrorTip({ e, defaultTip: 'getLayerInfoFailed' })
      }
      // ZXY_TILE与底图的分辨率、原点不匹配。
    },
    xyztilelayernotsupport: e => {
      notifyErrorTip({
        defaultTip: t(`webmap.xyztilelayernotsupport`, { title: e.layer.name }),
        showErrorMsg: false
      })
    },
    baidumapnotsupport: () => {
      notifyErrorTip({ defaultTip: 'baiduMapNotSupport', showErrorMsg: false })
    },
    layerorsourcenameduplicated: () => {
      notifyErrorTip({ defaultTip: 'layerorsourcenameduplicated', showErrorMsg: false })
    },
    mapbeforeremove: () => {
      mapEvent.deleteMap(props.target)
    }
  })
  if (props.autoresize) {
    __resizeHandler = debounce(
      () => {
        resize()
      },
      100,
      { leading: true }
    )
    addListener(el.value, __resizeHandler)
  }
}

const bindMapEvents = (map: Map) => {
  const mapEvents = new MapEvents(eventListenerNames)
  const builtInEvents = MAP_EVENT_NAMES.reduce(
    (listeners, eventName) => {
      listeners[eventName] = ({ mapParams }: { mapParams: MapEventHandler }) => {
        // @ts-ignore
        emit(eventName, mapParams)
      }
      return listeners
    },
    {} as Record<string, (params: { mapParams: MapEventHandler }) => void>
  )
  mapEvents.on(builtInEvents)
  // @ts-ignore
  mapEvents.bindMapEvents(map)
}

const notifyErrorTip = ({
  e,
  defaultTip,
  showErrorMsg = true
}: {
  e?: any
  defaultTip: string
  showErrorMsg?: boolean
}) => {
  let msg = ''
  if (showErrorMsg) {
    if (e.error && e.error.message) {
      msg = e.error.message
    } else if (typeof e.error === 'string') {
      msg = e.error
    }
  }
  message.error(t(`webmap.${defaultTip}`) + msg)
}

const destory = () => {
  if (props.autoresize) {
    removeListener(el.value, __resizeHandler)
  }
}

watch(
  () => props.mapId,
  () => {
    if (props.defaultLoading) {
      spinning.value = true
    }
  }
)
watch(
  () => props.loading,
  (newVal: boolean) => {
    spinning.value = newVal
  }
)

onMounted(() => {
  initializeWebMap()
  registerEvents()
})

onBeforeUnmount(() => {
  destory()
})

onUnmounted(() => {
  mapEvent.deleteMap(props.target)
  viewModel.cleanWebMap()
})
</script>

<template>
  <div ref="el" :id="target" class="sm-component-web-map" :style="{ background: background, height: '100%', width:'100%', position: 'absolute' }">
    <slot></slot>
    <template v-for="(controlProps, controlName) in controlComponents" :key="controlName">
      <component :is="controlName" v-bind="controlProps"></component>
    </template>
    <sm-spin v-if="spinning" size="large" :spinning="spinning" :tip="t('webmap.loadingTip')" />
  </div>
</template>
