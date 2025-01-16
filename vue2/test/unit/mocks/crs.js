// @web-map

var Evented = require('mapbox-gl/src/util/evented');

class CRS extends Evented {
  constructor(options = {}) {
    super();
    this.unit='m';
    this.epsgCode = options.epsgCode;
  }
  
  getExtent() {
    return [-20037508.3427892, -20037508.3427892, 20037508.3427892, 20037508.3427892];
  }
  getOrigin() { return jest.fn()}
  getLngLatCenter() { return [0,0];}
}
CRS.get = baseProjection => {
  return {
    getExtent: function () {
      return [-20037508.3427892, -20037508.3427892, 20037508.3427892, 20037508.3427892];
    },
    unit: 'm',
    getOrigin: () => jest.fn()
  };
};
CRS.set = () => jest.fn();
module.exports = CRS;
