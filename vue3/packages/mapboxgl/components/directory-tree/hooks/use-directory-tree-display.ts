import type { DisabledReasonCode, RuntimeTreeNode } from '../types'

const DISABLED_REASON_I18N_KEYS: Record<DisabledReasonCode, string> = {
  'missing-map-target': 'warning.unassociatedMapCannotCheck',
  'unsupported-resource-type': 'warning.directoryTreeUnsupportedResourceType',
  'unsupported-service-type': 'warning.directoryTreeUnsupportedServiceType',
  'service-unavailable': 'warning.directoryTreeServiceUnavailable',
  'missing-projection': 'warning.directoryTreeMissingProjection',
  'crs-mismatch': 'warning.directoryTreeCrsMismatch',
  'csv-excel-missing-coordinate-fields': 'warning.directoryTreeCsvExcelMissingCoordinateFields',
  'csv-excel-missing-projection': 'warning.directoryTreeCsvExcelMissingProjection',
  'csv-excel-unsupported-projection': 'warning.directoryTreeCsvExcelUnsupportedProjection',
  'unsupported-tile-matrix-set': 'warning.directoryTreeUnsupportedTileMatrixSet',
  'load-failed': 'warning.directoryTreeLoadFailed'
}

type DirectoryTreeTranslate = (key: string, params?: Record<string, any>) => string

export type DisplayTreeNode = Omit<RuntimeTreeNode, 'disabledReason' | 'children'> & {
  disableCheckbox?: boolean
  disabledReason?: string
  titleDisabled?: boolean
  titleTooltip?: string
  children?: DisplayTreeNode[]
}

export interface DirectoryTreeDisplayOptions {
  t: DirectoryTreeTranslate
  getMapTarget: () => string | undefined
  isNodeBusy: (node: RuntimeTreeNode) => boolean
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

  function mapNodesForTree(nodes: RuntimeTreeNode[]): DisplayTreeNode[] {
    return nodes.map(node => {
      const titleTooltip = getDisabledReasonText(node.disabledReason)
      const titleDisabled = !!node.disabledReason && !isBrowseOnlyResourceNode(node)

      return {
        ...node,
        checkable: node.kind === 'resource' ? true : node.checkable,
        disableCheckbox: !options.getMapTarget() || !node.checkable || node.disabled || options.isNodeBusy(node),
        disabled: node.disabled,
        titleDisabled,
        titleTooltip,
        disabledReason: getDisabledReasonText(node.disabledReason),
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
