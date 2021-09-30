interface geojsonOptions {
  type?: string;
  // eslint-disable-next-line
  geoJSON?: Array<GeoJSON.Feature<GeoJSON.Geometry>> | GeoJSON.Feature<GeoJSON.Geometry> | GeoJSON.FeatureCollection<GeoJSON.Geometry>,
  maxFeatures?: number;
}
export default class GeoJSONParameter {
  type: string;
  // eslint-disable-next-line
  geoJSON: Array<GeoJSON.Feature<GeoJSON.Geometry>> | GeoJSON.Feature<GeoJSON.Geometry> | GeoJSON.FeatureCollection<GeoJSON.Geometry>
  maxFeatures: number;
  constructor(options: geojsonOptions = {}) {
    this.type = 'geoJSON';
    this.maxFeatures = options.maxFeatures === void 0 ? options.maxFeatures : 20;
    this.geoJSON = options.geoJSON;
  }
}
