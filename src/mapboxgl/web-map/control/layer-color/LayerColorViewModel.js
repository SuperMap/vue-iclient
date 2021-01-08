import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';
import SourceListModel from '../../SourceListModel';

class LayerColorViewModel extends mapboxgl.Evented {
  constructor() {
    super();
    this.sourceList = {};
    this.sourceNames = [];
    this.recordResetLayerColor = {};
    this.selectLayerFn = this._selectLayerFn.bind(this);
  }

  _updateLayers() {
    this.fire('layersUpdated');
  }
  setMap(mapInfo) {
    const { map } = mapInfo;
    this.map = map;
    this.updateFn = this._updateLayers.bind(this);
    this.map.on('styledata', this.updateFn);
  }

  initLayerList() {
    this.sourceListModel = new SourceListModel({
      map: this.map
    });
    this.sourceList = this.sourceListModel.getSourceList();
    this.sourceNames = this.sourceListModel.getSourceNames().reverse();
    return this.sourceList;
  }
  getSourceNames() {
    return this.sourceNames;
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
    let pos = [e.point.x, e.point.y];
    const featuresInfo = this.map.queryRenderedFeatures(pos);
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

  removed() {
    this.sourceList = {};
    this.sourceNames = [];
    this.map.off('styledata', this.updateFn);
  }
}
export default LayerColorViewModel;
