
var Evented = require('mapbox-gl/src/util/evented');
var LngLat = require('mapbox-gl/src/geo/lng_lat');
module.exports.mapboxgl = {
    Map: require('./map'),
    Evented: Evented,
    Popup: require('./popup'),
    LngLat: LngLat
}
