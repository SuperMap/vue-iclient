class SourceModel {
  constructor(options) {
    this.dataSource = options.dataSource;
    this.id = options.id;
    this.title = options.title;
    this.renderSource = options.renderSource;
    this.renderLayers = [];
    this.type = options.type;
    this.themeSetting = options.themeSetting;
    this.visible = options.visible;
  }

  addLayer(layer) {
    if (layer.sourceLayer) {
      const originRenderSource = this.renderSource;
      if (!this.children) {
        this.children = [];
        this.type = 'group';
        this.renderSource = {};
        this.dataSource = {};
        this.themeSetting = {};
        this.visible = true;
      }
      let matchSourceLayer = this.children.find(child => child.id === layer.sourceLayer);
      if (!matchSourceLayer) {
        const sourceLayerItem = {
          id: layer.sourceLayer,
          title: layer.sourceLayer,
          visible: this.visible,
          type: layer.type,
          renderSource: {
            ...originRenderSource,
            sourceLayer: layer.sourceLayer
          },
          renderLayers: [],
          dataSource: {},
          themeSetting: {}
        };
        this.children.push(sourceLayerItem);
        matchSourceLayer = sourceLayerItem;
      }
      matchSourceLayer.renderLayers.push(layer.id);
      return;
    }
    this.renderLayers.push(layer.id);
  }
}

export default SourceModel;
