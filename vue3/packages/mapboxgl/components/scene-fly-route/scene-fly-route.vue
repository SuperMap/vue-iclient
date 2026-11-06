<template>
  <SmCollapseCard
    ref="sceneFlyRouteRef"
    icon-class="sm-components-icon-feihangmanyou"
    :icon-position="position"
    :header-name="t('sceneFlyRoute.title')"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :background="background"
    :textColor="textColor"
    :split-line="splitLine"
    class="sm-component-scene-fly-route"
  >
    <SmCard
      class="sm-component-scene-fly-route__panel"
      :bordered="false"
      :style="textColorHeadingStyle"
    >
      <div class="sm-component-scene-fly-route__content">
        <div class="sm-component-scene-fly-route__item">
          <div class="sm-component-scene-fly-route__toolbar">
            <button
              type="button"
              class="sm-component-scene-fly-route__button"
              :title="isPlaying ? t('sceneFlyRoute.pause') : t('sceneFlyRoute.play')"
              :style="[gisControlHeaderBgStyle, textColorStyle]"
              :disabled="!canOperate"
              @click="handleToggle"
            >
              <i :class="isPlaying ? 'sm-components-icon-zanting' : 'sm-components-icon-bofang3'" />
            </button>
            <button
              type="button"
              class="sm-component-scene-fly-route__button"
              :title="t('sceneFlyRoute.stop')"
              :style="[gisControlHeaderBgStyle, textColorStyle]"
              :disabled="!canOperate"
              @click="handleStop"
            >
              <span class="sm-component-scene-fly-route__stop-icon" />
            </button>
            <SmSelect
              v-model:value="playRate"
              class="sm-component-scene-fly-route__speed-select"
              :aria-label="t('sceneFlyRoute.speed')"
              :get-popup-container="getPopupContainer"
              placement="bottomLeft"
              :dropdown-align="{ overflow: { adjustX: true, adjustY: false } }"
              :disabled="!canOperate"
            >
              <SmSelectOption
                v-for="option in playRateOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </SmSelectOption>
            </SmSelect>
          </div>
        </div>

        <div class="sm-component-scene-fly-route__item">
          <label>{{ t('sceneFlyRoute.stopLabel') }}</label>
          <SmSelect
            v-model:value="currentStopIndex"
            class="sm-component-scene-fly-route__select"
            :get-popup-container="getPopupContainer"
            placement="bottomLeft"
            :dropdown-align="{ overflow: { adjustX: true, adjustY: false } }"
            :placeholder="t('sceneFlyRoute.stopPlaceholder')"
            :disabled="!stops.length"
            @change="handleStopChange"
          >
            <SmSelectOption
              v-for="stop in stops"
              :key="stop.index"
              :value="stop.index"
              :title="stop.name"
            >
              {{ stop.name }}
            </SmSelectOption>
          </SmSelect>
        </div>

        <div class="sm-component-scene-fly-route__item">
          <div class="sm-component-scene-fly-route__checkboxes">
            <SmCheckbox v-model:checked="isLineVisible">
              {{ t('sceneFlyRoute.showLine') }}
            </SmCheckbox>
            <SmCheckbox v-model:checked="isStopVisible">
              {{ t('sceneFlyRoute.showStop') }}
            </SmCheckbox>
          </div>
        </div>

        <div v-if="!fpfUrl" class="sm-component-scene-fly-route__item">
          <span class="sm-component-scene-fly-route__tip">
            {{ t('sceneFlyRoute.emptyTip') }}
          </span>
        </div>
        <div v-if="status === 'loading'" class="sm-component-scene-fly-route__item">
          <span class="sm-component-scene-fly-route__tip">{{ t('sceneFlyRoute.loading') }}</span>
        </div>
        <div v-else-if="errorMessage" class="sm-component-scene-fly-route__item">
          <span class="sm-component-scene-fly-route__tip" role="alert">{{ errorMessage }}</span>
        </div>
      </div>
    </SmCard>
  </SmCollapseCard>
</template>

<script setup lang="ts">
import type { SceneFlyRouteStatus, SceneFlyRouteStop } from '@supermapgis/iclient-components-core/mapboxgl/src/SceneFlyRouteViewModel'
import type { SceneFlyRouteProps } from './types'
import { computed, onBeforeUnmount, ref, useTemplateRef, watch } from 'vue'
import { useLocale, useSceneGetter, useTheme } from '@supermapgis/common/hooks/index.common'
import { useSceneControl } from '@supermapgis/mapboxgl/hooks'
import { sceneFlyRoutePropsDefault } from './types'
import SceneFlyRouteViewModel from '@supermapgis/iclient-components-core/mapboxgl/src/SceneFlyRouteViewModel'
import SmCard from '@supermapgis/common/components/card/Card'
import SmCollapseCard from '@supermapgis/common/components/collapse-card/collapse-card.vue'
import SmSelect, { SmSelectOption } from '@supermapgis/common/components/select/Select'
import SmCheckbox from '@supermapgis/common/components/checkbox/Checkbox'

defineOptions({
  name: 'SmSceneFlyRoute'
})

const props = withDefaults(defineProps<SceneFlyRouteProps>(), sceneFlyRoutePropsDefault)
const emit = defineEmits<{
  (event: 'ready', payload: { stops: SceneFlyRouteStop[] }): void
  (event: 'statusChange', payload: { status: SceneFlyRouteStatus }): void
  (event: 'stopArrived', payload: { index: number; stop: SceneFlyRouteStop }): void
  (event: 'error', payload: { error: unknown }): void
}>()

const { t } = useLocale()
const { textColorHeadingStyle, textColorStyle, gisControlHeaderBgStyle } = useTheme(props)

const rootEl = useTemplateRef('sceneFlyRouteRef')
useSceneControl(() => rootEl.value?.$el)

// 下拉浮层默认挂载到 body，场景全屏后 body 不在全屏元素内会导致下拉框不可见
function getPopupContainer(triggerNode: HTMLElement) {
  return triggerNode.parentNode as HTMLElement
}

function getOptions() {
  return {
    fpfUrl: props.options?.fpfUrl ?? props.fpfUrl,
    isLineVisible: props.options?.isLineVisible ?? props.isLineVisible,
    isStopVisible: props.options?.isStopVisible ?? props.isStopVisible,
  }
}

const viewModel = new SceneFlyRouteViewModel(getOptions())

const playRateOptions = [
  { value: 0.5, label: '0.5x' },
  { value: 1, label: '1.0x' },
  { value: 1.5, label: '1.5x' },
  { value: 2, label: '2.0x' },
  { value: 3, label: '3.0x' },
  { value: 5, label: '5.0x' }
]
const isPlaying = ref(viewModel.isPlaying)
const status = ref<SceneFlyRouteStatus>(viewModel.status)
const stops = ref(viewModel.getStops())
const isReady = ref(viewModel.isReady)
const currentStopIndex = ref<number | undefined>(undefined)
const errorMessage = ref('')
const playRate = ref(1)
const isLineVisible = ref(getOptions().isLineVisible)
const isStopVisible = ref(getOptions().isStopVisible)
const fpfUrl = computed(() => getOptions().fpfUrl)

const canOperate = computed(() => isReady.value && status.value !== 'loading')

viewModel.on('statuschange', ({ status: nextStatus }: { status: SceneFlyRouteStatus }) => {
  status.value = nextStatus
  isReady.value = viewModel.isReady
  isPlaying.value = nextStatus === 'playing'
  if (nextStatus === 'loading' || nextStatus === 'ready') {
    errorMessage.value = ''
  }
  if (nextStatus === 'idle') {
    currentStopIndex.value = undefined
  }
  emit('statusChange', { status: nextStatus })
})
viewModel.on('stopschange', ({ stops: next }: { stops: SceneFlyRouteStop[] }) => {
  stops.value = next
  isReady.value = viewModel.isReady
  currentStopIndex.value = undefined
})
viewModel.on('ready', (payload: { stops: SceneFlyRouteStop[] }) => {
  emit('ready', payload)
})
viewModel.on('stoparrived', (payload: { index: number; stop: SceneFlyRouteStop }) => {
  emit('stopArrived', payload)
})
viewModel.on('error', (payload: { error: unknown }) => {
  errorMessage.value = payload.error instanceof Error ? payload.error.message : String(payload.error)
  emit('error', payload)
})

useSceneGetter({
  loaded: (viewer: unknown) => {
    viewModel.setViewer(viewer)
    if (fpfUrl.value) {
      viewModel.load(fpfUrl.value)
    }
  },
  removed: () => {
    viewModel.exit()
    viewModel.setViewer(null)
  }
})

watch(
  () => props.sceneTarget,
  () => {
    viewModel.exit()
    viewModel.setViewer(null)
  },
  { flush: 'sync' }
)

watch(fpfUrl, value => {
  if (value) {
    viewModel.load(value)
  } else {
    viewModel.exit()
  }
})

watch(isLineVisible, value => {
  viewModel.setLineVisible(value)
})

watch(isStopVisible, value => {
  viewModel.setStopVisible(value)
})

watch(playRate, value => {
  viewModel.setPlayRate(value)
})

watch(
  () => getOptions(),
  options => {
    isLineVisible.value = options.isLineVisible
    isStopVisible.value = options.isStopVisible
    viewModel.updateOptions({
      isLineVisible: options.isLineVisible,
      isStopVisible: options.isStopVisible,
    })
  }
)

function handleToggle() {
  viewModel.toggle()
}

function handleStop() {
  viewModel.stop()
  currentStopIndex.value = undefined
}

function handleStopChange(value: unknown) {
  viewModel.viewToStop(Number(value))
}

defineExpose({
  viewModel,
  toggle: () => viewModel.toggle(),
  play: () => viewModel.play(),
  pause: () => viewModel.pause(),
  stop: () => viewModel.stop(),
  exit: () => viewModel.exit(),
  viewToStop: (index: number) => viewModel.viewToStop(index),
  setPlayRate: (value: number) => viewModel.setPlayRate(value),
  setLineVisible: (value: boolean) => viewModel.setLineVisible(value),
  setStopVisible: (value: boolean) => viewModel.setStopVisible(value),
  getStops: () => viewModel.getStops()
})

onBeforeUnmount(() => {
  viewModel.destroy()
})
</script>
