class SourceModel {
  constructor(options) {
    this.id = options.source;
    this.title = options.source;
    this.children = [];
    this.sourceType = options.sourceType;
    this.type = options.type;
  }

  addLayer(layer) {
    this.children.push({
      id: layer.id,
      title: layer.id,
      visible: layer.visibility === 'visible',
      type: 'basic',
      layer: layer
    });
    this.type = this.children?.length > 1 ? 'group' : 'basic';
    this.layer = this.type === 'basic' ? layer : undefined;
    if (layer.visibility === 'visible' || this.visible) {
      this.visible = true;
    } else {
      this.visible = false;
    }
  }
}

export default SourceModel;
