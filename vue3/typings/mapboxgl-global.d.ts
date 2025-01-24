declare module 'vue' {
  // GlobalComponents for Volar
  export interface GlobalComponents {
    WebMap: (typeof import('@supermapgis/vue-iclient-mapboxgl'))['WebMap']
  }
}

export {}
