import type { Map, MapboxOptions } from 'mapbox-gl';
import mapboxgl from 'mapbox-gl';

type MapData = {
  mapOptions?: Partial<MapboxOptions>;
};

export default class ResetViewModel extends mapboxgl.Evented {
  map: Map | null = null;
  mapOptions: MapData['mapOptions'] | null = null;

  setMap({ webmap, map }: { webmap?: MapData & { mapData?: MapData }; map: Map }) {
    this.map = map;
    // Vue 2 uses mapData captured when the map loads, not the mutable mapOptions props.
    this.mapOptions = webmap?.mapData?.mapOptions || null;
  }

  resetView(duration = 1000) {
    if (this.map) {
      const { center, zoom, bearing, pitch } = this.mapOptions || {};
      this.map.flyTo({ center, zoom, bearing, pitch, duration });
    }
  }

  removed() {
    this.map = null;
    this.mapOptions = null;
  }
}
