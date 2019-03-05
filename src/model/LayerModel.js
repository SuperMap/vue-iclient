import WidgetModel from './WidgetModel'
class LayerModel extends WidgetModel{
    constructor(options) {
        super();
        this.id = options.id;
        this.maxzoom = options.maxzoom;
        this.minzoom = options.minzoom;
        this.source = options.source;
        this.type = options.type;
        this.visibility = options.visibility;
    }
}
export default LayerModel;