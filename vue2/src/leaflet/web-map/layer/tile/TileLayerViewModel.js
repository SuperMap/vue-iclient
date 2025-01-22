import L from 'leaflet';
import 'vue-iclient-static/libs/iclient-leaflet/iclient-leaflet.min';
import { capitalizeFirstLetter } from 'vue-iclient/src/leaflet/_utils/props-binder';

export default class RasterTileLayerViewModel extends L.Evented {
  constructor(options) {
    super();
    this.defaultOptions = {
      minZoom: 0,
      maxZoom: 22,
      opacity: 1,
      tileSize: 256
    };
    for (let key in options) {
      const setMethodName = 'set' + capitalizeFirstLetter(key);
      this[setMethodName] = function(newVal) {
        if (this.layer) {
          this.layer._paramsChanged = true;
          if (key === 'url') {
            this.layer.setUrl(newVal);
          } else if (key === 'bounds') {
            this.layer.options[key] = this._setBounds(newVal);
          } else {
            this.layer.options[key] = newVal;
            this.layer.redraw();
          }
        }
      };
    }

    Object.assign(this.defaultOptions, options);
    this.defaultOptions.bounds && (this.defaultOptions.bounds = this._setBounds(this.defaultOptions.bounds));
    this._init();
  }

  _setBounds(bounds) {
    return L.latLngBounds(
      L.latLng(bounds[1], bounds[0]),
      L.latLng(bounds[3], bounds[2])
    );
  }

  _init() {
    this._addLayer();
  }

  _addLayer() {
    this.layer = L.supermap.tiledMapLayer(this.defaultOptions.url, this.defaultOptions);
  }

  getLayer() {
    return this.layer;
  }

  addTo(map) {
    this.map = map;
    this.map.addLayer(this.layer);
  }

  clear() {
    const { map, layer } = this;
    if (map && layer && map.hasLayer(this.layer)) {
      map.removeLayer(layer);
    }
  }
}
