import type { DisabledReasonCode, RuntimeTreeNode } from '../types'

const DISABLED_REASON_I18N_KEYS: Record<DisabledReasonCode, string> = {
  'missing-map-target': 'warning.unassociatedMapCannotCheck',
  'unsupported-resource-type': 'warning.directoryTreeUnsupportedResourceType',
  'unsupported-service-type': 'warning.directoryTreeUnsupportedServiceType',
  'service-unavailable': 'warning.directoryTreeServiceUnavailable',
  'missing-projection': 'warning.directoryTreeMissingProjection',
  'crs-mismatch': 'warning.directoryTreeCrsMismatch',
  'load-failed': 'warning.directoryTreeLoadFailed'
}

type DirectoryTreeTranslate = (key: string, params?: Record<string, any>) => string

export type DisplayNodeStatusKind = 'warning'

export type DisplayTreeNode = Omit<RuntimeTreeNode, 'disabledReason' | 'children'> & {
  disableCheckbox?: boolean
  disabledReason?: string
  titleDisabled?: boolean
  titleTooltip?: string
  statusKind?: DisplayNodeStatusKind
  statusTooltip?: string
  statusIconOnly?: boolean
  children?: DisplayTreeNode[]
}

export interface DirectoryTreeDisplayOptions {
  t: DirectoryTreeTranslate
  getMapTarget: () => string | undefined
}

export function useDirectoryTreeDisplay(options: DirectoryTreeDisplayOptions) {
  function getDisabledReasonText(reason?: DisabledReasonCode): string | undefined {
    if (!reason) {
      return undefined
    }
    return options.t(DISABLED_REASON_I18N_KEYS[reason])
  }

  function isBrowseOnlyResourceNode(node: RuntimeTreeNode): boolean {
    return node.kind === 'resource' && node.disabledReason === 'missing-map-target'
  }

  function getDisplayNodeStatus(node: RuntimeTreeNode): {
    kind?: DisplayNodeStatusKind
    tooltip?: string
    iconOnly?: boolean
  } {
    const disabledReason = getDisabledReasonText(node.disabledReason)
    if (disabledReason) {
      return {
        kind: 'warning',
        tooltip: disabledReason,
        iconOnly: true
      }
    }

    return {}
  }

  function mapNodesForTree(nodes: RuntimeTreeNode[]): DisplayTreeNode[] {
    return nodes.map(node => {
      const status = getDisplayNodeStatus(node)
      const titleDisabled = !!node.disabledReason && !isBrowseOnlyResourceNode(node)

      return {
        ...node,
        checkable: node.kind === 'resource' ? true : node.checkable,
        disableCheckbox:
          !options.getMapTarget() ||
          !node.checkable ||
          node.disabled ||
          !!node.pendingValidation ||
          !!node.operationState ||
          !!node.batchProgress ||
          node.loadState === 'loading',
        disabled: node.disabled,
        titleDisabled,
        titleTooltip: status.tooltip,
        disabledReason: getDisabledReasonText(node.disabledReason),
        statusKind: status.kind,
        statusTooltip: status.tooltip,
        statusIconOnly: status.iconOnly,
        children: node.children ? mapNodesForTree(node.children) : undefined
      }
    })
  }

  return {
    getDisabledReasonText,
    isBrowseOnlyResourceNode,
    mapNodesForTree
  }
}
