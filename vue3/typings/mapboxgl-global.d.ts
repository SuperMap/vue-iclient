/// <reference types="../../controllers/mapboxgl/typings/mapbox-gl-enhance.d.ts" />

declare module 'vue' {
  // GlobalComponents for Volar
  export interface GlobalComponents {
    SmConfigProvider: (typeof import('@supermapgis/common/components/index.common'))['SmConfigProvider']
    SmWebMap: (typeof import('@supermapgis/mapboxgl/components'))['SmWebMap']
    SmAttributes: (typeof import('@supermapgis/mapboxgl/components'))['SmAttributes']
  }
}

export {}
