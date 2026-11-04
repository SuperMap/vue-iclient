import type mapboxgl from 'mapbox-gl'

declare module 'mapbox-gl' {
  interface LngLatBounds extends mapboxgl.LngLatBounds {
    _sw: mapboxgl.LngLat;
    _ne: mapboxgl.LngLat;
  }

  interface Map extends mapboxgl.Map {
    style: mapboxgl.Style & {
      _layers: Record<string, any>
    }

    getCRS(): CRS
  }

  interface GeoJSONSource extends mapboxgl.GeoJSONSource {
    _data: GeoJSON.FeatureCollection<GeoJSON.Geometry>
    getData: () => GeoJSON.FeatureCollection<GeoJSON.Geometry>
  }

  interface MapboxOptions {
    crs?: string
  }
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
