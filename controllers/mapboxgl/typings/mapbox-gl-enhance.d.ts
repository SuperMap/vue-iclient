import mapboxgl = require('mapbox-gl')

declare module 'mapbox-gl' {
  interface LngLatBounds {
    _sw: mapboxgl.LngLat;
    _ne: mapboxgl.LngLat;
  }

  interface Map {
    style: mapboxgl.Style & {
      _layers: Record<string, any>
    }

    getCRS(): CRS
  }

  interface GeoJSONSource {
    _data: GeoJSON.FeatureCollection<GeoJSON.Geometry>
    getData: () => GeoJSON.FeatureCollection<GeoJSON.Geometry>
  }

  interface MapboxOptions {
    crs?: string
  }

  // iClient MapboxGL 运行时会把 SuperMap API 挂载到该命名空间下。
  export const supermap: Record<string, any>

  export class CRS {
    constructor(
      name: string,
      wkt: string | undefined,
      crsExtent: number[],
      crsUnit: string | undefined
    )
    static get: (epsgCode: string) => InstanceType<typeof CRS>
    static set: (crs: CRS) => void
    unit: string
    getOrigin: () => number[]
    getExtent: () => number[]
    getWKT: () => string | undefined
  }
}


export = mapboxgl
export as namespace mapboxgl
