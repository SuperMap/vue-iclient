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
};
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
  TileLayer: class {
    static extend() {
      return class {};
    }
    static BingLayer;
  },
  tileLayer: {},
  layerGroup: () => {
    return {};
  },
  geoJSON: () => {}
};
