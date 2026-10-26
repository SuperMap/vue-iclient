<template>
  <sm-collapse-card
    v-show="isShow"
    :icon-class="iconClass"
    :icon-position="position"
    :header-name="headerName ?? t('dataEditor.title')"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :background="background"
    :text-color="textColor"
    :split-line="splitLine"
    class="sm-component-data-editor"
  >
    <sm-card
      class="sm-component-data-editor__card"
      :bordered="false"
      :style="textColorHeadingStyle"
    >
      <div class="sm-component-data-editor__content">
        <div v-if="editableLayers.length" class="sm-component-data-editor__list">
          <div
            v-for="layer in editableLayers"
            :key="layer.id"
            class="sm-component-data-editor__item"
          >
            <span class="sm-component-data-editor__name" :title="getLayerTitle(layer)">
              {{ getLayerTitle(layer) }}
            </span>
            <Tooltip :title="getEditButtonTitle(layer)">
              <button
                class="sm-component-data-editor__edit"
                :class="{ 'sm-component-data-editor__edit--disabled': !canEditLayer(layer) }"
                type="button"
                :disabled="!canEditLayer(layer)"
                @click="openDialog(layer)"
              >
                <i class="sm-components-icon-edit"></i>
              </button>
            </Tooltip>
          </div>
        </div>
        <div v-else class="sm-component-data-editor__empty">
          {{ t('dataEditor.empty') }}
        </div>
      </div>
    </sm-card>
    <data-editor-dialog
      v-if="dialogVisible && selectedLayer"
      :key="selectedLayer.id"
      :layer="selectedLayer"
      :map="getMap()"
      :webmap="getWebMap()"
      :root-url="rootUrl"
      :theme="editorTheme"
      :width="dialogWidth"
      :display-level-range="displayLevelRange"
      @saved="handleSaved"
      @close="closeDialog"
    />
  </sm-collapse-card>
</template>

<script lang="ts" setup>
import type {
  DataEditorEditableState,
  DataEditorEvents,
  DataEditorLayer,
  DataEditorProps,
  DataEditorTheme
} from './types'
import type { Map } from 'mapbox-gl'
import { computed, ref, watch } from 'vue'
import { Tooltip } from 'ant-design-vue'
import {
  useLocale,
  useMapGetter,
  useTheme
} from '@supermapgis/common/hooks/index.common'
import { useMapControl } from '@supermapgis/mapboxgl/hooks'
import SmCollapseCard from '@supermapgis/common/components/collapse-card/collapse-card.vue'
import SmCard from '@supermapgis/common/components/card/Card'
import DataEditorDialog from './data-editor-dialog.vue'
import { getLayerTitle } from './utils'
import { dataEditorPropsDefault } from './types'

defineOptions({
  name: 'SmDataEditor'
})

const props = withDefaults(defineProps<DataEditorProps>(), dataEditorPropsDefault)

const emit = defineEmits<DataEditorEvents>()

const { isShow } = useMapControl()
const { t } = useLocale()
const { themeType, textColorHeadingStyle } = useTheme(props)

const dialogVisible = ref(false)
const selectedLayer = ref<DataEditorLayer | null>(null)
/** 各图层的可编辑状态，checkEditable 异步返回前保持 pending */
const editableState = ref<Record<string, DataEditorEditableState>>({})
let refreshToken = 0

const { getMap, getWebMap } = useMapGetter<Map>()

const editableLayers = computed(() => (props.layers || []).filter((layer) => !!layer?.id))

const editorTheme = computed<DataEditorTheme>(
  () => props.theme || (themeType.value === 'light' ? 'light' : 'dark')
)

async function resolveEditable(layer: DataEditorLayer): Promise<boolean> {
  if (typeof layer.editable === 'boolean') {
    return layer.editable
  }
  if (!props.checkEditable) {
    return true
  }
  try {
    const result = await props.checkEditable(layer)
    return result !== false
  } catch {
    return false
  }
}

async function refreshEditableState() {
  const token = ++refreshToken
  const pendingState: Record<string, DataEditorEditableState> = {}
  editableLayers.value.forEach((layer) => {
    pendingState[layer.id] = 'pending'
  })
  editableState.value = pendingState
  editableLayers.value.forEach(async (layer) => {
    const editable = await resolveEditable(layer)
    if (token !== refreshToken) {
      return
    }
    editableState.value = {
      ...editableState.value,
      [layer.id]: editable ? 'editable' : 'readonly'
    }
  })
}

function getEditableState(layer: DataEditorLayer): DataEditorEditableState {
  return editableState.value[layer.id] || 'editable'
}

function canEditLayer(layer: DataEditorLayer): boolean {
  return getEditableState(layer) === 'editable'
}

function getEditButtonTitle(layer: DataEditorLayer): string {
  const state = getEditableState(layer)
  if (state === 'pending') {
    return t('dataEditor.checking')
  }
  return state === 'readonly' ? t('dataEditor.editNoPermission') : t('dataEditor.edit')
}

function openDialog(layer: DataEditorLayer) {
  if (!canEditLayer(layer)) {
    return
  }
  selectedLayer.value = layer
  dialogVisible.value = true
  emit('open', layer)
}

function closeDialog() {
  dialogVisible.value = false
  selectedLayer.value = null
  emit('close')
}

function handleSaved(layerId: string) {
  emit('saved', layerId)
}

watch(editableLayers, () => refreshEditableState(), { immediate: true })

watch(
  () => props.layers,
  () => {
    if (!dialogVisible.value) {
      selectedLayer.value = null
    }
  }
)
</script>

