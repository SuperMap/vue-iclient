import type { PropType } from 'vue'
import type { ShortEmits } from '@supermapgis/common/utils/index.common'
import { getPropsDefaults } from '@supermapgis/common/utils/index.common'

export const DIRECTORY_TREE_SCHEMA_VERSION = '1.0.0' as const
export const DEFAULT_DIRECTORY_TREE_TITLE = '资源目录' as const
export const DIRECTORY_TREE_QUERY_PAGE_SIZE = 100

export const DIRECTORY_TREE_RESOURCE_TYPES = ['MAP', 'DATA', 'SERVICE'] as const
export const DIRECTORY_TREE_AGGREGATION_TYPES = ['TAG', 'TYPE'] as const
export const DIRECTORY_TREE_NODE_TYPES = [
  'default',
  'resource-directory',
  'resource-search'
] as const
export const DIRECTORY_TREE_SERVICE_TYPES = [
  'MAP',
  'SINGLE_MAP',
  'DATA',
  'DATASET',
  'VECTOR_MAP',
  'SINGLE_VECTOR_MAP',
  'WMTS',
  'WMS',
  'ARCGIS_REST_VECTORTILE_SERVICE'
] as const
export const DIRECTORY_TREE_DISABLED_REASON_CODES = [
  'missing-map-target',
  'unsupported-resource-type',
  'unsupported-service-type',
  'service-unavailable',
  'missing-projection',
  'crs-mismatch',
  'load-failed'
] as const

export type ResourceType = (typeof DIRECTORY_TREE_RESOURCE_TYPES)[number]
export type AggregationType = (typeof DIRECTORY_TREE_AGGREGATION_TYPES)[number]
export type DirectoryNodeType = (typeof DIRECTORY_TREE_NODE_TYPES)[number]
export type ServiceType = (typeof DIRECTORY_TREE_SERVICE_TYPES)[number]
export type DisabledReasonCode = (typeof DIRECTORY_TREE_DISABLED_REASON_CODES)[number]
export type LoadState = 'idle' | 'loading' | 'loaded' | 'error'
export type RuntimeNodeOperationState = 'checking' | 'unchecking'

export interface RuntimeNodeBatchProgress {
  action: RuntimeNodeOperationState
  completed: number
  total: number
}

export interface DirectoryNodeIconOptions {
  icon?: string
}

export interface DirectoryResourceIconOptions {
  resourceIcon?: string
  'resource-icon'?: string
}

export interface DefaultDirectoryNode extends DirectoryNodeIconOptions {
  type?: 'default' | 'semantic'
  id: string
  title: string
  children?: DirectoryNode[]
}

export interface ResourceDirectoryNode extends DirectoryNodeIconOptions, DirectoryResourceIconOptions {
  type: 'resource-directory' | 'iportal' | 'iportal-directory'
  id: string
  title?: string
  directoryId: string | number
  children?: DirectoryNode[]
}

export interface QueryBoundingBoxPoint {
  x: number
  y: number
}

export interface QueryBoundingBox {
  leftBottom: QueryBoundingBoxPoint
  rightTop: QueryBoundingBoxPoint
}

export interface QueryDirectoryQuery {
  resourceType: ResourceType
  text?: string
  resourceSubTypes?: string[]
  resourceIds?: number[]
  searchType?: string
  boundingBox?: QueryBoundingBox
  tags?: string[]
  groupIds?: string[]
  departmentIds?: string[]
  aggregationTypes?: AggregationType[]
  orderBy?: string
  orderType?: string
}

export interface QueryDirectoryNode extends DirectoryNodeIconOptions, DirectoryResourceIconOptions {
  type: 'resource-search' | 'custom' | 'search-directory' | 'query-directory'
  id: string
  title: string
  params?: QueryDirectoryQuery
  query?: QueryDirectoryQuery
  children?: DirectoryNode[]
}

export type DirectoryNode = DefaultDirectoryNode | ResourceDirectoryNode | QueryDirectoryNode

export interface DirectoryTreeSchemaV1 {
  version?: typeof DIRECTORY_TREE_SCHEMA_VERSION
  schemaVersion?: typeof DIRECTORY_TREE_SCHEMA_VERSION
  title?: string
  directoryCheckable?: boolean
  nodes: DirectoryNode[]
}

export interface NormalizedDirectoryTreeSchema extends DirectoryTreeSchemaV1 {}

export interface ResourceDescriptor {
  key: string
  resourceId: number | string
  name: string
  resourceType: ResourceType
  sourceNodeId: string
  serviceType?: ServiceType
  serverUrl?: string
  projection?: string | null
  overlaySupported: boolean
  disabledReason?: DisabledReasonCode
  raw: unknown
}

export type ResourceLoadPlan =
  | {
      kind: 'map-id'
      mapId: string | number
      serverUrl: string
      withCredentials?: boolean
    }
  | {
      kind: 'webmap-object'
      mapInfo: Record<string, any>
      serverUrl?: string
      withCredentials?: boolean
    }

export interface RuntimeTreeNode {
  key: string
  id: string
  parentKey?: string
  title: string
  icon?: string
  resourceIcon?: string
  kind: 'directory' | 'resource'
  sourceType: DirectoryNodeType
  isLeaf: boolean
  checkable: boolean
  disabled: boolean
  disabledReason?: DisabledReasonCode
  loadState: LoadState
  children?: RuntimeTreeNode[]
  resource?: ResourceDescriptor
  raw?: unknown
  pendingValidation?: boolean
  operationState?: RuntimeNodeOperationState
  batchProgress?: RuntimeNodeBatchProgress
}

export interface DirectoryTreeSelectEventPayload {
  node: RuntimeTreeNode
  resource?: ResourceDescriptor
}

export interface DirectoryTreeCheckFailure {
  nodeId: string
  reason: DisabledReasonCode
}

export interface DirectoryTreeCheckChangeEventPayload {
  checkedResources: ResourceDescriptor[]
  changedResources: ResourceDescriptor[]
  failures: DirectoryTreeCheckFailure[]
}

export type DirectoryTreeEvents = {
  select: [DirectoryTreeSelectEventPayload]
  'check-change': [DirectoryTreeCheckChangeEventPayload]
}

export type DirectoryTreeEmits = ShortEmits<DirectoryTreeEvents>

export interface DirectoryTreeProps {
  treeSchema?: DirectoryTreeSchemaV1 | null
  mapTarget?: string
  style?: Record<string, any>
}

export const directoryTreeProps = () => ({
  treeSchema: {
    type: Object as PropType<DirectoryTreeSchemaV1 | null>,
    required: false
  },
  mapTarget: {
    type: String
  },
  style: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({})
  }
})

export const directoryTreePropsDefault = getPropsDefaults<DirectoryTreeProps>(
  Object.assign(directoryTreeProps())
)

export interface QuerySearchRequest extends QueryDirectoryQuery {
  currentPage: number
  pageSize: number
}

export interface QuerySearchResponseItem {
  id: number | string
  title: string
  updateTime?: number
  resourceType: ResourceType
  sourceType?: string
  epsgCode?: number
  projection?: string
  serviceType?: string
  url?: string
  raw: unknown
}

export interface QuerySearchResponse {
  total: number
  totalPage: number
  currentPage: number
  pageSize: number
  content: QuerySearchResponseItem[]
}

export interface NormalizedDirectoryTreeResult {
  schema: NormalizedDirectoryTreeSchema
  rootNodes: RuntimeTreeNode[]
}

export default directoryTreeProps

