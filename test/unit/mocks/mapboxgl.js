var Evented = require('mapbox-gl/src/util/evented');
var LngLat = require('mapbox-gl/src/geo/lng_lat');
var LngLatBounds = require('mapbox-gl/src/geo/lng_lat_bounds');
module.exports.mapboxgl = {
  Map: require('./map'),
  Evented: Evented,
  Popup: require('./popup'),
  Marker: require('./marker'),
  LngLat: LngLat,
  LngLatBounds: LngLatBounds,
  CRS: require('./crs'),
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
