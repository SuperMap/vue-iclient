export type ImageryLayerTranslator = (key: string) => string

export interface ImageryLayerNameOptions {
  fallback?: string
}

interface OnlineBaseLayer {
  url: string
  name: string
}

type LayerRecord = Record<string, unknown>

const onlineBaseLayers: OnlineBaseLayer[] = [
  { url: './images/baseMap/baseImage.jpg', name: 'LocalImage' },
  { url: '//dev.virtualearth.net/', name: 'BingMap' },
  { url: 'GRIDIMAGERY', name: 'GRIDIMAGERY' },
  { url: 'https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png', name: 'OSM' }
]

const tiandituLabelLayerTypes = ['cva_w', 'cva_c', 'cta_w', 'cta_c', 'cia_w', 'cia_c']

export function getImageryLayerName(
  imageryLayer: unknown,
  t: ImageryLayerTranslator,
  options: ImageryLayerNameOptions = {}
) {
  const layer = getLayerRecord(imageryLayer)
  const customName = getString(layer?.customName)?.trim()
  if (customName) {
    return customName
  }

  const imageryProvider = getImageryProvider(imageryLayer)
  const imageUrl = getString(imageryProvider?.url) ?? getString(imageryProvider?._url)

  if (!imageUrl) {
    return t('sceneLayerList.lnglatMap')
  }

  if (imageUrl.includes('earth-skin2.jpg')) {
    return t('sceneLayerList.defaultImage')
  }

  if (imageUrl.includes('tianditu.gov.cn')) {
    return getTiandituName(imageUrl, t)
  }

  const onlineBaseLayer = onlineBaseLayers.find(layer => imageUrl.includes(layer.url))
  if (onlineBaseLayer) {
    return t('sceneLayerList.' + onlineBaseLayer.name)
  }

  if (imageUrl.includes('realspace/datas/')) {
    return imageUrl.split('realspace/datas/')[1].replace('/', '')
  }

  const tableName = getString(imageryProvider?.tablename)
  return getTableName(tableName) ?? options.fallback ?? 'Unnamed'
}

function getTiandituName(imageUrl: string, t: ImageryLayerTranslator) {
  const layerTypeKey = imageUrl.split('/')[3]
  if (tiandituLabelLayerTypes.includes(layerTypeKey)) {
    return t('sceneLayerList.TIANDITU') + '_label'
  }
  return t('sceneLayerList.TIANDITU')
}

function getTableName(tableName?: string) {
  if (!tableName || tableName.includes('http')) {
    return undefined
  }

  if (tableName.includes('/rest/maps/')) {
    const name = tableName.split('/rest/maps/')[1]
    return name.includes('%') ? decodeMapName(name) : name
  }

  if (tableName.includes('%')) {
    return tableName.split('%')[0]
  }

  if (tableName.includes('/maps/')) {
    return tableName.split('/maps/')[1].replace('/', '')
  }

  return tableName
}

function decodeMapName(name: string) {
  try {
    const decodedName = decodeURIComponent(name)
    return decodedName.split('@')[0]
  } catch {
    return name.split('@')[0]
  }
}

function getImageryProvider(imageryLayer: unknown) {
  const layer = getLayerRecord(imageryLayer)
  return getLayerRecord(layer?.imageryProvider ?? layer?._imageryProvider)
}

function getLayerRecord(value: unknown): LayerRecord | undefined {
  return value && typeof value === 'object' ? (value as LayerRecord) : undefined
}

function getString(value: unknown) {
  return typeof value === 'string' ? value : undefined
}
