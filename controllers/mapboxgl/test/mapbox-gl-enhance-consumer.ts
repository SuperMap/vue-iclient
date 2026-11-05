import * as mapboxgl from '@supermapgis/iclient-components-core/static/libs/mapboxgl/mapbox-gl-enhance'
import type { GeoJSONSource, Map as MapboxMap, MapboxOptions } from 'mapbox-gl'

const bounds = new mapboxgl.LngLatBounds()
const evented: typeof mapboxgl.Evented = mapboxgl.Evented
const webMap: unknown = mapboxgl.supermap.WebMap
declare const map: mapboxgl.Map
declare const source: mapboxgl.GeoJSONSource
const style = map.style
const crs = map.getCRS()
const data = source.getData()
const options: mapboxgl.MapboxOptions = { container: 'map', crs: 'EPSG:4326' }
declare const externalMap: MapboxMap
declare const externalSource: GeoJSONSource
const externalStyle = externalMap.style
const externalCrs = externalMap.getCRS()
const externalData = externalSource.getData()
const externalOptions: MapboxOptions = { container: 'map', crs: 'EPSG:4326' }

export {
  bounds,
  crs,
  data,
  evented,
  externalCrs,
  externalData,
  externalOptions,
  externalStyle,
  options,
  style,
  webMap
}
