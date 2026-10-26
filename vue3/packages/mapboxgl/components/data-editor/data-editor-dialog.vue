<template>
  <Modal
    :open="visible"
    :title="t('dataEditor.dialogTitle')"
    :footer="null"
    :width="modalWidth"
    :keyboard="false"
    :mask-closable="false"
    wrap-class-name="sm-component-data-editor-dialog"
    class="sm-component-data-editor-dialog__modal"
    @cancel="handleClose"
  >
    <div class="sm-component-data-editor-dialog__body">
      <div ref="mapHolder" class="sm-component-data-editor-dialog__map"></div>
      <div v-if="editorUnavailable" class="sm-component-data-editor-dialog__empty">
        {{ t('dataEditor.unsupportedData') }}
      </div>
    </div>
    <div class="sm-component-data-editor-dialog__tips">
      <div>1. {{ t('dataEditor.multiSelectTip') }}</div>
      <div>2. {{ t('dataEditor.exitDrawingTip') }}</div>
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import type { DataEditorDialogProps } from './types'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { Modal } from 'ant-design-vue'
import { MapEditor } from '@supermapgis/data-edit'
import { useLocale } from '@supermapgis/common/hooks/index.common'
import { buildDialogStyle, buildEditorData, getMapConstructor } from './utils'

defineOptions({
  name: 'SmDataEditorDialog'
})

const props = withDefaults(defineProps<DataEditorDialogProps>(), {
  layer: null,
  map: null,
  webmap: null,
  rootUrl: '',
  theme: 'dark',
  width: '100vw',
  displayLevelRange: () => []
})

const emit = defineEmits<{
  (event: 'saved', layerId: string): void
  (event: 'close'): void
}>()

const { t } = useLocale()

const mapHolder = ref<HTMLDivElement | null>(null)
const dialogMap = shallowRef<any>(null)
const dataEditor = shallowRef<any>(null)
const hasSaved = ref(false)
const visible = ref(true)
/** 当前图层缺少可编辑数据源时为 true，仅展示提示不再初始化编辑器 */
const editorUnavailable = ref(false)

const modalWidth = computed(() => {
  if (typeof props.width === 'number') {
    return `${props.width}px`
  }
  return props.width || '100vw'
})

/** 数据编辑器的界面文案 */
const editorLang = computed(() => ({
  addButton: t('dataEditor.mapEditorLang.addButton'),
  deleteButton: t('dataEditor.mapEditorLang.deleteButton'),
  saveButton: t('dataEditor.mapEditorLang.saveButton'),
  popupTitle: t('dataEditor.mapEditorLang.popupTitle'),
  popupConfirm: t('dataEditor.mapEditorLang.popupConfirm'),
  popupCancel: t('dataEditor.mapEditorLang.popupCancel'),
  requiredField: t('dataEditor.mapEditorLang.requiredField'),
  selectedData: t('dataEditor.selectedData')
}))

function normalizeRootUrl(rootUrl = '') {
  if (rootUrl.startsWith('/')) {
    return `${window.location.origin}${rootUrl}`
  }
  return rootUrl
}

function handleSave() {
  hasSaved.value = true
}

function closeDialog() {
  if (hasSaved.value && props.layer?.id) {
    emit('saved', props.layer.id)
    hasSaved.value = false
  }
  visible.value = false
  emit('close')
}

function handleClose() {
  const editFeatures =
    typeof dataEditor.value?.getEditFeature === 'function'
      ? dataEditor.value.getEditFeature()
      : []
  if (!Array.isArray(editFeatures) || !editFeatures.length) {
    closeDialog()
    return
  }
  Modal.confirm({
    title: t('dataEditor.closeConfirmTitle'),
    content: t('dataEditor.closeConfirmContent'),
    okText: t('dataEditor.confirm'),
    cancelText: t('dataEditor.cancel'),
    onOk: () => closeDialog()
  })
}

function buildMapEditorOptions() {
  const data = buildEditorData(props.layer)
  if (!data) {
    return null
  }
  const permissions = props.layer?.permissions || {}
  return {
    rootUrl: normalizeRootUrl(props.rootUrl),
    addEnable: permissions.create !== false,
    deleteEnable: permissions.delete !== false,
    updateGeometryEnable: permissions.geometryEditing !== false,
    updatePropertyEnable: permissions.attributesEditing !== false,
    saveCallback: handleSave,
    theme: props.theme,
    lang: editorLang.value,
    data
  }
}

function createDataEditor(map: any) {
  const options = buildMapEditorOptions()
  if (!options) {
    editorUnavailable.value = true
    return
  }
  dataEditor.value = new MapEditor(map, options)
}

/**
 * 编辑弹窗地图的缩放级别范围：
 * 配置了 displayLevelRange 就用配置值，否则沿用主地图的级别范围
 */
function getDialogZoomRange(mainMap: any) {
  const configured = Array.isArray(props.displayLevelRange) ? props.displayLevelRange : []
  if (configured.length === 2) {
    return { minZoom: Number(configured[0]), maxZoom: Number(configured[1]) }
  }
  return {
    minZoom: typeof mainMap.getMinZoom === 'function' ? mainMap.getMinZoom() : Number.NaN,
    maxZoom: typeof mainMap.getMaxZoom === 'function' ? mainMap.getMaxZoom() : Number.NaN
  }
}

function createDialogMap() {
  const mainMap = props.map
  const container = mapHolder.value
  if (!mainMap || !container) {
    return
  }
  const MapConstructor = getMapConstructor(mainMap)
  if (!MapConstructor) {
    return
  }
  // 复用主地图的构造函数，保证与主地图的坐标系、增强能力一致
  const options: Record<string, any> = {
    container,
    style: buildDialogStyle(mainMap.getStyle(), props.webmap, props.layer),
    center: mainMap.getCenter(),
    zoom: mainMap.getZoom(),
    bearing: mainMap.getBearing(),
    pitch: mainMap.getPitch()
  }
  const { minZoom, maxZoom } = getDialogZoomRange(mainMap)
  if (Number.isFinite(minZoom)) {
    options.minZoom = minZoom
  }
  if (Number.isFinite(maxZoom)) {
    options.maxZoom = maxZoom
  }
  if (typeof mainMap.getCRS === 'function') {
    options.crs = mainMap.getCRS()
  }
  const map = new MapConstructor(options)
  dialogMap.value = map
  // 弹窗展开动画结束后容器尺寸才稳定，主动校正一次画布大小
  window.requestAnimationFrame(() => {
    if (typeof map.resize === 'function') {
      map.resize()
    }
  })
  // 数据编辑器会直接向地图添加 source/layer，必须等样式加载完成
  if (typeof map.loaded === 'function' && map.loaded()) {
    createDataEditor(map)
    return
  }
  map.once('load', () => createDataEditor(map))
}

function removeDialogMap() {
  if (dataEditor.value?.destroy) {
    dataEditor.value.destroy()
  }
  dataEditor.value = null
  if (dialogMap.value?.remove) {
    dialogMap.value.remove()
  }
  dialogMap.value = null
}

onMounted(async () => {
  await nextTick()
  createDialogMap()
})

onBeforeUnmount(() => {
  removeDialogMap()
})
</script>
