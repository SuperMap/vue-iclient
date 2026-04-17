import type { Ref } from 'vue'
import { message } from 'ant-design-vue'
import type {
  DirectoryTreeCheckChangeEventPayload,
  ResourceDescriptor,
  RuntimeNodeOperationState,
  RuntimeTreeNode
} from '../types'
import { ResourceLayerManagerError, type useResourceLayerManager } from './use-resource-layer-manager'
import type { useResourceResolver } from './use-resource-resolver'

type DirectoryTreeTranslate = (key: string, params?: Record<string, any>) => string

export interface DirectoryTreeCheckOptions {
  t: DirectoryTreeTranslate
  runtimeNodes: Ref<RuntimeTreeNode[]>
  checkedResourceMap: Ref<Map<string, ResourceDescriptor>>
  checkedKeys: Ref<string[]>
  halfCheckedKeys: Ref<string[]>
  mapTarget: () => string | undefined
  resolver: ReturnType<typeof useResourceResolver>
  resourceLayerManager: ReturnType<typeof useResourceLayerManager>
  getMapContext: (mapTarget?: string) => Record<string, any>
  findNodeByKey: (key: string, nodes?: RuntimeTreeNode[]) => RuntimeTreeNode | undefined
  resolveResourceNode: (node: RuntimeTreeNode) => Promise<ResourceDescriptor>
  ensureDescendantsLoaded: (node: RuntimeTreeNode) => Promise<void>
  collectDescendantResourceNodes: (node: RuntimeTreeNode) => RuntimeTreeNode[]
  setNodeOperationState: (node: RuntimeTreeNode, operationState?: RuntimeNodeOperationState) => void
  setDirectoryBatchProgress: (
    node: RuntimeTreeNode,
    action: RuntimeNodeOperationState,
    completed: number,
    total: number
  ) => void
  clearDirectoryBatchProgress: (node: RuntimeTreeNode) => void
  isNodeBusy: (node: RuntimeTreeNode) => boolean
  emitCheckChange: (payload: DirectoryTreeCheckChangeEventPayload) => void
}

export function useDirectoryTreeCheck(options: DirectoryTreeCheckOptions) {
  function recalculateCheckState() {
    const nextCheckedKeys = new Set<string>(options.checkedResourceMap.value.keys())
    const nextHalfCheckedKeys = new Set<string>()

    function visit(node: RuntimeTreeNode): 'checked' | 'half' | 'unchecked' {
      if (node.kind === 'resource') {
        return options.checkedResourceMap.value.has(node.key) ? 'checked' : 'unchecked'
      }
      const childStates = (node.children || []).map(visit)
      if (childStates.length === 0) {
        return childStates.some(state => state !== 'unchecked') ? 'half' : 'unchecked'
      }
      if (childStates.every(state => state === 'checked')) {
        if (node.checkable) {
          nextCheckedKeys.add(node.key)
        }
        return 'checked'
      }
      if (childStates.some(state => state === 'checked' || state === 'half')) {
        if (node.checkable) {
          nextHalfCheckedKeys.add(node.key)
        }
        return 'half'
      }
      return 'unchecked'
    }

    options.runtimeNodes.value.forEach(visit)
    options.checkedKeys.value = Array.from(nextCheckedKeys)
    options.halfCheckedKeys.value = Array.from(nextHalfCheckedKeys)
  }

  function showCheckChangeSummary(payload: DirectoryTreeCheckChangeEventPayload, checked: boolean) {
    const successCount = payload.changedResources.length
    const failureCount = payload.failures.length

    if (!successCount && !failureCount) {
      return
    }

    const action = checked
      ? options.t('info.directoryTreeOperationActionCheck')
      : options.t('info.directoryTreeOperationActionUncheck')

    message.destroy()
    if (failureCount > 0) {
      message.warning(
        options.t('info.directoryTreeOperationPartialSummary', {
          action,
          successCount,
          failureCount
        }),
        2
      )
      return
    }

    message.success(
      options.t('info.directoryTreeOperationSuccessSummary', {
        action,
        successCount
      }),
      1.5
    )
  }

  async function applyResourceToggle(
    node: RuntimeTreeNode,
    checked: boolean,
    payload: DirectoryTreeCheckChangeEventPayload
  ) {
    options.setNodeOperationState(node, checked ? 'checking' : 'unchecking')
    try {
      const descriptor = await options.resolveResourceNode(node)

      if (checked) {
        const failure =
          options.resolver.getCheckFailure(descriptor, { mapTarget: options.mapTarget() }) ||
          descriptor.disabledReason ||
          (!descriptor.overlaySupported ? 'unsupported-resource-type' : undefined)

        if (failure) {
          payload.failures.push({
            nodeId: node.id,
            reason: failure
          })
          return
        }

        try {
          const mapContext = options.getMapContext()
          await options.resourceLayerManager.applyResource(descriptor, mapContext)
        } catch (error) {
          payload.failures.push({
            nodeId: node.id,
            reason: error instanceof ResourceLayerManagerError ? error.reason : 'load-failed'
          })
          return
        }

        options.checkedResourceMap.value.set(descriptor.key, descriptor)
        payload.changedResources.push(descriptor)
        return
      }

      if (!options.checkedResourceMap.value.has(descriptor.key)) {
        return
      }

      await options.resourceLayerManager.removeResource(descriptor.key)
      options.checkedResourceMap.value.delete(descriptor.key)
      payload.changedResources.push(descriptor)
    } finally {
      options.setNodeOperationState(node)
    }
  }

  async function toggleNodeCheckByKey(nodeKey: string, checked: boolean) {
    const node = options.findNodeByKey(nodeKey)
    if (!node || options.isNodeBusy(node)) {
      return
    }
    if (node.kind === 'directory' && !node.checkable) {
      return
    }

    const payload: DirectoryTreeCheckChangeEventPayload = {
      checkedResources: [],
      changedResources: [],
      failures: []
    }

    if (node.kind === 'directory') {
      const operationState: RuntimeNodeOperationState = checked ? 'checking' : 'unchecking'
      options.setNodeOperationState(node, operationState)
      try {
        await options.ensureDescendantsLoaded(node)
        const descendantResources = options.collectDescendantResourceNodes(node)
        if (descendantResources.length > 0) {
          options.setDirectoryBatchProgress(node, operationState, 0, descendantResources.length)
        }

        for (let index = 0; index < descendantResources.length; index += 1) {
          await applyResourceToggle(descendantResources[index], checked, payload)
          if (node.batchProgress) {
            options.setDirectoryBatchProgress(node, operationState, index + 1, node.batchProgress.total)
          }
        }
      } finally {
        options.setNodeOperationState(node)
        options.clearDirectoryBatchProgress(node)
      }
    } else {
      await applyResourceToggle(node, checked, payload)
    }

    recalculateCheckState()
    payload.checkedResources = Array.from(options.checkedResourceMap.value.values())
    options.emitCheckChange(payload)
    showCheckChangeSummary(payload, checked)
  }

  function clearCheckedResources() {
    const clearedResources = Array.from(options.checkedResourceMap.value.values()) as ResourceDescriptor[]
    if (!clearedResources.length) {
      recalculateCheckState()
      return
    }

    options.checkedResourceMap.value = new Map()
    recalculateCheckState()
    options.emitCheckChange({
      checkedResources: [],
      changedResources: clearedResources,
      failures: []
    })
  }

  return {
    clearCheckedResources,
    recalculateCheckState,
    toggleNodeCheckByKey
  }
}
