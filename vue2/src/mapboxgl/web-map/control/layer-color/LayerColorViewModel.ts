import mapboxgl from '@libs/mapboxgl/mapbox-gl-enhance';

interface MapEventCallBack {
  (e: mapboxglTypes.MapMouseEvent): void;
}
const L7_STYLE_COLOR = {
  'text-halo-color': ['stroke']
};

class LayerColorViewModel extends mapboxgl.Evented {
  map: mapboxglTypes.Map;
  fire: any;
  _cacheColors: Object;
  recordResetLayerColor: Object;
  selectLayerFn: MapEventCallBack;
  constructor() {
    super();
    this.recordResetLayerColor = {};
    this._cacheColors = {};
    this.selectLayerFn = this._selectLayerFn.bind(this);
  }

  setMap(mapInfo) {
    const { map } = mapInfo;
    this.map = map;
  }

  getLayerType(layerId) {
    const layer = this.map.getLayer(layerId);
    return layer?.type;
  }

  setL7LayerColor(layer, property, color) {
    if (L7_STYLE_COLOR[property]) {
      const style = {};
      L7_STYLE_COLOR[property].forEach(property => {
        style[property] = color;
      });
      // @ts-ignore
      layer.l7layer.style(style);
    } else {
      // @ts-ignore
      layer.l7layer.color(color);
    }
    layer.reRender();
  }

  setLayerColor(layerId, property, color) {
    if (!layerId || !property || !this.map) {
      return;
    }
    if (color === '') {
      color = 'rgba(0,0,0,0)';
    }
    this._recordStartColor(layerId, property);
    const layer = this.map.getLayer(layerId);
    // @ts-ignore
    if (layer && layer.l7layer) {
      this.setL7LayerColor(layer, property, color);
      this._cacheColors[layerId] = { ...(this._cacheColors[layerId] || {}), [property]: color };
      return;
    }

    this.map.setPaintProperty(layerId, property, color);
  }

  getLayerColor(layerId, property) {
    if ((!layerId && !property) || !this.map) {
      return;
    }
    if (this._cacheColors[layerId] && this._cacheColors[layerId][property]) {
      return this._cacheColors[layerId][property];
    }

    return this.map.getPaintProperty(layerId, property);
  }

  resetAllColor() {
    let layerIds = Object.keys(this.recordResetLayerColor);
    for (let layerId of layerIds) {
      const layer = this.map.getLayer(layerId);
      let properties = this.recordResetLayerColor[layerId];
      Object.keys(properties).forEach((propertyName) => {
        // @ts-ignore
        if (layer && layer.l7layer) {
          this.setL7LayerColor(layer, propertyName, properties[propertyName]);
        } else {
          this.map.setPaintProperty(layerId, propertyName, properties[propertyName]);
        }
      });
    }
    this.recordResetLayerColor = {};
    this._cacheColors = {};
  }

  _recordStartColor(layerId, property) {
    let color = this.getLayerColor(layerId, property);
    if (!this.recordResetLayerColor[layerId]) {
      this.recordResetLayerColor[layerId] = {};
    }
    if (Object.prototype.hasOwnProperty.call(this.recordResetLayerColor[layerId], property)) {
      return;
    }
    this.recordResetLayerColor[layerId][property] = color;
  }

  _selectLayerFn(e) {
    const featuresInfo = this.map.queryRenderedFeatures([e.point.x, e.point.y]);
    if (featuresInfo && featuresInfo.length) {
      this.fire('changeSelectLayer', featuresInfo[0]);
    }
  }

  _changeCursor(cursorType = '') {
    if (this.map && this.map.getCanvas()) {
      this.map.getCanvas().style.cursor = cursorType;
    }
  }

  startSelectLayer() {
    this.map.on('click', this.selectLayerFn);
    this._changeCursor('pointer');
  }

  endSelectLayer() {
    this.map.off('click', this.selectLayerFn);
    this._changeCursor();
  }

  removed() {
    this.resetAllColor();
  }
}
export default LayerColorViewModel;
