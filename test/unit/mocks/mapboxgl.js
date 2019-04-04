
var Evented = require('mapbox-gl/src/util/evented');
module.exports.mapboxgl = {
    Map: require('./map'),
    Evented: Evented,
    Popup:require('./popup')

}
