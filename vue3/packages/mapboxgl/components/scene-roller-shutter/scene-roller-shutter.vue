<template>
  <SmCollapseCard
    ref="rollerShutterRef"
    v-bind="attrs"
    icon-class="sm-components-icon-layer-list"
    :icon-position="position"
    :header-name="t('sceneRollerShutter.title')"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :background="background"
    :textColor="textColor"
    :split-line="splitLine"
    class="sm-component-scene-roller-shutter"
  >
    <SmCard
      class="sm-component-scene-roller-shutter__panel"
      :bordered="false"
      :style="textColorHeadingStyle"
    >
      <div class="sm-component-scene-roller-shutter__content">
        <template v-if="isReady">
          <div class="sm-component-scene-roller-shutter__item">
            <label>{{ t('sceneRollerShutter.modeLabel') }}</label>
            <SmSelect
              v-model:value="mode"
              class="sm-component-scene-roller-shutter__control"
              @change="handleModeChange"
            >
              <SmSelectOption
                v-for="option in modeOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </SmSelectOption>
            </SmSelect>
          </div>

          <template v-if="layers.length">
            <div class="sm-component-scene-roller-shutter__layer-list">
              <section
                v-if="sceneLayerItems.length"
                class="sm-component-scene-roller-shutter__layer-section"
              >
                <h4 class="sm-component-scene-roller-shutter__layer-section-title">
                  {{ t('sceneRollerShutter.s3mLayers') }}
                </h4>
                <div
                  v-for="layer in sceneLayerItems"
                  :key="layer.id"
                  class="sm-component-scene-roller-shutter__layer-item"
                >
                  <span class="sm-component-scene-roller-shutter__layer-name" :title="layer.name">
                    {{ layer.name }}
                  </span>
                  <div
                    v-if="mode !== 'NONE'"
                    class="sm-component-scene-roller-shutter__display-row"
                  >
                    <label class="sm-component-scene-roller-shutter__display-label">
                      {{ t('sceneRollerShutter.displayLabel') }}
                    </label>
                    <SmSelect
                      v-model:value="layer.display"
                      class="sm-component-scene-roller-shutter__display-control"
                      @change="setLayerDisplay(layer)"
                    >
                      <SmSelectOption
                        v-for="option in layerDisplayOptions"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </SmSelectOption>
                    </SmSelect>
                  </div>
                  <span v-else class="sm-component-scene-roller-shutter__status">
                    {{ t('sceneRollerShutter.modeNone') }}
                  </span>
                </div>
              </section>

              <section
                v-if="imageryLayerItems.length"
                class="sm-component-scene-roller-shutter__layer-section"
              >
                <h4 class="sm-component-scene-roller-shutter__layer-section-title">
                  {{ t('sceneRollerShutter.imageryLayers') }}
                </h4>
                <div
                  v-for="layer in imageryLayerItems"
                  :key="layer.id"
                  class="sm-component-scene-roller-shutter__layer-item"
                >
                  <span class="sm-component-scene-roller-shutter__layer-name" :title="layer.name">
                    {{ layer.name }}
                  </span>
                  <div
                    v-if="mode !== 'NONE'"
                    class="sm-component-scene-roller-shutter__display-row"
                  >
                    <label class="sm-component-scene-roller-shutter__display-label">
                      {{ t('sceneRollerShutter.displayLabel') }}
                    </label>
                    <SmSelect
                      v-model:value="layer.display"
                      class="sm-component-scene-roller-shutter__display-control"
                      @change="setLayerDisplay(layer)"
                    >
                      <SmSelectOption
                        v-for="option in layerDisplayOptions"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </SmSelectOption>
                    </SmSelect>
                  </div>
                  <span v-else class="sm-component-scene-roller-shutter__status">
                    {{ t('sceneRollerShutter.modeNone') }}
                  </span>
                </div>
              </section>
            </div>
          </template>
          <SmEmpty
            v-else
            class="sm-component-scene-roller-shutter__empty"
            :description="t('sceneRollerShutter.noLayers')"
          />
        </template>
        <SmEmpty
          v-else
          class="sm-component-scene-roller-shutter__empty"
          :description="t('sceneRollerShutter.notReady')"
        />
      </div>
    </SmCard>
  </SmCollapseCard>

  <Teleport v-if="viewerContainer" :to="viewerContainer">
    <div
      v-show="mode !== 'NONE'"
      ref="sliderElement"
      class="sm-component-scene-roller-shutter__slider"
      :class="
        mode === 'VERTICAL'
          ? 'sm-component-scene-roller-shutter__slider--horizontal'
          : 'sm-component-scene-roller-shutter__slider--vertical'
      "
    ></div>
  </Teleport>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  shallowRef,
  toRaw,
  useAttrs,
  useTemplateRef
} from 'vue'
import type { SceneRollerShutterProps } from './types'
import { sceneRollerShutterPropsDefault } from './types'
import {
  SceneRollerShutter,
  type RollerShutterLayerDisplay,
  type RollerShutterMode
} from 'vue-iclient-core/utils/scene/roller-shutter'
import { useLocale, useSceneGetter, useTheme } from '@supermapgis/common/hooks/index.common'
import { useSceneControl } from '@supermapgis/mapboxgl/hooks'
import { getImageryLayerName } from '@supermapgis/mapboxgl/utils'
import SmCard from '@supermapgis/common/components/card/Card'
import SmCollapseCard from '@supermapgis/common/components/collapse-card/collapse-card.vue'
import SmEmpty from '@supermapgis/common/components/empty/Empty'
import SmSelect, { SmSelectOption } from '@supermapgis/common/components/select/Select'

defineOptions({
  name: 'SmSceneRollerShutter',
  inheritAttrs: false
})

type LayerKind = 'scene' | 'imagery'
type SceneLayer = Record<string, unknown>

interface SceneViewer extends SceneLayer {
  container?: HTMLElement
  scene?: {
    layers?: {
      layerQueue?: SceneLayer[]
      _layerQueue?: SceneLayer[]
    }
  }
  imageryLayers?: {
    _layers?: SceneLayer[]
  }
}

interface LayerItem {
  id: string
  name: string
  layer: SceneLayer
  kind: LayerKind
  display: RollerShutterLayerDisplay
}

const props = withDefaults(defineProps<SceneRollerShutterProps>(), sceneRollerShutterPropsDefault)
const attrs = useAttrs()

const { t } = useLocale()
const { textColorHeadingStyle } = useTheme(props)

const rollerShutterRef = useTemplateRef('rollerShutterRef')
useSceneControl(() => rollerShutterRef.value?.$el)

const viewerContainer = shallowRef<HTMLElement | null>(null)
const sliderElement = shallowRef<HTMLElement | null>(null)
const isReady = ref(false)
const mode = ref<RollerShutterMode>('NONE')
const layers = ref<LayerItem[]>([])

let viewer: SceneViewer | null = null
let rollerShutter: SceneRollerShutter | null = null
let loadVersion = 0
let layerObjectId = 0
const layerIdMap = new WeakMap<object, string>()

const modeOptions = computed(() => [
  { label: t('sceneRollerShutter.modeNone'), value: 'NONE' },
  { label: t('sceneRollerShutter.modeHorizontal'), value: 'HORIZONTAL' },
  { label: t('sceneRollerShutter.modeVertical'), value: 'VERTICAL' }
])

const layerDisplayOptions = computed(() => {
  if (mode.value === 'VERTICAL') {
    return [
      { label: t('sceneRollerShutter.displayAll'), value: 'all' },
      { label: t('sceneRollerShutter.displayNone'), value: 'none' },
      { label: t('sceneRollerShutter.top'), value: 'first' },
      { label: t('sceneRollerShutter.bottom'), value: 'second' }
    ]
  }
  return [
    { label: t('sceneRollerShutter.displayAll'), value: 'all' },
    { label: t('sceneRollerShutter.displayNone'), value: 'none' },
    { label: t('sceneRollerShutter.left'), value: 'first' },
    { label: t('sceneRollerShutter.right'), value: 'second' }
  ]
})

const sceneLayerItems = computed(() => layers.value.filter(layer => layer.kind === 'scene'))
const imageryLayerItems = computed(() => layers.value.filter(layer => layer.kind === 'imagery'))

useSceneGetter({
  loaded: setViewer,
  removed: clearViewer
})

async function setViewer(sceneViewer: unknown) {
  const currentLoadVersion = ++loadVersion
  destroyRollerShutter()
  const rawViewer = toRaw(sceneViewer)
  if (!isSceneViewer(rawViewer)) {
    clearViewer()
    return
  }
  viewer = rawViewer
  viewerContainer.value = viewer?.container ?? null
  layers.value = buildLayerItems()
  isReady.value = true

  await nextTick()

  if (currentLoadVersion !== loadVersion || !viewer || !sliderElement.value) {
    return
  }

  rollerShutter = new SceneRollerShutter(viewer, {
    mode: mode.value,
    sliderElement: sliderElement.value,
    layers: buildControllerLayers()
  })
}

function clearViewer() {
  loadVersion += 1
  destroyRollerShutter()
  viewer = null
  viewerContainer.value = null
  layers.value = []
  isReady.value = false
  mode.value = 'NONE'
}

function destroyRollerShutter() {
  rollerShutter?.destroy()
  rollerShutter = null
}

function handleModeChange(nextMode: RollerShutterMode) {
  mode.value = rollerShutter?.setMode(nextMode) ?? nextMode
}

function setLayerDisplay(layerItem: LayerItem) {
  rollerShutter?.setLayerDisplay(toRaw(layerItem.layer), layerItem.display)
}

function buildLayerItems() {
  const existingStateMap = new Map<string, LayerItem>()
  layers.value.forEach(layer => {
    existingStateMap.set(layer.id, layer)
  })
  const sceneItems: LayerItem[] = getSceneLayers().map((sceneLayer, index) => {
    const layer = toRaw(sceneLayer)
    const id = getLayerId('scene', layer, index)
    const existing = existingStateMap.get(id)
    return {
      id,
      name: getLayerName(layer) ?? t('sceneRollerShutter.layer') + ' ' + (index + 1),
      layer,
      kind: 'scene' as const,
      display: existing?.display ?? 'all'
    }
  })
  const imageryItems: LayerItem[] = getImageryLayers().map((imageryLayer, index) => {
    const layer = toRaw(imageryLayer)
    const id = getLayerId('imagery', layer, index)
    const existing = existingStateMap.get(id)
    return {
      id,
      name: getImageryLayerName(layer, t, {
        fallback: t('sceneRollerShutter.imageryLayer') + ' ' + (index + 1)
      }),
      layer,
      kind: 'imagery' as const,
      display: existing?.display ?? 'all'
    }
  })
  return [...sceneItems, ...imageryItems]
}

function buildControllerLayers() {
  return layers.value.map(layerItem => ({
    layer: toRaw(layerItem.layer),
    display: layerItem.display
  }))
}

function getSceneLayers() {
  const sceneLayers = viewer?.scene?.layers
  const layerQueue = sceneLayers?.layerQueue ?? sceneLayers?._layerQueue
  return Array.isArray(layerQueue) ? layerQueue : []
}

function getImageryLayers() {
  const imageryLayers = viewer?.imageryLayers?._layers
  return Array.isArray(imageryLayers) ? imageryLayers : []
}

function getImageryProvider(layer: SceneLayer) {
  const imageryProvider = layer.imageryProvider ?? layer._imageryProvider
  return isSceneLayer(imageryProvider) ? imageryProvider : undefined
}

function getLayerName(layer?: SceneLayer) {
  return typeof layer?.name === 'string' && layer.name ? layer.name : undefined
}

function getLayerId(kind: LayerKind, layer: SceneLayer | null | undefined, index: number) {
  if (!layer) {
    return kind + '-layer-' + index
  }
  const cachedId = layerIdMap.get(layer)
  if (cachedId) {
    return cachedId
  }
  const imageryProvider = getImageryProvider(layer)
  const identityHint =
    layer.id ??
    layer.name ??
    imageryProvider?.url ??
    imageryProvider?._url ??
    imageryProvider?.name ??
    index
  const id = kind + '-' + String(identityHint) + '-' + layerObjectId++
  layerIdMap.set(layer, id)
  return id
}

function isSceneLayer(value: unknown): value is SceneLayer {
  return Boolean(value) && typeof value === 'object'
}

function isSceneViewer(value: unknown): value is SceneViewer {
  return isSceneLayer(value)
}

onBeforeUnmount(() => {
  clearViewer()
})
</script>
