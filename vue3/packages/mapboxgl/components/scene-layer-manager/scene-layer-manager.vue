<template>
  <SmCollapseCard
    ref="sceneLayerManagerRef"
    class="sm-component-scene-layer-manager"
    icon-class="sm-components-icon-layer-list"
    :icon-position="position"
    :header-name="t('sceneLayerManager.title')"
    :auto-rotate="autoRotate"
    :collapsed="collapsed"
    :background="background"
    :text-color="textColor"
    :split-line="splitLine"
  >
    <SmCard
      class="sm-component-scene-layer-manager__card"
      :bordered="false"
      :style="textColorHeadingStyle"
    >
      <div class="sm-component-scene-layer-manager__content">
        <div v-if="!sceneReady" class="sm-component-scene-layer-manager__empty">
          {{ t('sceneLayerManager.sceneNotReady') }}
        </div>

        <div v-else class="sm-component-scene-layer-manager__panel">
          <div class="sm-component-scene-layer-manager__toolbar">
            <SmInput
              v-model:value="publicSearch"
              class="sm-component-scene-layer-manager__search"
              allow-clear
              :placeholder="t('sceneLayerManager.searchPlaceholder')"
            />
            <SmButton
              type="link"
              size="small"
              :disabled="!hasCheckedPublicLayers"
              @click="clearPublicLayers"
            >
              {{ t('sceneLayerManager.clear') }}
            </SmButton>
          </div>

          <div v-if="publicTree.length === 0" class="sm-component-scene-layer-manager__empty">
            {{ t('sceneLayerManager.emptyConfig') }}
          </div>
          <div
            v-else-if="filteredPublicTree.length === 0"
            class="sm-component-scene-layer-manager__empty"
          >
            {{ t('sceneLayerManager.noSearchResult') }}
          </div>
          <SmTree
            v-else
            block-node
            :selectable="false"
            class="sm-component-scene-layer-manager__tree"
            :tree-data="filteredPublicTree"
            :expanded-keys="effectiveExpandedKeys"
            :auto-expand-parent="Boolean(normalizedPublicSearch)"
            @expand="handlePublicExpand"
          >
            <template #title="{ dataRef }">
              <div
                class="sm-component-scene-layer-manager__tree-row"
                :class="{
                  'sm-component-scene-layer-manager__tree-row--disabled':
                    isRuntimeLeaf(dataRef) && dataRef.disabled
                }"
              >
                <div class="sm-component-scene-layer-manager__tree-name">
                  <SmCheckbox
                    v-if="isRuntimeLeaf(dataRef)"
                    :checked="dataRef.checked"
                    :disabled="dataRef.disabled || dataRef.loading"
                    @click.stop
                    @change="event => handleCheckboxChange(dataRef, event)"
                  />
                  <span class="sm-component-scene-layer-manager__tree-title" :title="dataRef.name">
                    {{ dataRef.name }}
                  </span>
                  <SmSpin
                    v-if="isRuntimeLeaf(dataRef) && dataRef.loading"
                    size="small"
                    class="sm-component-scene-layer-manager__loading-icon"
                  />
                </div>
                <div
                  v-if="
                    isRuntimeLeaf(dataRef) &&
                    (showLocate || (showLayerControl && isControllableLayer(dataRef)))
                  "
                  class="sm-component-scene-layer-manager__actions"
                >
                  <SmButton
                    v-if="showLocate"
                    type="text"
                    size="small"
                    :title="t('sceneLayerManager.locate')"
                    :disabled="!dataRef.checked || dataRef.loading"
                    @click.stop="locateLayer(dataRef)"
                  >
                    <i class="sm-components-icon-suofangzhituceng" aria-hidden="true" />
                  </SmButton>
                  <SmButton
                    v-if="showLayerControl && isControllableLayer(dataRef)"
                    type="text"
                    size="small"
                    :title="t('sceneLayerManager.layerControl')"
                    :disabled="!dataRef.checked || dataRef.loading"
                    @click.stop="toggleLayerParameters(dataRef)"
                  >
                    <i
                      :class="[
                        'sm-components-icon-tucengyangshi01',
                        dataRef.showConfig && 'sm-components-icon-active'
                      ]"
                      aria-hidden="true"
                    />
                  </SmButton>
                </div>

                <div
                  v-if="
                    isRuntimeLeaf(dataRef) &&
                    showLayerControl &&
                    dataRef.checked &&
                    isControllableLayer(dataRef) &&
                    dataRef.showConfig
                  "
                  class="sm-component-scene-layer-manager__control-parameters"
                  @click.stop
                >
                  <label class="sm-component-scene-layer-manager__parameter">
                    <span>{{ t('sceneLayerManager.alpha') }}</span>
                    <SmSlider
                      :value="getControlNumber(dataRef, 'alpha', 1)"
                      :min="0"
                      :max="1"
                      :step="0.01"
                      :disabled="dataRef.loading"
                      @change="value => updateSliderValue(dataRef, 'alpha', value)"
                    />
                  </label>
                  <label class="sm-component-scene-layer-manager__parameter">
                    <span>{{ t('sceneLayerManager.contrast') }}</span>
                    <SmSlider
                      :value="getControlNumber(dataRef, 'contrast', 1)"
                      :min="0"
                      :max="2"
                      :step="0.01"
                      :disabled="dataRef.loading"
                      @change="value => updateSliderValue(dataRef, 'contrast', value)"
                    />
                  </label>
                  <label class="sm-component-scene-layer-manager__parameter">
                    <span>{{ t('sceneLayerManager.brightness') }}</span>
                    <SmSlider
                      :value="getControlNumber(dataRef, 'brightness', 1)"
                      :min="0"
                      :max="15"
                      :step="0.1"
                      :disabled="dataRef.loading"
                      @change="value => updateSliderValue(dataRef, 'brightness', value)"
                    />
                  </label>
                  <label class="sm-component-scene-layer-manager__parameter">
                    <span>{{ t('sceneLayerManager.saturation') }}</span>
                    <SmSlider
                      :value="getControlNumber(dataRef, 'saturation', 1)"
                      :min="0"
                      :max="2"
                      :step="0.01"
                      :disabled="dataRef.loading"
                      @change="value => updateSliderValue(dataRef, 'saturation', value)"
                    />
                  </label>
                  <label
                    v-if="dataRef.type === 's3m'"
                    class="sm-component-scene-layer-manager__parameter sm-component-scene-layer-manager__parameter--full"
                  >
                    <span>{{ t('sceneLayerManager.bottomAltitudeOffset') }}</span>
                    <SmInputNumber
                      :value="getControlNumber(dataRef, 'bottomAltitudeOffset', 0)"
                      :min="-1000"
                      :max="100000"
                      :step="1"
                      :disabled="dataRef.loading"
                      @change="value => updateNumberValue(dataRef, 'bottomAltitudeOffset', value)"
                    />
                  </label>
                </div>
              </div>
            </template>
          </SmTree>
        </div>
      </div>
    </SmCard>
  </SmCollapseCard>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useTemplateRef, watch } from 'vue'
import SmButton from '@supermapgis/common/components/button/Button'
import SmCard from '@supermapgis/common/components/card/Card'
import SmCheckbox from '@supermapgis/common/components/checkbox/Checkbox'
import SmCollapseCard from '@supermapgis/common/components/collapse-card/collapse-card.vue'
import SmInput from '@supermapgis/common/components/input/Input'
import SmInputNumber from '@supermapgis/common/components/input-number/InputNumber'
import SmMessage from '@supermapgis/common/components/message/Message'
import SmSlider from '@supermapgis/common/components/slider/Slider'
import SmSpin from '@supermapgis/common/components/spin/Spin'
import SmTree from '@supermapgis/common/components/tree/Tree'
import { useLocale, useSceneGetter, useTheme } from '@supermapgis/common/hooks/index.common'
import { useSceneControl } from '@supermapgis/mapboxgl/hooks'
import { LayerManager } from 'vue-iclient-core/utils/scene'
import type { SceneLayerConfigNode, SceneLayerType } from './types'
import { SCENE_LAYER_TYPES, sceneLayerManagerPropsDefault } from './types'
import { isEqual } from 'lodash-es'

defineOptions({
  name: 'SmSceneLayerManager'
})

type RuntimeConfig = Record<string, unknown>

interface RuntimeGroupNode {
  key: string
  id?: string
  name: string
  title: string
  children: RuntimeSceneLayerNode[]
  isLeaf: false
}

interface RuntimeLeafNode {
  key: string
  id: string
  name: string
  title: string
  type: string
  config: RuntimeConfig
  defaultLoad: boolean
  autoLocate: boolean
  locateParams?: unknown
  subdomains?: unknown
  checkEnabled?: boolean
  checked: boolean
  loading: boolean
  disabled: boolean
  disabledReason?: string
  showConfig: boolean
  children: []
  isLeaf: true
}

type RuntimeSceneLayerNode = RuntimeGroupNode | RuntimeLeafNode

const props = withDefaults(
  defineProps<import('./types').SceneLayerManagerProps>(),
  sceneLayerManagerPropsDefault
)
const { t } = useLocale()
const { textColorHeadingStyle } = useTheme(props)

const publicSearch = ref('')
const publicTree = ref<RuntimeSceneLayerNode[]>([])
const publicExpandedKeys = ref<string[]>([])
const sceneReady = ref(false)

let activeViewer: unknown = null
let layerManager: LayerManager | null = null
let cleanupQueue: Promise<void> = Promise.resolve()
let lifecycleToken = 0

const sceneLayerManagerRef = useTemplateRef('sceneLayerManagerRef')
useSceneControl(() => sceneLayerManagerRef.value?.$el)

const normalizedPublicSearch = computed(() => publicSearch.value.trim())
const filteredPublicTree = computed(() =>
  filterTreeNodes(publicTree.value, normalizedPublicSearch.value)
)
const effectiveExpandedKeys = computed(() => {
  if (!normalizedPublicSearch.value) {
    return publicExpandedKeys.value
  }
  return collectGroupKeys(filteredPublicTree.value)
})

const hasCheckedPublicLayers = computed(() =>
  collectLeafNodes(publicTree.value).some(node => node.checked)
)

useSceneGetter({
  loaded: viewer => {
    void initializeForViewer(viewer)
  },
  removed: viewer => {
    if (!activeViewer || activeViewer === viewer) {
      void initializeForViewer(null)
    }
  }
})

watch(
  () => props.layerConfig,
  (nextLayerConfig, previousLayerConfig) => {
    if (isEqual(nextLayerConfig, previousLayerConfig)) {
      return
    }
    if (activeViewer) {
      void initializeForViewer(activeViewer)
    }
  }
)

onBeforeUnmount(() => {
  lifecycleToken += 1
  const managerToRemove = layerManager
  layerManager = null
  activeViewer = null
  void queueManagerRemoval(managerToRemove)
})

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(item => cloneValue(item)) as T
  }
  if (isRecord(value)) {
    const result: Record<string, unknown> = {}
    Object.keys(value).forEach(key => {
      result[key] = cloneValue(value[key])
    })
    return result as T
  }
  return value
}

function getNonEmptyString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : ''
}

function parseConfig(value: unknown): RuntimeConfig | null {
  let parsed = value
  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value)
    } catch {
      return null
    }
  }
  if (!isRecord(parsed)) {
    return null
  }
  return cloneValue(parsed)
}

function isSupportedLayerType(value: unknown): value is SceneLayerType {
  return typeof value === 'string' && (SCENE_LAYER_TYPES as readonly string[]).includes(value)
}

function getConfigIssue(type: SceneLayerType, config: RuntimeConfig) {
  const hasUrl = typeof config.url === 'string' && Boolean(config.url.trim())
  if (type === 'terrain' || type === 's3m' || type === '3dtiles') {
    return hasUrl ? undefined : 'config.url is required'
  }
  if (type === 'map') {
    if (typeof config.type !== 'string' || !config.type.trim()) {
      return 'config.type is required'
    }
    return hasUrl ? undefined : 'config.url is required'
  }
  if (config.type !== 'rest') {
    return 'data layers only support config.type = rest'
  }
  if (!hasUrl) {
    return 'config.url is required'
  }
  return Number(config.cluster) === 2 ? 'data layers do not support cluster = 2' : undefined
}

function warnInDevelopment(messageText: string) {
  const environment = (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env
  if (environment?.DEV) {
    console.warn('[SmSceneLayerManager] ' + messageText)
  }
}

function normalizeRuntimeTree(config: unknown) {
  const seenLeafIds = new Set<string>()
  const tree = normalizeRuntimeNodes(
    Array.isArray(config) ? config : [],
    'layerConfig',
    seenLeafIds
  )
  return tree
}

function normalizeRuntimeNodes(
  nodes: unknown[],
  parentPath: string,
  seenLeafIds: Set<string>
): RuntimeSceneLayerNode[] {
  return nodes.map((node, index) =>
    normalizeRuntimeNode(node, parentPath + '[' + index + ']', seenLeafIds)
  )
}

function normalizeRuntimeNode(
  value: unknown,
  path: string,
  seenLeafIds: Set<string>
): RuntimeSceneLayerNode {
  const source = isRecord(value) ? value : {}
  const name = getNonEmptyString(source.name)
  const children = source.children

  if (Array.isArray(children)) {
    return {
      key: 'group-' + path,
      id: getNonEmptyString(source.id) || undefined,
      name: name || '-',
      title: name || '-',
      children: normalizeRuntimeNodes(children, path + '.children', seenLeafIds),
      isLeaf: false
    }
  }

  const sourceId = getNonEmptyString(source.id)
  const runtimeId = sourceId || 'invalid-' + path
  const duplicateId = Boolean(sourceId) && seenLeafIds.has(sourceId)
  if (sourceId && !duplicateId) {
    seenLeafIds.add(sourceId)
  }
  if (duplicateId) {
    warnInDevelopment(path + '.id duplicates another leaf id: ' + sourceId)
  }

  const config = parseConfig(source.config)
  const type = isSupportedLayerType(source.type) ? source.type : ''
  const disabledReasons: string[] = []

  if (!sourceId || duplicateId) {
    disabledReasons.push('id must be unique and non-empty')
  }
  if (!name) {
    disabledReasons.push('name is required')
  }
  if (!type) {
    disabledReasons.push('type is unsupported')
  }
  if (!config) {
    disabledReasons.push('config must be an object or JSON object string')
  }
  if (type && config) {
    const configIssue = getConfigIssue(type, config)
    if (configIssue) {
      disabledReasons.push(configIssue)
    }
  }
  if (source.checkEnabled === false) {
    disabledReasons.push('check is disabled by checkEnabled')
  } else if (typeof source.checkEnabled === 'undefined' && config?.supportCheck === false) {
    disabledReasons.push('check is disabled by config.supportCheck')
  }

  return {
    key: 'leaf-' + runtimeId,
    id: runtimeId,
    name: name || '-',
    title: name || '-',
    type,
    config: config || {},
    defaultLoad: source.defaultLoad === true,
    autoLocate: source.autoLocate === true,
    locateParams: source.locateParams,
    subdomains: source.subdomains,
    checkEnabled: source.checkEnabled === false ? false : undefined,
    checked: false,
    loading: false,
    disabled: disabledReasons.length > 0,
    disabledReason: disabledReasons[0],
    showConfig: false,
    children: [],
    isLeaf: true
  }
}

function rebuildRuntimeTree() {
  publicTree.value = normalizeRuntimeTree(props.layerConfig as SceneLayerConfigNode[])
  publicExpandedKeys.value = []
}

function clearRuntimeTree() {
  publicTree.value = []
  publicExpandedKeys.value = []
}

function collectLeafNodes(nodes: RuntimeSceneLayerNode[]): RuntimeLeafNode[] {
  return nodes.reduce<RuntimeLeafNode[]>((leaves, node) => {
    if (node.isLeaf) {
      leaves.push(node)
      return leaves
    }
    return leaves.concat(collectLeafNodes(node.children))
  }, [])
}

function collectGroupKeys(nodes: RuntimeSceneLayerNode[]): string[] {
  return nodes.reduce<string[]>((keys, node) => {
    if (node.isLeaf) {
      return keys
    }
    keys.push(node.key)
    return keys.concat(collectGroupKeys(node.children))
  }, [])
}

function filterTreeNodes(nodes: RuntimeSceneLayerNode[], keyword: string): RuntimeSceneLayerNode[] {
  const normalizedKeyword = keyword.trim().toLocaleLowerCase()
  if (!normalizedKeyword) {
    return nodes
  }

  return nodes.reduce<RuntimeSceneLayerNode[]>((filteredNodes, node) => {
    const matched = node.name.toLocaleLowerCase().includes(normalizedKeyword)
    if (node.isLeaf) {
      if (matched) {
        filteredNodes.push(node)
      }
      return filteredNodes
    }

    const groupNode = node as RuntimeGroupNode
    if (matched) {
      filteredNodes.push(groupNode)
      return filteredNodes
    }

    const children = filterTreeNodes(groupNode.children, keyword)
    if (children.length > 0) {
      filteredNodes.push({ ...groupNode, children })
    }
    return filteredNodes
  }, [])
}

function isRuntimeLeaf(node: unknown): node is RuntimeLeafNode {
  return isRecord(node) && node.isLeaf === true
}

function handlePublicExpand(keys: Array<string | number>) {
  publicExpandedKeys.value = keys.map(key => String(key))
}

function handleCheckboxChange(node: RuntimeLeafNode, event: { target?: { checked?: boolean } }) {
  void toggleLayer(node, Boolean(event.target?.checked))
}

function createManagerData(node: RuntimeLeafNode) {
  return {
    id: node.id,
    name: node.name,
    type: node.type,
    config: node.config,
    defaultLoad: node.defaultLoad,
    autoLocate: node.autoLocate,
    locateParams: node.locateParams,
    subdomains: node.subdomains,
    checked: node.checked
  } as Parameters<LayerManager['check']>[0]
}

function isControllableLayer(node: RuntimeLeafNode) {
  return node.type === 'map' || node.type === 's3m'
}

function toggleLayerParameters(node: RuntimeLeafNode) {
  if (!node.checked || node.loading || !isControllableLayer(node)) {
    return
  }
  node.showConfig = !node.showConfig
}

async function queueManagerRemoval(managerToRemove: LayerManager | null) {
  if (!managerToRemove) {
    return cleanupQueue
  }

  cleanupQueue = cleanupQueue
    .catch(() => undefined)
    .then(async () => {
      try {
        await managerToRemove.removeAll()
      } catch (error) {
        warnInDevelopment(resolveErrorMessage(error))
      }
    })
  return cleanupQueue
}

async function initializeForViewer(viewer: unknown) {
  const token = ++lifecycleToken
  const managerToRemove = layerManager
  layerManager = null
  activeViewer = null
  sceneReady.value = false

  await queueManagerRemoval(managerToRemove)
  if (token !== lifecycleToken) {
    return
  }

  clearRuntimeTree()
  if (!viewer) {
    return
  }

  try {
    const nextManager = new LayerManager(viewer)
    layerManager = nextManager
    activeViewer = viewer
    sceneReady.value = true
    rebuildRuntimeTree()
    await loadDefaultLayers(token, nextManager)
  } catch (error) {
    if (token === lifecycleToken) {
      sceneReady.value = false
      SmMessage.error(resolveErrorMessage(error, 'sceneLayerManager.loadFailed'))
    }
  }
}

async function loadDefaultLayers(token: number, managerForLoad: LayerManager) {
  const defaultLayers = collectLeafNodes(publicTree.value).filter(
    node => node.defaultLoad && !node.disabled
  )
  for (const node of defaultLayers) {
    if (token !== lifecycleToken || managerForLoad !== layerManager) {
      return
    }
    await toggleLayer(node, true, managerForLoad, token)
  }
}

async function toggleLayer(
  node: RuntimeLeafNode,
  checked: boolean,
  managerOverride = layerManager,
  expectedToken = lifecycleToken
) {
  if (!managerOverride || node.disabled || node.loading) {
    return
  }

  const previousChecked = node.checked
  node.loading = true
  try {
    await managerOverride.check(createManagerData(node), checked)
    if (expectedToken === lifecycleToken && managerOverride === layerManager) {
      node.checked = checked
      if (!checked) {
        node.showConfig = false
      }
    }
  } catch (error) {
    if (expectedToken === lifecycleToken && managerOverride === layerManager) {
      node.checked = previousChecked
      SmMessage.error(resolveErrorMessage(error, 'sceneLayerManager.loadFailed'))
    }
  } finally {
    if (expectedToken === lifecycleToken && managerOverride === layerManager) {
      node.loading = false
    }
  }
}

async function locateLayer(node: RuntimeLeafNode) {
  const activeManager = layerManager
  const token = lifecycleToken
  if (!activeManager || !node.checked || node.loading) {
    return
  }

  node.loading = true
  try {
    const located = await activeManager.locate(createManagerData(node))
    if (token === lifecycleToken && activeManager === layerManager && located === false) {
      SmMessage.warning(t('sceneLayerManager.operationFailed'))
    }
  } catch (error) {
    if (token === lifecycleToken && activeManager === layerManager) {
      SmMessage.error(resolveErrorMessage(error, 'sceneLayerManager.operationFailed'))
    }
  } finally {
    if (token === lifecycleToken && activeManager === layerManager) {
      node.loading = false
    }
  }
}

async function clearLayers(nodes: RuntimeLeafNode[]) {
  for (const node of nodes) {
    if (node.checked) {
      await toggleLayer(node, false)
    }
  }
}

function clearPublicLayers() {
  void clearLayers(collectLeafNodes(publicTree.value).filter(node => node.checked))
}

function getControlNumber(node: RuntimeLeafNode, key: string, fallback: number) {
  const value = node.config[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function updateSliderValue(node: RuntimeLeafNode, key: string, value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    void updateControlValue(node, key, value)
  }
}

function updateNumberValue(node: RuntimeLeafNode, key: string, value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    void updateControlValue(node, key, value)
  }
}

async function updateControlValue(node: RuntimeLeafNode, key: string, value: number) {
  const activeManager = layerManager
  const token = lifecycleToken
  if (!activeManager || !node.checked || node.loading) {
    return
  }

  const previousValue = node.config[key]
  node.config[key] = value
  node.loading = true
  try {
    await activeManager.handleDataChange({
      ...createManagerData(node),
      checked: true
    })
  } catch (error) {
    if (token === lifecycleToken && activeManager === layerManager) {
      node.config[key] = previousValue
      SmMessage.error(resolveErrorMessage(error, 'sceneLayerManager.operationFailed'))
    }
  } finally {
    if (token === lifecycleToken && activeManager === layerManager) {
      node.loading = false
    }
  }
}

function resolveErrorMessage(error: unknown, fallbackKey = 'sceneLayerManager.operationFailed') {
  if (error instanceof Error && error.message) {
    return error.message
  }
  if (typeof error === 'string' && error) {
    return error
  }
  return t(fallbackKey)
}
</script>
