import * as mapboxgl from '@supermapgis/iclient-components-core/static/libs/mapboxgl/mapbox-gl-enhance.js'
import type { GeoJSONSource, Map as MapboxMap, MapboxOptions } from 'mapbox-gl'

const bounds = new mapboxgl.LngLatBounds()
const evented: typeof mapboxgl.Evented = mapboxgl.Evented
const event = new mapboxgl.Evented().fire('test').on('test', () => {}).off('test')
// @ts-expect-error 事件名称必须是字符串；此断言确保导入没有退化为 any。
new mapboxgl.Evented().fire(123)
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
  event,
  externalCrs,
  externalData,
  externalOptions,
  externalStyle,
  options,
  style,
  webMap
}
