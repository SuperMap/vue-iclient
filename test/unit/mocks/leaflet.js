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
  _layers = {}
  whenReady() {}
};

class GeoJSON {
  static coordsToLatLngs() {}
  
  on = jest.fn();
  off = jest.fn();
  _layerAdd = jest.fn();
}

class TileLayer {
  static extend(options) {
    return function() {
      options._layerAdd = jest.fn()
      return options;
    };
  }
  static BingLayer() {}
  _layerAdd = jest.fn()
}

function tileLayer() {
  return new TileLayer();
}
// tileLayer.wms = {jest.fn((url, options) => {
//   return options.layers;
// })};
class WMS {
  _layerAdd = jest.fn()
}
function wms() {
  return new WMS();
}
tileLayer.wms = wms;

module.exports = {
  Map: leafletMap,
  point: () => { _layerAdd : jest.fn()},
  latLng: () => {_layerAdd : jest.fn()},
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
    return {_layerAdd : jest.fn()};
  },
  geoJSON: ()=>{
    return new GeoJSON();
  },
  GeoJSON: GeoJSON,
  polyline: () => {_layerAdd : jest.fn()},
  marker: () => {_layerAdd : jest.fn()},
  circleMarker: jest.fn(),
  circle: jest.fn(),
  icon: () => {_layerAdd : jest.fn()},
  Icon: {Default:class {static mergeOptions=jest.fn()}},
  Popup: () => {},
  Evented: class {},
  svg: jest.fn()
};

