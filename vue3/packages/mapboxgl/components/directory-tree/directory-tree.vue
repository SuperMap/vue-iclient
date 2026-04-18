<template>
  <sm-collapse-card
    class="sm-component-directory-tree"
    :style="props.style"
    :icon-class="props.iconClass"
    :icon-position="props.position"
    :header-name="collapseCardHeaderName"
    :auto-rotate="props.autoRotate"
    :collapsed="props.collapsed"
    :split-line="props.splitLine"
    :background="props.background"
    :textColor="props.textColor"
  >
    <sm-card class="sm-component-directory-tree__card" :bordered="false" :style="textColorHeadingStyle">
      <div class="sm-component-directory-tree__content">
        <div v-if="showBlankPlaceholder" class="sm-component-directory-tree__blank-placeholder">
          <SmEmpty />
        </div>
        <SmTree
          v-else
          :key="treeRenderVersion"
          class="treeHolder"
          checkable
          checkStrictly
          :expandedKeys="expandedKeys"
          :autoExpandParent="autoExpandParent"
          :treeData="displayTreeNodes"
          :checkedKeys="treeCheckedState"
          :loadData="loadNodeChildren"
          @expand="handleExpand"
          @select="handleSelect"
          @check="handleCheck"
        >
          <template
            #title="{
              key,
              title,
              icon,
              titleDisabled,
              titleTooltip
            }"
          >
            <span
              :class="[
                'sm-component-directory-tree__title-trigger',
                titleDisabled && 'sm-component-directory-tree__title-trigger--disabled'
              ]"
              @click.stop="handleTitleClick(key)"
            >
              <img
                v-if="icon"
                class="sm-component-directory-tree__title-icon"
                :src="icon"
                alt=""
              />
              <span class="sm-component-directory-tree__title-text" :title="titleTooltip">
                {{ title }}
              </span>
            </span>
          </template>
        </SmTree>
      </div>
    </sm-card>
  </sm-collapse-card>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import type { AntTreeNodeSelectedEvent } from 'ant-design-vue/es/tree'
import SmCard from '@supermapgis/common/components/card/Card'
import SmCollapseCard from '@supermapgis/common/components/collapse-card/collapse-card.vue'
import SmEmpty from '@supermapgis/common/components/empty/Empty'
import SmTree from '@supermapgis/common/components/tree/Tree'
import { useLocale, useTheme } from '@supermapgis/common/hooks/index.common'
import mapEvent from 'vue-iclient-core/types/map-event'
import type { DirectoryTreeProps, ResourceDescriptor, RuntimeTreeNode } from './types'
import { DEFAULT_DIRECTORY_TREE_TITLE, directoryTreePropsDefault } from './types'
import { createDirectoryTreeFetcher } from './utils/fetcher'
import { useDirectoryTreeCheck } from './hooks/use-directory-tree-check'
import { useDirectoryTreeDisplay } from './hooks/use-directory-tree-display'
import { useDirectoryLoader } from './hooks/use-directory-loader'
import { useDirectoryTreeRuntime } from './hooks/use-directory-tree-runtime'
import { useResourceResolver } from './hooks/use-resource-resolver'
import { useResourceLayerManager } from './hooks/use-resource-layer-manager'
import { normalizeDirectoryTreeOrEmpty } from './utils/schema-normalizer'

defineOptions({
  name: 'SmDirectoryTree'
})

const props = withDefaults(defineProps<DirectoryTreeProps>(), directoryTreePropsDefault)
const emit = defineEmits(['select', 'check-change'])
const { t } = useLocale()
const { textColorHeadingStyle } = useTheme(props)

const expandedKeys = ref<string[]>([])
const autoExpandParent = ref(true)
const runtimeNodes = ref<RuntimeTreeNode[]>([])
const checkedResourceMap = ref(new Map<string, ResourceDescriptor>())
const checkedKeys = ref<string[]>([])
const halfCheckedKeys = ref<string[]>([])

function normalizeIportalBaseUrl(serverUrl: unknown): string | undefined {
  if (typeof serverUrl !== 'string' || !serverUrl.trim()) {
    return undefined
  }

  const trimmed = serverUrl.trim()
  try {
    if (typeof window !== 'undefined') {
      return new URL(trimmed, window.location.href).toString().replace(/\/+$/, '')
    }
    return new URL(trimmed).toString().replace(/\/+$/, '')
  } catch {
    return trimmed.replace(/\/+$/, '') || undefined
  }
}

function resolveRuntimeIportalUrl(configuredUrl: unknown, webmap: any): string {
  const configuredPropUrl = normalizeIportalBaseUrl(configuredUrl)
  if (configuredPropUrl) {
    return configuredPropUrl
  }

  const configuredServerUrl =
    normalizeIportalBaseUrl(webmap?.options?.serverUrl) || normalizeIportalBaseUrl(webmap?.serverUrl)
  if (configuredServerUrl) {
    return configuredServerUrl
  }

  if (typeof window === 'undefined') {
    return ''
  }

  const href = window.location.href
  const appsIndex = href.indexOf('/apps/')
  if (appsIndex > 0) {
    return href.slice(0, appsIndex).replace(/\/+$/, '')
  }

  return new URL(href).origin.replace(/\/+$/, '')
}

const iportalUrl = computed(() => resolveRuntimeIportalUrl(props.iportalUrl, getMapContext().webmap))
const directoryCheckable = computed(
  () => normalizeDirectoryTreeOrEmpty(props.treeSchema).schema.directoryCheckable ?? true
)
const fetcher = createDirectoryTreeFetcher()
const serviceProxyUrlPrefix = computed(
  () =>
    getMapContext().webmap?.options?.iportalServiceProxyUrlPrefix ||
    (typeof window !== 'undefined' ? (window as any).iportalServiceProxyUrl : undefined)
)

const loader = useDirectoryLoader({
  iportalUrl: iportalUrl.value,
  directoryCheckable: directoryCheckable.value,
  fetcher
})
const resolver = useResourceResolver({
  iportalUrl: iportalUrl.value,
  fetcher,
  serviceProxyUrlPrefix: serviceProxyUrlPrefix.value
})
const resourceLayerManager = useResourceLayerManager({
  iportalUrl: iportalUrl.value,
  fetcher
})

const treeCheckedState = computed(() => ({
  checked: checkedKeys.value,
  halfChecked: halfCheckedKeys.value
}))
const treeTitle = computed(() => {
  const title = props.treeSchema?.title
  if (title == null) {
    return DEFAULT_DIRECTORY_TREE_TITLE
  }
  return typeof title === 'string' ? title.trim() : DEFAULT_DIRECTORY_TREE_TITLE
})
const collapseCardHeaderName = computed(() => props.headerName ?? treeTitle.value)

function getMapContext(mapTarget = props.mapTarget) {
  return {
    map: mapTarget ? mapEvent.getMap(mapTarget) : undefined,
    mapTarget,
    webmap: mapTarget ? mapEvent.getWebMap(mapTarget) : undefined
  }
}

function syncResourceLayerManagerContext(mapTarget = props.mapTarget) {
  const mapContext = getMapContext(mapTarget)
  resourceLayerManager.setMapContext(mapContext)
  return mapContext
}

function getActiveMap() {
  if (!props.mapTarget) {
    return undefined
  }
  return mapEvent.getMap(props.mapTarget)
}

function getMapProjection(): string | undefined {
  const map = getActiveMap()
  const crs = map?.getCRS?.()
  return resolver.normalizeProjection(crs ?? crs?.wkt ?? crs?.epsgCode ?? crs?.code) || undefined
}

const {
  resetTree,
  findNodeByKey,
  resolveResourceNode,
  refreshResolvedNodeStates,
  loadNodeChildren,
  ensureDirectoryLoaded,
  ensureDescendantsLoaded,
  collectDescendantResourceNodes,
  setNodeOperationState,
  setDirectoryBatchProgress,
  clearDirectoryBatchProgress,
  isNodeBusy,
  isNodeSelectionBlocked
} = useDirectoryTreeRuntime({
  runtimeNodes,
  expandedKeys,
  checkedResourceMap,
  checkedKeys,
  halfCheckedKeys,
  mapTarget: () => props.mapTarget,
  loader,
  resolver,
  resourceLayerManager,
  getMapProjection,
  onLoadedChildren: () => recalculateCheckState()
})

const { clearCheckedResources, recalculateCheckState, toggleNodeCheckByKey } = useDirectoryTreeCheck({
  t,
  runtimeNodes,
  checkedResourceMap,
  checkedKeys,
  halfCheckedKeys,
  mapTarget: () => props.mapTarget,
  resolver,
  resourceLayerManager,
  getMapContext,
  findNodeByKey,
  resolveResourceNode,
  ensureDescendantsLoaded,
  collectDescendantResourceNodes,
  setNodeOperationState,
  setDirectoryBatchProgress,
  clearDirectoryBatchProgress,
  isNodeBusy,
  emitCheckChange: payload => emit('check-change', payload)
})

const { getDisabledReasonText, isBrowseOnlyResourceNode, mapNodesForTree } = useDirectoryTreeDisplay({
  t,
  getMapTarget: () => props.mapTarget,
  isNodeBusy
})
const displayTreeNodes = computed(() => mapNodesForTree(runtimeNodes.value))
const showBlankPlaceholder = computed(() => displayTreeNodes.value.length === 0)
const treeSchemaStructureKey = ref('')
const treeRenderVersion = ref(0)
let hasResolvedRuntimeContext = false

function createSchemaStructureKey(treeSchema: DirectoryTreeProps['treeSchema']): string {
  const normalized = normalizeDirectoryTreeOrEmpty(treeSchema).schema
  const collectNodes = (nodes: Array<Record<string, any>> = []) =>
    nodes.map(node => ({
      id: String(node.id),
      type: node.type ?? 'default',
      params: (node.type ?? 'default') === 'resource-search' ? node.params ?? null : undefined,
      children: collectNodes(node.children || [])
    }))

  return JSON.stringify({
    directoryCheckable: normalized.directoryCheckable ?? true,
    nodes: collectNodes(normalized.nodes as Array<Record<string, any>>)
  })
}

function syncRuntimeNodePresentation(currentNodes: RuntimeTreeNode[], nextNodes: RuntimeTreeNode[]) {
  currentNodes.forEach((currentNode, index) => {
    const nextNode = nextNodes[index]
    if (!nextNode) {
      return
    }

    currentNode.parentKey = nextNode.parentKey
    currentNode.title = nextNode.title
    currentNode.icon = nextNode.icon
    currentNode.resourceIcon = nextNode.resourceIcon
    currentNode.checkable = nextNode.checkable
    currentNode.raw = nextNode.raw

    if (currentNode.children?.length && nextNode.children?.length) {
      syncRuntimeNodePresentation(currentNode.children, nextNode.children)
    }
  })
}

watch(
  () => props.treeSchema,
  async nextSchema => {
    const nextStructureKey = createSchemaStructureKey(nextSchema)

    if (!treeSchemaStructureKey.value || treeSchemaStructureKey.value !== nextStructureKey) {
      treeSchemaStructureKey.value = nextStructureKey
      await resetTree(nextSchema)
      return
    }

    const normalized = normalizeDirectoryTreeOrEmpty(nextSchema)
    syncRuntimeNodePresentation(runtimeNodes.value, normalized.rootNodes)
    treeRenderVersion.value += 1
  },
  { immediate: true, deep: true }
)

watch(
  [iportalUrl, directoryCheckable, serviceProxyUrlPrefix],
  async (nextValues, previousValues) => {
    const [nextIportalUrl, nextDirectoryCheckable, nextServiceProxyUrlPrefix] = nextValues
    loader.updateContext({
      iportalUrl: nextIportalUrl,
      directoryCheckable: nextDirectoryCheckable
    })
    resolver.updateContext({
      iportalUrl: nextIportalUrl,
      serviceProxyUrlPrefix: nextServiceProxyUrlPrefix
    })
    resourceLayerManager.updateOptions({
      iportalUrl: nextIportalUrl
    })

    if (!hasResolvedRuntimeContext) {
      hasResolvedRuntimeContext = true
      return
    }

    const previousIportalUrl = previousValues?.[0]
    const previousServiceProxyUrlPrefix = previousValues?.[2]
    if (
      nextIportalUrl !== previousIportalUrl ||
      nextServiceProxyUrlPrefix !== previousServiceProxyUrlPrefix
    ) {
      await resourceLayerManager.clearResources()
      clearCheckedResources()
      syncResourceLayerManagerContext(props.mapTarget)
      await refreshResolvedNodeStates(runtimeNodes.value, true)
    }
  },
  { immediate: true }
)

watch(
  () => props.mapTarget,
  async (nextTarget, previousTarget) => {
    if (previousTarget) {
      await resourceLayerManager.clearResources({ mapTarget: previousTarget })
    }
    clearCheckedResources()
    syncResourceLayerManagerContext(nextTarget)
    await refreshResolvedNodeStates(runtimeNodes.value, true)
  }
)

async function handleBoundMapReload(mapTarget?: string) {
  if (!mapTarget || mapTarget !== props.mapTarget) {
    return
  }

  await resourceLayerManager.clearResources({ mapTarget })
  clearCheckedResources()
  syncResourceLayerManagerContext(props.mapTarget)
  await refreshResolvedNodeStates(runtimeNodes.value, true)
}

function handleLoadMap(event: { mapTarget?: string }) {
  void handleBoundMapReload(event.mapTarget)
}

function handleDeleteMap(event: { mapTarget?: string }) {
  void handleBoundMapReload(event.mapTarget)
}

onMounted(() => {
  syncResourceLayerManagerContext(props.mapTarget)
  mapEvent.on({
    'load-map': handleLoadMap,
    'delete-map': handleDeleteMap
  })
})

onUnmounted(async () => {
  mapEvent.un({
    'load-map': handleLoadMap,
    'delete-map': handleDeleteMap
  })
  if (props.mapTarget) {
    await resourceLayerManager.clearResources({ mapTarget: props.mapTarget })
  }
})

function showNodeStatusMessage(content: string) {
  message.destroy()
  message.warning(content, 1.5)
}

function handleExpand(keys: string[]) {
  expandedKeys.value = keys
  autoExpandParent.value = false
}

function isTreeSwitcherClick(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest('.sm-component-tree-switcher')
}

async function toggleDirectoryExpansion(node: RuntimeTreeNode) {
  if (node.kind !== 'directory' || node.isLeaf) {
    return
  }

  const nextExpandedKeys = new Set<string>(expandedKeys.value)
  const isExpanded = nextExpandedKeys.has(node.key)

  if (isExpanded) {
    nextExpandedKeys.delete(node.key)
  } else {
    await ensureDirectoryLoaded(node)
    nextExpandedKeys.add(node.key)
  }

  handleExpand(Array.from(nextExpandedKeys))
}

async function handleNodeSelection(nodeKey: string, info?: { nativeEvent?: Event }) {
  const node = nodeKey ? findNodeByKey(nodeKey) : undefined
  if (!node) {
    return
  }

  if (isNodeSelectionBlocked(node)) {
    return
  }

  const disabledReasonText = getDisabledReasonText(node.disabledReason)
  if (disabledReasonText && !isBrowseOnlyResourceNode(node)) {
    showNodeStatusMessage(disabledReasonText)
    return
  }

  if (node.kind === 'directory') {
    if (isTreeSwitcherClick(info?.nativeEvent?.target ?? null)) {
      return
    }
    await toggleDirectoryExpansion(node)
    emit('select', { node })
    return
  }

  if (node.kind === 'resource') {
    const descriptor = await resolveResourceNode(node)
    emit('select', {
      node,
      resource: descriptor
    })
    return
  }

  emit('select', { node })
}

async function handleTitleClick(nodeKey: string | number) {
  await handleNodeSelection(String(nodeKey))
}

async function handleSelect(selectedKeys: Array<string | number>, info: AntTreeNodeSelectedEvent) {
  await handleNodeSelection(String(selectedKeys[selectedKeys.length - 1] || ''), info)
}

async function handleCheck(
  checkedKeysValue: unknown,
  info: { checked: boolean; node: { key: string | number } }
) {
  await toggleNodeCheckByKey(String(info.node.key), info.checked)
}

defineExpose({
  runtimeNodes,
  displayTreeNodes,
  expandedKeys,
  handleSelect,
  loadNodeChildren,
  toggleNodeCheckByKey
})
</script>
