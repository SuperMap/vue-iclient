import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';

/**
 * @class CoordinateConversionViewModel
 * @description Coordinate Conversion viewModel（坐标转换vm层）.
 * @extends mapboxgl.Evented
 */

export default class CoordinateConversionViewModel extends mapboxgl.Evented {
  constructor() {
    super();
    this.marker = null;
    this._getCoordinateFn = this._getCoordinate.bind(this);
    this._clickCallbackFn = this._clickCallback.bind(this);
  }

  public setMap(mapInfo) {
    const { map } = mapInfo;
    this.map = map || null;
    this._bindMouseMove();
  }

  _bindCapture() {
    this._unbindMouseMove();
    this._bindClick();
  }

  _bindHover() {
    this._clearMarker();
    this._unbindClick();
    this._bindMouseMove();
  }

  _getCoordinate(e) {
    const coordinate = e.lngLat;
    this.fire('getcoordinate', {
      coordinate
    });
    return coordinate;
  }

  _bindMouseMove(map: mapboxglTypes.Map = this.map) {
    if (!map) {
      return;
    }
    this._changeCursor();
    map.on('mousemove', this._getCoordinateFn);
  }

  private _bindClick(map: mapboxglTypes.Map = this.map) {
    if (!map) {
      return;
    }
    this._changeCursor('pointer');
    map.on('click', this._clickCallbackFn);
  }

  private _unbindMouseMove(map: mapboxglTypes.Map = this.map) {
    map && map.off('mousemove', this._getCoordinateFn);
  }

  private _unbindClick(map: mapboxglTypes.Map = this.map) {
    map && map.off('click', this._clickCallbackFn);
  }

  private _clickCallback(e) {
    const coordinate = this._getCoordinate(e);
    this._addMarker(coordinate);
  }

  private _changeCursor(cursorType: string = 'default', map: mapboxglTypes.Map = this.map) {
    if (map && map.getCanvas()) {
      map.getCanvas().style.cursor = cursorType;
    }
  }

  private _addMarker(coordinate: mapboxglTypes.LngLatLike, map: mapboxglTypes.Map = this.map) {
    this._clearMarker();
    if (!map) {
      return;
    }
    this.marker = new mapboxgl.Marker().setLngLat(coordinate).addTo(map);
  }

  _flyTo(coordinate: mapboxglTypes.LngLatLike, map: mapboxglTypes.Map = this.map) {
    if (!map) {
      return;
    }
    map.flyTo({ center: coordinate });
  }

  _clearMarker() {
    this.marker && this.marker.remove();
    this.marker = null;
  }

  removed() {
    this._unbindMouseMove();
    this._unbindClick();
    this._clearMarker();
  }
}