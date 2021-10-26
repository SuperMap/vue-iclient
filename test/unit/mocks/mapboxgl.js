var Evented = require('mapbox-gl/src/util/evented');
var LngLat = require('mapbox-gl/src/geo/lng_lat');

module.exports.mapboxgl = {
  Map: require('./map'),
  Evented: Evented,
  Popup: require('./popup'),
  Marker: require('./marker'),
  LngLat: LngLat,
  CRS: {
    get: get => {
      return {getExtent:function(){return [-20037508.3427892, -20037508.3427892, 20037508.3427892, 20037508.3427892]},unit:'m'};
    }
  },
  MercatorCoordinate: {
    fromLngLat(lngLatLike, altitude) {
      return {
        x: 0,
        y: 0,
        z: 0,
        meterInMercatorCoordinateUnits() {
      
        }
      }
    },
    
  }
};
