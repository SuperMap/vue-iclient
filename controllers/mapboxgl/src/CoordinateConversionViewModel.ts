import type mapboxglTypes from 'mapbox-gl'
import mapboxgl from 'mapbox-gl'

interface MapEventCallback {
  (e: mapboxglTypes.MapMouseEvent): void
}

/**
 * @class CoordinateConversionViewModel
 * @description 坐标转换 vm 层：负责地图鼠标移动/点击捕捉、标记点与定位，独立于 Vue 与 BuilderX。
 * @extends mapboxgl.Evented
 */
export default class CoordinateConversionViewModel extends mapboxgl.Evented {
  map: mapboxglTypes.Map
  marker: mapboxglTypes.Marker
  _getCoordinateFn: MapEventCallback
  _clickCallbackFn: MapEventCallback

  constructor() {
    super()
    this.marker = null
    this._getCoordinateFn = this._getCoordinate.bind(this)
    this._clickCallbackFn = this._clickCallback.bind(this)
  }

  setMap(mapInfo: { map: mapboxglTypes.Map }) {
    const { map } = mapInfo
    this.map = map || null
    this._bindMouseMove()
  }

  _bindCapture() {
    this._unbindMouseMove()
    this._bindClick()
  }

  _bindHover() {
    this._clearMarker()
    this._unbindClick()
    this._bindMouseMove()
  }

  _getCoordinate(e: mapboxglTypes.MapMouseEvent) {
    const coordinate = e.lngLat
    this.fire('getcoordinate', {
      coordinate
    })
    return coordinate
  }

  _bindMouseMove(map: mapboxglTypes.Map = this.map) {
    if (!map) {
      return
    }
    this._changeCursor()
    map.on('mousemove', this._getCoordinateFn)
  }

  private _bindClick(map: mapboxglTypes.Map = this.map) {
    if (!map) {
      return
    }
    this._changeCursor('pointer')
    map.on('click', this._clickCallbackFn)
  }

  private _unbindMouseMove(map: mapboxglTypes.Map = this.map) {
    map && map.off('mousemove', this._getCoordinateFn)
  }

  private _unbindClick(map: mapboxglTypes.Map = this.map) {
    map && map.off('click', this._clickCallbackFn)
  }

  private _clickCallback(e: mapboxglTypes.MapMouseEvent) {
    const coordinate = this._getCoordinate(e)
    this._addMarker(coordinate)
  }

  private _changeCursor(cursorType = 'default', map: mapboxglTypes.Map = this.map) {
    if (map && map.getCanvas()) {
      map.getCanvas().style.cursor = cursorType
    }
  }

  _addMarker(coordinate: mapboxglTypes.LngLatLike, map: mapboxglTypes.Map = this.map) {
    this._clearMarker()
    if (!map) {
      return
    }
    this.marker = new mapboxgl.Marker().setLngLat(coordinate).addTo(map)
  }

  _flyTo(coordinate: mapboxglTypes.LngLatLike, map: mapboxglTypes.Map = this.map) {
    if (!map) {
      return
    }
    map.flyTo({ center: coordinate })
  }

  _clearMarker() {
    this.marker && this.marker.remove()
    this.marker = null
  }

  removed() {
    this._unbindMouseMove()
    this._unbindClick()
    this._clearMarker()
  }
}
