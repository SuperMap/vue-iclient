import { WebMap } from '@supermapgis/iclient-mapboxgl'
import { vi } from 'vitest'

const commonId = 123
const commonOption = {
  accessKey: undefined,
  accessToken: undefined,
  excludePortalProxyUrl: undefined,
  iportalServiceProxyUrlPrefix: undefined,
  isSuperMapOnline: undefined,
  proxy: undefined,
  serverUrl: 'https://fakeiportal.supermap.io/iportal',
  target: 'map',
  tiandituKey: undefined,
  withCredentials: false
}
const commonMapOptions = {
  container: 'map',
  style: {
    version: 8,
    sources: {
      'raster-tiles': {
        type: 'raster',
        tiles: ['https://test'],
        tileSize: 256
      }
    },
    layers: [
      {
        id: 'simple-tiles',
        type: 'raster',
        source: 'raster-tiles',
        minzoom: 5,
        maxzoom: 20
      }
    ]
  },
  center: [120.143, 30.236],
  zoom: 3,
  bounds: {
    getEast: () => 2,
    getWest: () => -1,
    getSouth: () => 2,
    getNorth: () => -1
  }
}

const layerIdMapList = {}
const sourceIdMapList = {}

const commonMap = {
  resize: () => vi.fn(),
  getZoom: () => {
    return 2
  },
  setZoom: () => vi.fn(),
  setCRS: () => vi.fn(),
  getCenter: () => {
    return {
      lng: 1,
      lat: 2
    }
  },
  setCenter: () => vi.fn(),
  getBearing: () => 2,
  setBearing: () => vi.fn(),
  getPitch: () => 2,
  setPitch: () => vi.fn(),
  getStyle: () => {
    const layers = []
    if (layerIdMapList) {
      for (const key in layerIdMapList) {
        layers.push(layerIdMapList[key])
      }
    }
    return {
      sources: sourceIdMapList,
      layers
    }
  },
  addSource: (sourceId, sourceInfo) => {
    sourceIdMapList[sourceId] = sourceInfo
    if (sourceInfo.type === 'geojson') {
      sourceIdMapList[sourceId]._data = sourceInfo.data
      sourceIdMapList[sourceId].setData = (function (sourceId) {
        return function (data) {
          sourceIdMapList[sourceId]._data = data
        }
      })(sourceId)
    }
    if (sourceInfo.type === 'raster' && sourceInfo.rasterSource === 'iserver') {
      sourceIdMapList[sourceId].clearTiles = () => vi.fn()
      sourceIdMapList[sourceId].update = () => vi.fn()
    }
  },
  getSource: sourceId => {
    return sourceIdMapList[sourceId]
  },
  removeSource: sourceId => {
    delete sourceIdMapList[sourceId]
  },
  triggerRepaint: () => vi.fn(),
  style: {
    sourceCaches: sourceIdMapList
  },
  getLayer: layerId => {
    return layerIdMapList[layerId]
  },
  removeLayer: layerId => {
    delete layerIdMapList[layerId]
  },
  getCRS: () => {
    return {
      epsgCode: 'EPSG:3857',
      getExtent: () => vi.fn()
    }
  },
  getAppreciableLayers: () => {
    return Object.values(layerIdMapList)
  },
  addLayer: layerInfo => {
    layerIdMapList[layerInfo.id] = layerInfo
    if (typeof layerInfo.source === 'object') {
      const source = Object.assign({}, layerInfo.source)
      layerIdMapList[layerInfo.id].source = layerInfo.id
      commonMap.addSource(layerInfo.id, source)
    }
  },
  moveLayer: () => vi.fn(),
  overlayLayersManager: {},
  on: () => {},
  off: () => {},
  fire: () => {},
  setLayoutProperty: () => vi.fn(),
  setPaintProperty: vi.fn(),
  addStyle: () => vi.fn(),
  remove: () => vi.fn(),
  setRenderWorldCopies: () => vi.fn(),
  setStyle: () => vi.fn(),
  loadImage: function (src, callback) {
    callback(null, { width: 15 })
  },
  addImage: function () {},
  hasImage: function () {
    return false
  }
}

describe('Test @supermapgis/iclient-mapboxgl is the latest versions', () => {
  it('should return 1 when opacity is undefined', () => {
    const webmap = new WebMap(
      commonId,
      { ...commonOption, map: commonMap },
      { ...commonMapOptions }
    )
    expect(webmap.getPopupInfos).not.toBeNull()
  })
})
