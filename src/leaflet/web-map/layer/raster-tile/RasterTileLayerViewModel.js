import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // TODO css 待抽离
import '../../../../../static/libs/iclient-leaflet/iclient-leaflet-es6';
import '../../../../../static/libs/iclient-leaflet/iclient-leaflet.min.css';

export default class RasterTileLayerViewModel extends L.Evented {
  constructor(map, rasterLayerOptions) {
    super();
    this.map = map;
    const {
      layerId,
      tileSize,
      mapUrl,
      bounds,
      minZoom = 0,
      maxZoom = 22,
      attribution,
      visible = true,
      opacity = 1
    } = rasterLayerOptions;
    this.layerId = layerId;
    this.tileSize = tileSize;
    this.mapUrl = mapUrl;
    this.bounds = bounds;
    this.minZoom = minZoom;
    this.maxZoom = maxZoom;
    this.attribution = attribution;
    this.opacity = opacity;
    this.visibility = visible;
    this.rasterSource = '';
    this._init();
  }
  _init() {
    this._addRestMapLayer();
  }
  _addRestMapLayer() {
    const service = new L.supermap.mapService(this.mapUrl);
    service.getMapInfo(mapObj => {
      if (!this.layerId) {
        this.layerId = mapObj.result.name;
      }
      if (!this.tileSize && mapObj.result.viewer) {
        this.tileSize = mapObj.result.viewer.width;
      }
      this.rasterSource = 'iServer';
      this._addLayer();
    });
  }
  _addLayer() {
    const layer = L.supermap.tiledMapLayer(this.mapUrl, {
      layerId: this.layerId,
      transparent: this.visibility,
      opacity: this.opacity,
      tileSize: this.tileSize || 256,
      serverType: this.rasterSource,
      minZoom: this.minZoom,
      maxZoom: this.maxZoom,
      bounds: this.bounds,
      attribution: this.attribution
    });
    this.map.addLayer(layer);
  }

  clear() {
    const { map, layerId } = this;
    if (map && layerId && map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
  }
}
