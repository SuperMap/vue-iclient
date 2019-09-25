import mapboxgl from '../../../../../static/libs/mapboxgl/mapbox-gl-enhance';
import '../../../../../static/libs/iclient-mapboxgl/iclient10-mapboxgl.min';

export default class RasterTileLayerViewModel extends mapboxgl.Evented {
  constructor(map, rasterLayerOptions) {
    super();
    this.map = map;
    const {
      layerId,
      tileSize,
      mapUrl,
      tiles,
      bounds,
      minZoom = 0,
      maxZoom = 22,
      attribution,
      scheme = 'xyz',
      visible = true,
      opacity = 1,
      before
    } = rasterLayerOptions;
    this.layerId = layerId;
    this.tileSize = tileSize;
    this.mapUrl = mapUrl;
    this.tiles = tiles;
    this.bounds = bounds;
    this.minZoom = minZoom;
    this.maxZoom = maxZoom;
    this.attribution = attribution;
    this.scheme = scheme;
    this.opacity = opacity;
    this.visibility = visible ? 'visible' : 'none';
    this.before = before;
    // enhance扩展，传iserver标识是iserver rest map
    this.rasterSource = '';
    this._init();
  }
  _init() {
    if (this.mapUrl) {
      this._addRestMapLayer();
    } else {
      this._addLayer();
    }
  }
  _addRestMapLayer() {
    const service = new mapboxgl.supermap.MapService(this.mapUrl);
    service.getMapInfo(mapObj => {
      if (!this.layerId) {
        this.layerId = mapObj.name;
      }
      if (!this.tileSize && mapObj.viewer) {
        this.tileSize = mapObj.viewer.width;
      }
      const bounds = mapObj.bounds;
      if (!this.bounds && bounds) {
        this.bounds = [bounds.left, bounds.bottom, bounds.right, bounds.top];
      }
      this.rasterSource = 'iserver';
      this.tiles = [this.mapUrl];
      this._addLayer(mapObj);
    });
  }
  _addLayer() {
    this.map.addLayer(
      {
        id: this.layerId || `raster-layer-${new Date().getTime()}`,
        type: 'raster',
        layout: {
          visibility: this.visibility
        },
        paint: {
          'raster-opacity': this.opacity
        },
        source: {
          bounds: this.bounds || [-180, -85.051129, 180, 85.051129],
          type: 'raster',
          tileSize: this.tileSize || 256,
          tiles: this.tiles,
          rasterSource: this.rasterSource,
          minzoom: this.minZoom,
          maxzoom: this.maxZoom,
          scheme: this.scheme
        }
      },
      this.before
    );
  }
}
