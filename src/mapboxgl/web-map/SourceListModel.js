import SourceModel from './SourceModel';
import LayerModel from './LayerModel';

class SourceListModel {
  constructor(options) {
    this.map = options.map;
    this.style = this.map.getStyle();
    this.layers = this.map.getStyle().layers;
    this.overlayLayers = this.map.overlayLayersManager;
    this.detailLayers = null;
    this.sourceList = {};
    this.sourceNames = [];
    this._initLayers();
    this._initSource();
    this.excludeSourceNames = ['tdt-search-', 'tdt-route-', 'smmeasure', 'mapbox-gl-draw'];
  }

  getSourceList() {
    let sourceList = {};
    for (let key in this.sourceList) {
      if (key && this.excludeSource(key)) {
        sourceList[key] = this.sourceList[key];
      }
    }
    return sourceList;
  }

  getSourceNames() {
    const names = [];
    this.sourceNames.forEach(element => {
      if (element && this.excludeSource(element)) {
        names.push(element);
      }
    });
    return names;
  }

  excludeSource(key) {
    for (let i = 0; i < this.excludeSourceNames.length; i++) {
      if (key.indexOf(this.excludeSourceNames[i]) >= 0) {
        return false;
      }
    }
    return true;
  }

  getLegendStyle(sourceName) {
    if (sourceName) {
      return this.sourceList[sourceName] ? this.sourceList[sourceName].style : '';
    }
    const sourceList = Object.values(this.sourceList) || [];
    const styles = sourceList.filter(item => !!item.style);
    return styles;
  }

  getLayers() {
    return this.detailLayers;
  }

  getLayersBySourceLayer(sourceName, sourceLayer) {
    return this.sourceList[sourceName]['sourceLayerList'][sourceLayer];
  }

  getSourceLayersBySource(sourceName) {
    return this.sourceList[sourceName]['sourceLayerList'];
  }

  addSourceStyle(sourceName, sourceStyle) {
    if (this.sourceList[sourceName]) {
      this.sourceList[sourceName]['style'] = sourceStyle;
    }
  }

  _initLayers() {
    this.layers &&
      (this.detailLayers = this.layers.map(layer => {
        return this.map.getLayer(layer.id);
      }));
    const overLayerList = Object.values(this.overlayLayers);
    overLayerList.forEach(overlayer => {
      if (overlayer.id) {
        this.detailLayers.push({
          id: overlayer.id,
          visibility: overlayer.visibility ? 'visible' : 'none',
          source: overlayer.id
        });
      }
    });
  }

  _initSource() {
    this.detailLayers &&
      this.detailLayers.forEach(layer => {
        if (!this.sourceList[layer['source']]) {
          const source = this.map.getSource(layer['source']);
          this.sourceList[layer['source']] = new SourceModel({
            source: layer['source'],
            type: source && source.type
          });
          this.sourceNames.push(layer['source']);
        }
        this.sourceList[layer['source']].addLayer(new LayerModel(layer), layer['sourceLayer']);
      });
  }
}
export default SourceListModel;
