import type {
  AggregationType,
  DefaultDirectoryNode,
  DirectoryNode,
  DirectoryNodeType,
  DirectoryTreeSchemaV1,
  NormalizedDirectoryTreeResult,
  NormalizedDirectoryTreeSchema,
  QueryDirectoryNode,
  QueryBoundingBox,
  QueryDirectoryQuery,
  ResourceDirectoryNode,
  ResourceType,
  RuntimeTreeNode,
} from '../types'
import {
  DEFAULT_DIRECTORY_TREE_TITLE,
  DIRECTORY_TREE_AGGREGATION_TYPES,
  DIRECTORY_TREE_NODE_TYPES,
  DIRECTORY_TREE_RESOURCE_TYPES,
  DIRECTORY_TREE_SCHEMA_VERSION
} from '../types'

export function createEmptyNormalizedDirectoryTree(): NormalizedDirectoryTreeResult {
  return {
    schema: {
      version: DIRECTORY_TREE_SCHEMA_VERSION,
      title: DEFAULT_DIRECTORY_TREE_TITLE,
      directoryCheckable: true,
      nodes: []
    },
    rootNodes: []
  }
}

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function isDirectoryNodeType(value: unknown): value is DirectoryNodeType {
  return DIRECTORY_TREE_NODE_TYPES.includes(value as DirectoryNodeType)
}

function isResourceType(value: unknown): value is ResourceType {
  return DIRECTORY_TREE_RESOURCE_TYPES.includes(value as ResourceType)
}

function isAggregationType(value: unknown): value is AggregationType {
  return DIRECTORY_TREE_AGGREGATION_TYPES.includes(value as AggregationType)
}

function normalizeString(value: unknown, fieldName: string): string {
  invariant(typeof value === 'string' && value.trim(), `${fieldName} is required`)
  return value.trim()
}

function normalizeOptionalString(value: unknown, fieldName: string): string | undefined {
  if (value == null || value === '') {
    return undefined
  }
  invariant(typeof value === 'string', `${fieldName} must be a string`)
  return value.trim() || undefined
}

function normalizeIcon(value: unknown, fieldName: string): string | undefined {
  return normalizeOptionalString(value, fieldName)
}

function normalizeResourceIcon(node: Record<string, any>, fieldName: string): string | undefined {
  return normalizeIcon(node.resourceIcon, fieldName)
}

function normalizeStringArray(value: unknown, fieldName: string): string[] | undefined {
  if (value == null) {
    return undefined
  }
  invariant(Array.isArray(value), `${fieldName} must be an array`)
  return value.map((item, index) => normalizeString(item, `${fieldName}[${index}]`))
}

function normalizeNumberArray(value: unknown, fieldName: string): number[] | undefined {
  if (value == null) {
    return undefined
  }
  invariant(Array.isArray(value), `${fieldName} must be an array`)
  return value.map((item, index) => {
    invariant(typeof item === 'number' && Number.isFinite(item), `${fieldName}[${index}] must be a number`)
    return item
  })
}

function normalizeBoundingBoxPoint(
  value: unknown,
  fieldName: string
): QueryBoundingBox['leftBottom'] | QueryBoundingBox['rightTop'] {
  invariant(isPlainObject(value), `${fieldName} must be an object`)
  invariant(typeof value.x === 'number' && Number.isFinite(value.x), `${fieldName}.x must be a number`)
  invariant(typeof value.y === 'number' && Number.isFinite(value.y), `${fieldName}.y must be a number`)
  return {
    x: value.x,
    y: value.y
  }
}

function normalizeBoundingBox(value: unknown, fieldName: string): QueryBoundingBox | undefined {
  if (value == null) {
    return undefined
  }
  invariant(isPlainObject(value), `${fieldName} must be an object`)
  return {
    leftBottom: normalizeBoundingBoxPoint(value.leftBottom, `${fieldName}.leftBottom`),
    rightTop: normalizeBoundingBoxPoint(value.rightTop, `${fieldName}.rightTop`)
  }
}

function normalizeAggregationTypes(value: unknown, fieldName: string): AggregationType[] | undefined {
  if (value == null) {
    return undefined
  }
  invariant(Array.isArray(value), `${fieldName} must be an array`)
  return value.map((item, index) => {
    invariant(isAggregationType(item), `${fieldName}[${index}] is invalid`)
    return item
  })
}

function normalizeDirectoryCheckable(value: unknown): boolean {
  if (value == null) {
    return true
  }
  invariant(typeof value === 'boolean', 'directoryCheckable must be a boolean')
  return value
}

function normalizeRootTitle(value: unknown): string {
  if (value == null) {
    return DEFAULT_DIRECTORY_TREE_TITLE
  }
  invariant(typeof value === 'string', 'treeSchema.title must be a string')
  return value.trim()
}

function normalizeQuery(params: unknown): QueryDirectoryQuery {
  invariant(isPlainObject(params), 'resource-search params is required')

  const resourceType = params.resourceType
  invariant(isResourceType(resourceType), 'resource-search params.resourceType is invalid')

  return {
    resourceType,
    text: normalizeOptionalString(params.text, 'params.text'),
    resourceSubTypes: normalizeStringArray(params.resourceSubTypes, 'params.resourceSubTypes'),
    resourceIds: normalizeNumberArray(params.resourceIds, 'params.resourceIds'),
    searchType: normalizeOptionalString(params.searchType, 'params.searchType'),
    boundingBox: normalizeBoundingBox(params.boundingBox, 'params.boundingBox'),
    tags: normalizeStringArray(params.tags, 'params.tags'),
    groupIds: normalizeStringArray(params.groupIds, 'params.groupIds'),
    departmentIds: normalizeStringArray(params.departmentIds, 'params.departmentIds'),
    aggregationTypes: normalizeAggregationTypes(params.aggregationTypes, 'params.aggregationTypes'),
    orderBy: normalizeOptionalString(params.orderBy, 'params.orderBy'),
    orderType: normalizeOptionalString(params.orderType, 'params.orderType')
  }
}

function normalizeChildren(children: unknown, seenIds: Set<string>): DirectoryNode[] | undefined {
  if (children == null) {
    return undefined
  }
  invariant(Array.isArray(children), 'children must be an array')
  return children.map((child, index) => normalizeNode(child, seenIds, `children[${index}]`))
}

function normalizeDefaultNode(
  node: Record<string, any>,
  seenIds: Set<string>
): DefaultDirectoryNode {
  return {
    type: 'default',
    id: normalizeString(node.id, 'default node id'),
    title: normalizeString(node.title, 'default node title'),
    icon: normalizeIcon(node.icon, 'default node icon'),
    children: normalizeChildren(node.children, seenIds)
  }
}

function normalizeResourceDirectoryNode(
  node: Record<string, any>,
  seenIds: Set<string>
): ResourceDirectoryNode {
  const directoryId = node.directoryId
  invariant(
    typeof directoryId === 'string' || typeof directoryId === 'number',
    'resource-directory directoryId is required'
  )

  return {
    type: 'resource-directory',
    id: normalizeString(node.id, 'resource-directory node id'),
    title: normalizeOptionalString(node.title, 'resource-directory node title'),
    icon: normalizeIcon(node.icon, 'resource-directory node icon'),
    resourceIcon: normalizeResourceIcon(node, 'resource-directory node resourceIcon'),
    directoryId,
    children: normalizeChildren(node.children, seenIds)
  }
}

function normalizeQueryDirectoryNode(
  node: Record<string, any>,
  seenIds: Set<string>
): QueryDirectoryNode {
  return {
    type: 'resource-search',
    id: normalizeString(node.id, 'resource-search node id'),
    title: normalizeString(node.title, 'resource-search node title'),
    icon: normalizeIcon(node.icon, 'resource-search node icon'),
    resourceIcon: normalizeResourceIcon(node, 'resource-search node resourceIcon'),
    params: normalizeQuery(node.params),
    children: normalizeChildren(node.children, seenIds)
  }
}

function normalizeNode(node: unknown, seenIds: Set<string>, fieldName = 'node'): DirectoryNode {
  invariant(isPlainObject(node), `${fieldName} must be an object`)

  const normalizedNodeType =
    node.type == null
      ? 'default'
      : typeof node.type === 'string'
        ? node.type
        : node.type
  invariant(isDirectoryNodeType(normalizedNodeType), `Unsupported directory node type: ${String(node.type)}`)

  const nodeId = normalizeString(node.id, `${fieldName}.id`)
  invariant(!seenIds.has(nodeId), `Duplicate DirectoryNode.id: ${nodeId}`)
  seenIds.add(nodeId)

  switch (normalizedNodeType) {
    case 'default':
      return normalizeDefaultNode({ ...node, id: nodeId, type: 'default' }, seenIds)
    case 'resource-directory':
      return normalizeResourceDirectoryNode({ ...node, id: nodeId }, seenIds)
    case 'resource-search':
      return normalizeQueryDirectoryNode({ ...node, id: nodeId }, seenIds)
  }
}

function createRuntimeNode(node: DirectoryNode, directoryCheckable: boolean, parentKey?: string): RuntimeTreeNode {
  const nodeType = (node.type ?? 'default') as DirectoryNodeType
  const key = createSchemaDirectoryKey(node.id)
  const childNodes = node.children?.map(child => createRuntimeNode(child, directoryCheckable, key)) || []
  const hasStaticChildren = childNodes.length > 0
  const isLazyDirectory = nodeType === 'resource-directory' || nodeType === 'resource-search'
  const title =
    nodeType === 'resource-directory' && 'directoryId' in node ? node.title || String(node.directoryId) : node.title

  const runtimeNode: RuntimeTreeNode = {
    key,
    id: key,
    parentKey,
    title,
    icon: 'icon' in node ? node.icon : undefined,
    resourceIcon: 'resourceIcon' in node ? node.resourceIcon : undefined,
    kind: 'directory',
    sourceType: nodeType,
    isLeaf: !hasStaticChildren && !isLazyDirectory,
    checkable: directoryCheckable,
    disabled: false,
    loadState: hasStaticChildren || nodeType === 'default' ? 'loaded' : 'idle',
    raw: node
  }

  if (hasStaticChildren) {
    runtimeNode.children = childNodes
  }

  return runtimeNode
}

export function createSchemaDirectoryKey(nodeId: string): string {
  return `dir:${nodeId}`
}

export function createRemoteDirectoryKey(parentNodeId: string, directoryId: string | number): string {
  return `dir:${parentNodeId}:remote:${directoryId}`
}

export function createResourceNodeKey(
  sourceNodeId: string,
  resourceType: ResourceType,
  resourceId: string | number
): string {
  return `res:${sourceNodeId}:${resourceType}:${resourceId}`
}

export function createIportalDirectoryCacheKey(directoryId: string | number): string {
  return `resource-directory:${directoryId}`
}

function serializeQueryDirectoryParams(params: QueryDirectoryQuery): string {
  return JSON.stringify(params)
}

export function createQueryDirectoryCacheKey(nodeId: string, params: QueryDirectoryQuery): string {
  return `resource-search:${nodeId}:${serializeQueryDirectoryParams(params)}`
}

export function normalizeDirectoryTreeSchema(
  schema: DirectoryTreeSchemaV1
): NormalizedDirectoryTreeSchema {
  invariant(isPlainObject(schema), 'treeSchema must be an object')
  const version = schema.version
  invariant(
    version === DIRECTORY_TREE_SCHEMA_VERSION,
    `Unsupported version: ${String(version)}`
  )
  invariant(Array.isArray(schema.nodes), 'treeSchema.nodes must be an array')

  const seenIds = new Set<string>()

  return {
    version: DIRECTORY_TREE_SCHEMA_VERSION,
    title: normalizeRootTitle(schema.title),
    directoryCheckable: normalizeDirectoryCheckable(schema.directoryCheckable),
    nodes: schema.nodes.map((node, index) => normalizeNode(node, seenIds, `nodes[${index}]`))
  }
}

export function normalizeDirectoryTree(schema: DirectoryTreeSchemaV1): NormalizedDirectoryTreeResult {
  const normalizedSchema = normalizeDirectoryTreeSchema(schema)
  const rootNodes = normalizedSchema.nodes.map(node =>
    createRuntimeNode(node, normalizedSchema.directoryCheckable ?? true)
  )

  return {
    schema: normalizedSchema,
    rootNodes
  }
}

export function normalizeDirectoryTreeOrEmpty(
  schema?: DirectoryTreeSchemaV1 | null
): NormalizedDirectoryTreeResult {
  if (!schema || !Array.isArray((schema as Partial<DirectoryTreeSchemaV1>).nodes)) {
    return createEmptyNormalizedDirectoryTree()
  }
  if (schema.nodes.length === 0) {
    return {
      schema: {
        version: DIRECTORY_TREE_SCHEMA_VERSION,
        title: normalizeRootTitle(schema.title),
        directoryCheckable: normalizeDirectoryCheckable(schema.directoryCheckable),
        nodes: []
      },
      rootNodes: []
    }
  }
  return normalizeDirectoryTree(schema)
}

