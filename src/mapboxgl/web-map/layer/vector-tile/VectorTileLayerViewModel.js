import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';
import '../../../../../static/libs/iclient-mapboxgl/iclient-mapboxgl.min';

export default class VectorTileLayerViewModel extends mapboxgl.Evented {
  constructor(styleOptions, before) {
    super();
    this.styleOptions = styleOptions;
    this.before = before;
  }

  setMap(mapInfo) {
    const { map } = mapInfo;
    this.map = map;
    this._init();
  }

  setStyleOptions(styleOptions) {
    this.styleOptions = styleOptions;
    this._init();
  }

  _init() {
    if (this.map.addStyle) {
      this.map.addStyle(this.styleOptions, this.before);
    }
  }
}
