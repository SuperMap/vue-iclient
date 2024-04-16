class SourceModel {
  constructor(options) {
    this.dataSource = options.dataSource;
    this.id = options.source;
    this.title = options.source;
    this.renderSource = options.renderSource;
    this.renderLayers = [];
    this.type = options.type;
    this.themeSetting = options.themeSetting;
  }

  addLayer(layer, sourceLayer) {
    if (sourceLayer) {
      if(!this.children) {
        this.children = [];
      }
      let matchSourceLayer = this.children.find(child => child.id === sourceLayer);
      if (!matchSourceLayer) {
        const sourceLayerItem = ({
          dataSource: {},
          id: sourceLayer,
          title: sourceLayer,
          visible: layer.visibility === 'visible',
          type: layer.type,
          renderSource: {
            id: layer.source,
            type: layer.type === 'geojson' ? 'geojson' : (layer.type === 'raster' ? 'raster' : 'vector'),
            sourceLayer: layer.sourceLayer
          },
          renderLayers: [],
          themeSetting: {}
        });
        this.children.push(sourceLayerItem);
        matchSourceLayer = sourceLayerItem;
      }
      matchSourceLayer.renderLayers.push(layer.id);
      this.type = 'group';
    }
    this.renderLayers.push(layer.id);
    if (layer.visibility === 'visible' || this.visible) {
      this.visible = true;
    } else {
      this.visible = false;
    }
  }
}

export default SourceModel;
