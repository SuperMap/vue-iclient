import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';
import clonedeep from 'lodash.clonedeep';

/**
 * @class MiniMapViewModel
 * @description mini map viewModel.
 * @param {Object} parentMap - 外层 Map。
 * @param {Object} miniMap - 内层 Map。
 * @fires MiniMapViewModel#minimapmousedown
 * @fires MiniMapViewModel#minimapmousemove
 * @fires MiniMapViewModel#minimapmouseup
 * @fires MiniMapViewModel#minimapupdated
 * @extends mapboxgl.Evented
 */
export default class MiniMapViewModel extends mapboxgl.Evented {
  constructor() {
    super();
    this.options = {
      id: 'mapboxgl-minimap',
      zoomAdjust: null,
      bounds: 'parent',
      lineColor: '#08F',
      lineWidth: 1,
      lineOpacity: 1,
      fillColor: '#F80',
      fillOpacity: 0.25,

      dragPan: false,
      scrollZoom: false,
      boxZoom: false,
      dragRotate: false,
      keyboard: false,
      doubleClickZoom: false,
      touchZoomRotate: false
    };

    this._ticking = false;
    this._lastMouseMoveEvent = null;
    this._isDragging = false;
    this._isCursorOverFeature = false;
    this._previousPoint = [0, 0];
    this._currentPoint = [0, 0];
    this._trackingRectCoordinates = [[[], [], [], [], []]];
  }

  setMap(mapInfo) {
    const { map } = mapInfo;
    this._parentMap = map;
  }

  setContainer(container) {
    this._container = container;
    this._updateFn = this._update.bind(this);
    this._setStyleFn = this._setStyle.bind(this);
    this._mouseMoveFn = this._mouseMove.bind(this);
    this._mouseDownFn = this._mouseDown.bind(this);
    this._mouseUpFn = this._mouseUp.bind(this);
    this.initializeMiniMap();
  }

  initializeMiniMap() {
    const _this = this;
    this._miniMap = new mapboxgl.Map({
      attributionControl: false,
      container: _this._container,
      style: clonedeep(_this._parentMap.getStyle()),
      zoom: 1,
      crs: this._parentMap.getCRS(),
      center: [0, 0],
      renderWorldCopies: false,
      localIdeographFontFamily: this._parentMap._localIdeographFontFamily
    });
    this._miniMap.on('load', () => {
      this.fire('minimaploaded', { miniMap: this._miniMap });
      this._miniMap.resize();
      this.loadMiniMap();
      window.minimap = this._miniMap;
    });
  }

  loadMiniMap() {
    var opts = this.options;
    var parentMap = this._parentMap;
    var miniMap = this._miniMap;
    var interactions = [
      'dragPan',
      'scrollZoom',
      'boxZoom',
      'dragRotate',
      'keyboard',
      'doubleClickZoom',
      'touchZoomRotate'
    ];

    interactions.forEach(function(i) {
      if (opts[i] !== true) {
        miniMap[i].disable();
      }
    });

    if (typeof opts.zoomAdjust === 'function') {
      this.options.zoomAdjust = opts.zoomAdjust.bind(this);
    } else if (opts.zoomAdjust === null) {
      this.options.zoomAdjust = this._zoomAdjust.bind(this);
    }

    if (opts.bounds === 'parent') {
      opts.bounds = parentMap.getBounds();
    }

    if (typeof opts.bounds === 'object') {
      miniMap.fitBounds(opts.bounds, {
        duration: 50
      });
    }

    var bounds = miniMap.getBounds();

    this._convertBoundsToPoints(bounds);
    this._addRectLayers();
    this._update();

    parentMap.on('move', this._updateFn);
    parentMap.on('styledata', this._setStyleFn);
    miniMap.on('mousemove', this._mouseMoveFn);
    miniMap.on('mousedown', this._mouseDownFn);
    miniMap.on('mouseup', this._mouseUpFn);

    this._miniMapCanvas = miniMap.getCanvasContainer();
    this._miniMapCanvas.addEventListener('wheel', this._preventDefault);
    this._miniMapCanvas.addEventListener('mousewheel', this._preventDefault);
  }

  resize() {
    this._miniMap && this._miniMap.resize();
  }

  _mouseDown(e) {
    if (this._isCursorOverFeature) {
      this._isDragging = true;
      this._previousPoint = this._currentPoint;
      this._currentPoint = [e.lngLat.lng, e.lngLat.lat];
    }
    /**
     * @event MiniMapViewModel#minimapmouseuped
     * @description 鹰眼图按下后触发。
     * @property {Object} result - 返回的数据。
     */
    this.fire('minimapmousedown', {
      result: e
    });
  }

  _mouseMove(e) {
    this._ticking = false;

    var miniMap = this._miniMap;
    var features = miniMap.queryRenderedFeatures(e.point, {
      layers: ['trackingRectFill']
    });

    if (!(this._isCursorOverFeature && features.length > 0)) {
      this._isCursorOverFeature = features.length > 0;
      this._miniMapCanvas.style.cursor = this._isCursorOverFeature ? 'move' : '';
    }

    if (this._isDragging) {
      this._previousPoint = this._currentPoint;
      this._currentPoint = [e.lngLat.lng, e.lngLat.lat];

      var offset = [this._previousPoint[0] - this._currentPoint[0], this._previousPoint[1] - this._currentPoint[1]];

      var newBounds = this._moveTrackingRect(offset);

      this._parentMap.fitBounds(newBounds, {
        duration: 80,
        noMoveStart: true
      });
    }
    /**
     * @event MiniMapViewModel#minimapmousemove
     * @description 鹰眼图移动后触发。
     * @property {Object} result - 返回的数据。
     */
    this.fire('minimapmousemoved', {
      result: e
    });
  }

  _mouseUp(e) {
    this._isDragging = false;
    this._ticking = false;
    /**
     * @event MiniMapViewModel#minimapmouseup
     * @description 鹰眼图点击后触发。
     * @property {Object} result - 返回的数据。
     */
    this.fire('minimapmouseup', {
      result: e
    });
  }

  _moveTrackingRect(offset) {
    var source = this._trackingRect;
    var data = source._data;
    var bounds = data.properties.bounds;
    if (bounds) {
      bounds._ne.lat -= offset[1];
      bounds._ne.lng -= offset[0];
      bounds._sw.lat -= offset[1];
      bounds._sw.lng -= offset[0];
      this._convertBoundsToPoints(bounds);
      source.setData(data);
      return bounds;
    }
  }

  _setTrackingRectBounds(bounds) {
    var source = this._trackingRect;
    var data = source._data;

    data.properties.bounds = bounds;
    this._convertBoundsToPoints(bounds);
    source.setData(data);
  }

  _convertBoundsToPoints(bounds) {
    var ne = bounds._ne;
    var sw = bounds._sw;
    var trc = this._trackingRectCoordinates;

    ne = this._handleBounds(ne);
    sw = this._handleBounds(sw);
    trc[0][0][0] = ne.lng;
    trc[0][0][1] = ne.lat;
    trc[0][1][0] = sw.lng;
    trc[0][1][1] = ne.lat;
    trc[0][2][0] = sw.lng;
    trc[0][2][1] = sw.lat;
    trc[0][3][0] = ne.lng;
    trc[0][3][1] = sw.lat;
    trc[0][4][0] = ne.lng;
    trc[0][4][1] = ne.lat;
  }

  _update(e) {
    if (this._isDragging) {
      return;
    }

    var parentBounds = this._parentMap.getBounds();

    this._setTrackingRectBounds(parentBounds);

    if (typeof this.options.zoomAdjust === 'function') {
      this.options.zoomAdjust();
    }
    /**
     * @event MiniMapViewModel#minimapmouseuped
     * @description 鹰眼图更新后触发。
     * @property {Object} result - 返回的数据。
     */
    this.fire('minimapupdated', {
      result: e
    });
  }

  _zoomAdjust() {
    var miniMap = this._miniMap;
    var parentMap = this._parentMap;
    var parentZoom = parseFloat(parentMap.getZoom());
    miniMap.setCenter(parentMap.getCenter());
    let targetZoom = parentZoom - 5 > 0 ? parentZoom - 5 : 1;
    miniMap.setZoom(targetZoom);
  }

  _preventDefault(e) {
    e.preventDefault();
  }

  _handleBounds(latlng) {
    if (latlng.lng > 180) {
      latlng.lng = 180;
    } else if (latlng.lng < -180) {
      latlng.lng = -180;
    }

    if (latlng.lat > 90) {
      latlng.lat = 90;
    } else if (latlng.lat < -90) {
      latlng.lat = -90;
    }
    return latlng;
  }
  _setStyle() {
    this._miniMap.setStyle(this._parentMap.getStyle(), {
      localIdeographFontFamily: this._parentMap._localIdeographFontFamily
    });
    this._miniMap.setCRS(this._parentMap.getCRS());
    this._addRectLayers();
    this._update();
  }
  _addRectLayers() {
    var opts = this.options;
    this._miniMap.addSource('trackingRect', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {
          name: 'trackingRect'
        },
        geometry: {
          type: 'Polygon',
          coordinates: this._trackingRectCoordinates
        }
      }
    });

    this._miniMap.addLayer({
      id: 'trackingRectOutline',
      type: 'line',
      source: 'trackingRect',
      layout: {},
      paint: {
        'line-color': opts.lineColor,
        'line-width': opts.lineWidth,
        'line-opacity': opts.lineOpacity
      }
    });

    this._miniMap.addLayer({
      id: 'trackingRectFill',
      type: 'fill',
      source: 'trackingRect',
      layout: {},
      paint: {
        'fill-color': opts.fillColor,
        'fill-opacity': opts.fillOpacity
      }
    });

    this._trackingRect = this._miniMap.getSource('trackingRect');
  }

  removed() {
    var parentMap = this._parentMap;
    var miniMap = this._miniMap;
    parentMap && parentMap.off('move', this._updateFn);
    parentMap && parentMap.off('styledata', this._setStyleFn);
    miniMap && miniMap.off('mousemove', this._mouseMoveFn);
    miniMap && miniMap.off('mousedown', this._mouseDownFn);
    miniMap && miniMap.off('mouseup', this._mouseUpFn);
    miniMap && miniMap.remove();
  }
}
