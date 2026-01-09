import { vi } from 'vitest';
import CRS from './crs';

const mapboxgl = {
  Map: class Map {
    on(event, callback) {
      if (event === 'loaded') {
        Promise.resolve(callback());
        return;
      }
      callback();
    }
    setCenter() {}
    setCRS() {}
    getCRS() {}
    setLayoutProperty() {}
    off() {}
    remove() {}
    getZoom() {
      return 0;
    }
    setZoom() {}
    setPitch() {}
    resize() {}
    fire() {}
  },
  Evented: class Evented {
    listenerList = {};
    on(type, listener) {
      if (!this.listenerList[type]) {
        this.listenerList[type] = [];
      }
      this.listenerList[type].push(listener);
    }
    fire(event, properties) {
      if (typeof event === 'string') {
        event = { type: event, properties: properties || {} };
      }
      if (this.listenerList[event.type] && this.listenerList[event.type].length > 0) {
        for (const listener of this.listenerList[event.type]) {
          listener.call(this, event.properties);
        }
      }
    }
    off(type, listener) {
      if (this.listenerList && this.listenerList[type]) {
        const index = this.listenerList[type].indexOf(listener);
        if (index !== -1) {
          this.listenerList[type].splice(index, 1);
        }
      }
    }
  },
  Popup: class Popup {
    on() {}
    off() {}
    setLngLat() {
      return {
        setDOMContent() {
          return {
            addTo() {}
          };
        }
      };
    }
    remove() {}
  },
  LngLat: vi.fn(),
  LngLatBounds: class LngLatBounds {
    static convert() {
      return {};
    }
    constructor() {
      this._sw = { lng: 10, lat: 10 };
      this._ne = { lng: 10, lat: 10 };
    }
  },
  VectorTileSource: class {},
  CRS
};

export default mapboxgl;
