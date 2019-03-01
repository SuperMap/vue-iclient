import WidgetModel from './WidgetModel'
class LayerModel extends WidgetModel{
    constructor(options) {
        super();
        this.filter = options.filter;
        this.id = options.id;
        this.layout = options.layout;
        this.maxzoom = options.maxzoom;
        this.minzoom = options.minzoom;
        this.metadata = options.metadata;
        this.paint = options.paint;
        this.source = options.source;
        this.sourceLayer = options.sourceLayer;
        this.type = options.type;
        this.visibility = options.visibility;
    }
}
export default LayerModel;