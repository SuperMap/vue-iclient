declare module 'vue' {
  // GlobalComponents for Volar
  export interface GlobalComponents {
    WebMap: (typeof import('@supermapgis/mapboxgl/components'))['WebMap']
  }
}

export {}
