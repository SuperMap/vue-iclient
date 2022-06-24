// @flow

var Evented = require('mapbox-gl/src/util/evented');
const LngLat = require('mapbox-gl/src/geo/lng_lat');

class Marker extends Evented {


    constructor(options) {
        super();
        this.text = '';
    }

    addTo(map) {
    }

    remove() {
        this.fire('close');

        return this;
    }

    setLngLat(lnglat) {
        this._lngLat = LngLat.convert(lnglat);
        // this._pos = null;
        // this._update();
        return this;
    }

    setPopup(popup) {
        return this;
    }
}


module.exports = Marker;
