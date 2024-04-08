import SourceModel from 'vue-iclient/src/mapboxgl/web-map/SourceModel';
import LayerModel from 'vue-iclient/src/mapboxgl/web-map/LayerModel';
import GroupUtil from 'vue-iclient/src/mapboxgl/web-map/GroupUtil';

class SourceListModel extends GroupUtil {
  constructor(options) {
    super();
    this.map = options.map;
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
      if (item && this.excludeSource(item.id)) {
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
    return this.sourceList[sourceName].sourceLayerList[sourceLayer];
  }

  getSourceLayersBySource(sourceName) {
    return this.sourceList[sourceName].sourceLayerList;
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
          const sourceListItem = new SourceModel({
            source: layer.source
          });
          this.sourceList.unshift(sourceListItem);
          this.sourceNames.push(layer.source);
          matchItem = sourceListItem;
        }
        matchItem.addLayer(new LayerModel(layer), layer.sourceLayer);
      });
  }
}
export default SourceListModel;
