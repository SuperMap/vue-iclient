import mapboxgl from '@libs/mapboxgl/mapbox-gl-enhance';

/**
 * @class WidgetViewModel
 * @description widget viewModel 基类。
 */
export default class WidgetViewModel extends mapboxgl.Evented {
    constructor(map) {
        super();
        this.map = map;
    }
}