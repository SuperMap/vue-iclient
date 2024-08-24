const leafletMap = class {
  zoom = 0;
  static include() {}
  getZoom() {
    return this.zoom;
  }
  setZoom(z) {
    this.zoom = z;
  }
  setMinZoom() {}
  addLayer() {}
  invalidateSize() {}
  remove() {}
};

class GeoJSON {
  static coordsToLatLngs() {}
  
  on = jest.fn();
  off = jest.fn();
}

class TileLayer {
  static extend(options) {
    return function() {
      return options;
    };
  }
  static BingLayer() {}
}

function tileLayer() {
  return new TileLayer();
}
tileLayer.wms = jest.fn((url, options) => {
  return options.layers;
});

module.exports = {
  Map: leafletMap,
  point: () => {},
  latLng: () => {},
  map: () => {
    return new leafletMap();
  },
  bounds: () => {},
  supermap: {
    tiledMapLayer: jest.fn()
  },
  CRS: {
    Baidu: {
      unproject() {
        return [];
      }
    },
    TianDiTu_Mercator: {
      unproject() {
        return [];
      }
    }
  },
  crs: class {
    unproject() {
      return [];
    }
  },
  Proj: {
    CRS: () => {
      return {
        unproject() {
          return [];
        }
      };
    }
  },
  TileLayer,
  tileLayer,
  layerGroup: () => {
    return {};
  },
  geoJSON: jest.fn(),
  GeoJSON: GeoJSON,
  polyline: () => {},
  marker: () => {},
  circleMarker: jest.fn(),
  icon: () => {},
  Popup: () => {},
  Evented: class {},
  svg: jest.fn()
};

