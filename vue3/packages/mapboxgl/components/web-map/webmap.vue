<script setup lang="ts">
import type { WebMapProps, WebMapEmits, ControlProps } from './webmap'
import WebMapViewModel from 'vue-iclient-core/controllers/mapboxgl/WebMapViewModel'
import mapEvent from 'vue-iclient-core/types/map-event'
import MapEvents, { MAP_EVENT_NAMES } from 'vue-iclient-core/controllers/mapboxgl/utils/MapEvents'
import { useVmProps, useLocale } from '@supermapgis/common/hooks'
import { addListener, removeListener } from 'resize-detector'
import { debounce, pick, cloneDeep } from 'lodash-es'
import { onBeforeUnmount, onMounted, onUnmounted, ref, watch, computed, useAttrs, getCurrentInstance } from 'vue'
import { Spin as ASpin } from 'ant-design-vue'
import { webMapPropsDefault } from './webmap'

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
});

const props = withDefaults(defineProps<WebMapProps>(), webMapPropsDefault)

const emit = defineEmits(['load', 'getMapFailed', 'getLayerDatasourceFailed'].concat(MAP_EVENT_NAMES)) as unknown as WebMapEmits

const el = ref<HTMLInputElement | null>(null)
const spinning = ref(true)

const controlComponents = computed(() => {
  const controls: ControlProps = {}
  for (let key in props) {
    if (key.includes('Control') && props[key].show) {
      const controlName = key.replace('Control', '')
      const firstLetter = controlName[0]
      controls[`Sm${controlName.replace(firstLetter, firstLetter.toUpperCase())}`] = props[key]
    }
  }
  return controls
})

let map: any
let viewModel: InstanceType<typeof WebMapViewModel>
let mapEventsInstance: InstanceType<typeof MapEvents>
let __resizeHandler: () => void

const { t } = useLocale()
const { setViewModel } = useVmProps(props, viewModelProps)
const attrs = useAttrs();
const componentInstance = getCurrentInstance();

const resize = () => {
  if (viewModel && viewModel.resize) {
    viewModel.resize(props.keepBounds)
  }
}

const initializeWebMap = () => {
  mapEventsInstance = new MapEvents(cloneDeep(attrs));
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
      map = e.map
      // 绑定map event
      mapEventsInstance.bindMapEvents(e.map);
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
      notifyErrorTip({ defaultTip: t(`webmap.xyztilelayernotsupport`, { title: e.layer.name }), showErrorMsg: false });
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
  const builtInEvents = MAP_EVENT_NAMES.reduce((listeners, eventName) => {
    listeners[eventName] = ({ mapParams }: { mapParams: Record<string, any> }) => {
      // @ts-ignore
      emit(eventName, { ...mapParams, component: componentInstance })
    }
    return listeners;
  }, {} as Record<string , any>);
  mapEventsInstance.on(builtInEvents);
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
  // Message.error(t(`webmap.${defaultTip}`) + msg);
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
    <ASpin v-if="spinning" size="large" :spinning="spinning" :tip="t('webmap.loadingTip')" />
  </div>
</template>
