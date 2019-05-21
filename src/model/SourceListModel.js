import WidgetModel from './WidgetModel';
import SourceModel from './SourceModel';
import LayerModel from './LayerModel';
class SourceListModel extends WidgetModel {
  constructor(options) {
    super();
    this.map = options.map;
    this.style = this.map.getStyle();
    this.layers = this.map.getStyle().layers;
    this.overlayLayers = this.map.overlayLayersManager;
    this.detailLayers = null;
    this.sourceList = {};
    this._initLayers();
    this._initSource();
  }

  getSourceList() {
    return this.sourceList;
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
          this.sourceList[layer['source']] = new SourceModel({
            source: layer['source']
          });
        }
        this.sourceList[layer['source']].addLayer(new LayerModel(layer), layer['sourceLayer']);
      });
  }
}
export default SourceListModel;
