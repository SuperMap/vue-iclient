
var Evented = require('mapbox-gl/src/util/evented');
module.exports.mapboxgl = {



    Map: require('./map'),
    Evented: function () {
        // this.map = Map.map;
           return  Map.Evented
    },


    // Evented:new Evented(),



}
