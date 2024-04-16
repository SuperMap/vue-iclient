import SourceModel from 'vue-iclient/src/mapboxgl/web-map/SourceModel';
import LayerModel from 'vue-iclient/src/mapboxgl/web-map/LayerModel';

class SourceListModel {
  constructor(options) {
    this.map = options.map;
    this.mapInfo = options.mapInfo;
    this.style = this.map.getStyle();
    this.layers = this.map.getStyle().layers;
    this.overlayLayers = this.map.overlayLayersManager;
    this.detailLayers = null;
    this.sourceList = [];
    this.sourceNames = [];
    this._initLayers();
    this._initSource();
    this.excludeSourceNames = ['tdt-search-', 'tdt-route-', 'smmeasure', 'mapbox-gl-draw'];
  }

  getSourceList() {
    let sourceList = [];
    for (let item of this.sourceList) {
      if (item.id && this.excludeSource(item.id)) {
        sourceList.push(item);
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

  getLayers() {
    return this.detailLayers;
  }

  addSourceStyle(sourceName, sourceStyle) {
    if (this.sourceList[sourceName]) {
      this.sourceList[sourceName].style = sourceStyle;
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
        let matchItem = this.sourceList.find(item => item.id === layer.source);
        if (!matchItem) {
          const layerInfo = this.mapInfo?.layers.find(layerItem => layer.id === layerItem.layerID) || {};
          const {
            dataSource = {}, themeSetting = {}
          } = layerInfo;
          const source = this.map.getSource(layer.source);
          const sourceListItem = new SourceModel({
            dataSource,
            source: layer.source,
            type: layer.type,
            renderSource: {
              id: layer.source,
              type: source && source.type,
              sourceLayer: layer['source-layer']
            },
            themeSetting
          });
          this.sourceList.unshift(sourceListItem);
          this.sourceNames.push(layer.source);
          matchItem = sourceListItem;
        }
        matchItem.addLayer(new LayerModel(layer), layer['source-layer']);
      });
  }
}
export default SourceListModel;