import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';

interface MapEventCallBack {
  (e: mapboxglTypes.MapMouseEvent): void;
}

class LayerColorViewModel extends mapboxgl.Evented {
  map: mapboxglTypes.Map;
  fire: any;
  recordResetLayerColor: Object;
  selectLayerFn: MapEventCallBack;
  constructor() {
    super();
    this.recordResetLayerColor = {};
    this.selectLayerFn = this._selectLayerFn.bind(this);
  }

  setMap(mapInfo) {
    const { map } = mapInfo;
    this.map = map;
  }

  setLayerColor(layerId, property, color) {
    if (!layerId || !property || !this.map) {
      return;
    }
    if (color === '') {
      color = 'rgba(0,0,0,0)';
    }
    this._recordStartColor(layerId, property);
    this.map.setPaintProperty(layerId, property, color);
  }

  getLayerColor(layerId, property) {
    if (!layerId || !property || !this.map) {
      return;
    }
    return this.map.getPaintProperty(layerId, property);
  }

  resetAllColor() {
    let layerIds = Object.keys(this.recordResetLayerColor);
    for (let layerId of layerIds) {
      let properties = this.recordResetLayerColor[layerId];
      Object.keys(properties).forEach((propertyName) => {
        this.map.setPaintProperty(layerId, propertyName, properties[propertyName]);
      });
    }
    this.recordResetLayerColor = {};
  }

  _recordStartColor(layerId, property) {
    let color = this.getLayerColor(layerId, property);
    if (!this.recordResetLayerColor[layerId]) {
      this.recordResetLayerColor[layerId] = {};
    }
    if (this.recordResetLayerColor[layerId][property]) {
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

  startSelectLayer() {
    this.map.on('click', this.selectLayerFn);
  }

  endSelectLayer() {
    this.map.off('click', this.selectLayerFn);
  }
}
export default LayerColorViewModel;
