<script setup lang="ts">
import WebMapViewModel from 'vue-iclient-core/controllers/mapboxgl/WebMapViewModel'
import mapEvent from 'vue-iclient-core/types/map-event'
// import VmUpdater from 'vue-iclient/src/common/_mixin/VmUpdater'
// import MapEvents from 'vue-iclient/src/mapboxgl/web-map/_mixin/map-events'
import { addListener, removeListener } from 'resize-detector'
import { debounce } from 'lodash-unified'
// import SmSpin from 'vue-iclient/src/common/spin/Spin.vue'
// import Message from 'vue-iclient/src/common/message/Message.js'
import { onBeforeUnmount, onMounted, onUnmounted, ref, watch, computed } from 'vue'
import { Spin as ASpin } from 'ant-design-vue'

interface commonControlParam {
  show?: boolean
  position?: string
  background?: string
  textColor?: string
}

interface cardCommonParam extends commonControlParam {
  collapsed?: boolean
  headerName?: string
}

interface zoomParam extends commonControlParam {
  showZoomSlider?: boolean
}

interface measureParam extends cardCommonParam {
  showUnitSelect?: boolean
  distanceDefaultUnit?: string
  areaDefaultUnit?: string
}

interface legendParam extends cardCommonParam {
  layerNames: Array<string>
  isShowTitle?: boolean
  isShowField?: boolean
  mode?: string
}

interface queryParam extends cardCommonParam {
  maxFeatures?: number
  layerStyle?: Record<string, any>
  iportalData?: Array<Record<string, any>>
  restData?: Array<Record<string, any>>
  restMap?: Array<Record<string, any>>
}

interface searchParam extends commonControlParam {
  maxFeatures?: number
  layerNames?: Array<string>
  onlineLocalSearch?: Object
  iportalData?: Array<Object>
  restData?: Array<Object>
  restMap?: Array<Object>
  addressMatch?: Array<string>
}

interface identifyParam {
  show?: boolean
  layers?: Array<Object>
  fields?: Array<string>
  layerStyle?: Object
  clickAreaAround?: number
}

interface layerManageParam {
  show?: boolean
  layers?: Array<Object>
}

interface controlProps {
  panControl?: commonControlParam
  scaleControl?: commonControlParam
  zoomControl?: zoomParam
  miniMapControl?: cardCommonParam
  layerListControl?: cardCommonParam
  measureControl?: measureParam
  legendControl?: legendParam
  queryControl?: queryParam
  searchControl?: searchParam
  identifyControl?: identifyParam
  layerManagerControl?: layerManageParam
}

const props = withDefaults(
  defineProps<{
    mapId: string | number | Record<string, any>
    target?: string
    serverUrl?: string
    accessToken?: string
    accessKey?: string
    tiandituKey?: string
    bingMapsKey?: string
    googleMapsAPIKey?: string
    googleMapsLanguage?: string
    withCredentials?: boolean
    excludePortalProxyUrl?: boolean
    isSuperMapOnline?: boolean
    proxy?: boolean | string
    defaultLoading?: boolean
    loading?: boolean
    background?: string
    iportalServiceProxyUrlPrefix?: string
    mapOptions?: Record<string, any>
    autoresize?: boolean
    keepBounds?: boolean
    panControl?: commonControlParam
    scaleControl?: commonControlParam
    zoomControl?: zoomParam
    miniMapControl?: cardCommonParam
    layerListControl?: cardCommonParam
    measureControl?: measureParam
    legendControl?: legendParam
    queryControl?: queryParam
    searchControl?: searchParam
    identifyControl?: identifyParam
    layerManagerControl?: layerManageParam
    tileTransformRequest?: (url: string) => Object
  }>(),
  {
    target: 'map',
    serverUrl: 'https://www.supermapol.com',
    googleMapsLanguage: 'zh-CN',
    withCredentials: false,
    defaultLoading: false,
    loading: false,
    autoresize: true,
    keepBounds: true,
    panControl: () => ({ show: false, position: 'top-left' }),
    scaleControl: () => ({ show: false, position: 'bottom-left' }),
    zoomControl: () => ({ show: false, position: 'top-left' }),
    miniMapControl: () => ({ show: false, position: 'bottom-right' }),
    layerListControl: () => ({ show: false, position: 'top-right' }),
    measureControl: () => ({
      show: false,
      position: 'top-right',
      showUnitSelect: true,
      distanceDefaultUnit: 'kilometers',
      areaDefaultUnit: 'kilometers'
    }),
    legendControl: () => ({
      show: false,
      position: 'bottom-left',
      layerNames: [],
      isShowTitle: false,
      isShowField: false,
      mode: 'simple'
    }),
    queryControl: () => ({ show: false, position: 'top-right' }),
    searchControl: () => ({ show: false, position: 'top-right' }),
    identifyControl: () => ({
      show: false,
      layers: [],
      fields: [],
      layerStyle: {},
      clickAreaAround: 5
    }),
    layerManagerControl: () => ({ show: false, layers: [] })
  }
)

const emit = defineEmits<{
  (e: 'load', data: { map: any }): void
  (e: 'getMapFailed', data: { error: any }): void
  (e: 'getLayerDatasourceFailed', data: { error: any; layer: any; map: any }): void
}>()

const el = ref<HTMLInputElement | null>(null)
const spinning = ref(true)
const controlComponents = computed(() => {
  const controls: controlProps = {}
  for (let key in props) {
    if (key.includes('Control') && props[key].show) {
      const controlName = key.replace('Control', '')
      const firstLetter = controlName[0]
      controls[`Sm${controlName.replace(firstLetter, firstLetter.toUpperCase())}`] = props[key]
    }
  }
  return controls
})

const resize = () => {
  if (viewModel && viewModel.resize) {
    viewModel.resize(props.keepBounds)
  }
}

let map: any
let viewModel: InstanceType<typeof WebMapViewModel>
let __resizeHandler: () => void
const initializeWebMap = () => {
  let {
    target,
    serverUrl,
    accessToken,
    accessKey,
    tiandituKey,
    googleMapsLanguage,
    bingMapsKey,
    googleMapsAPIKey,
    withCredentials,
    excludePortalProxyUrl,
    isSuperMapOnline,
    proxy,
    mapOptions,
    iportalServiceProxyUrlPrefix,
    tileTransformRequest
  } = props
  viewModel = new WebMapViewModel(
    props.mapId,
    {
      target,
      serverUrl,
      accessToken,
      accessKey,
      tiandituKey,
      googleMapsLanguage,
      bingMapsKey,
      googleMapsAPIKey,
      withCredentials,
      excludePortalProxyUrl,
      isSuperMapOnline,
      proxy,
      iportalServiceProxyUrlPrefix,
      tileTransformRequest
    },
    mapOptions
  )
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

const registerEvents = () => {
  viewModel.on({
    addlayerssucceeded: e => {
      spinning.value = false
      mapEvent.setMap(props.target, e.map, viewModel)
      e.map.resize()
      map = e.map
      // 绑定map event
      // this.bindMapEvents();
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
      // notifyErrorTip({ defaultTip: this.$t(`webmap.xyztilelayernotsupport`, { title: e.layer.name }), showErrorMsg: false });
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
  // Message.error(this.$t(`webmap.${defaultTip}`) + msg);
}

const destory = () => {
  if (props.autoresize) {
    removeListener(el.value, __resizeHandler)
  }
}

watch(
  () => props.mapId,
  (newVal: string, oldVal: string) => {
    if (props.defaultLoading) {
      spinning.value = true
    }
  }
)
watch(
  () => props.loading,
  (newVal: string) => {
    spinning.value = newVal
  }
)

onBeforeUnmount(() => {
  if (!props.defaultLoading) {
    spinning.value = false
  }
})

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
  <div ref="el" :id="target" class="sm-component-web-map" :style="{ background: background }">
    <slot></slot>
    <template v-for="(controlProps, controlName) in controlComponents" :key="controlName">
      <component :is="controlName" v-bind="controlProps"></component>
    </template>
    <!-- :tip="$t('webmap.loadingTip')" -->
    <a-spin v-if="spinning" size="large" :spinning="spinning" />
  </div>
</template>
