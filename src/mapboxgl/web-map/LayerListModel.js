import GroupUtil from 'vue-iclient/src/mapboxgl/web-map/GroupUtil';
import LayerModel from 'vue-iclient/src/mapboxgl/web-map/LayerModel';

class LayerListModel extends GroupUtil {
  constructor(options) {
    super();
    this.map = options.map;
    this.layerCatalog = options.layerCatalog;
  }

  getLayerCatalog() {
    if(!this.layerCatalog) return;
    const baseLayer = this.map.getStyle().layers[0];
    const baseLayerCatalog = {
      id: baseLayer.id,
      title: baseLayer.id,
      type: 'basic',
      layer: baseLayer,
      visible: true
    };
    this.addInfoToCatalog(this.layerCatalog);
    return [baseLayerCatalog].concat(this.layerCatalog);
  }

  addInfoToCatalog(layerCatalog) {
    layerCatalog.forEach(catalog => {
      if(catalog.children) {
        this.addInfoToCatalog(catalog.children);
      }
      // 获取layer
      if(catalog.type === 'basic') {
        const detailLayer = this.map.getLayer(catalog.id);
        catalog.layer = new LayerModel(detailLayer);
      }
    });
  }
}
export default LayerListModel;
