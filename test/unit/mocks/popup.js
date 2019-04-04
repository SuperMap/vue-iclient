// @flow

var Evented = require('mapbox-gl/src/util/evented');
const LngLat = require('mapbox-gl/src/geo/lng_lat');

class Popup extends Evented {


    constructor(options) {
        super();
        this.text = '';
    }

    /**
     * Adds the popup to a map.
     *
     * @param {Map} map The Mapbox GL JS map to add the popup to.
     * @returns {Popup} `this`
     */
    addTo(map) {
        // this._map = map;
        // this._map.on('move', this._update);
        // if (this.options.closeOnClick) {
        //     this._map.on('click', this._onClickClose);
        // }
        // this._update();
        // return this;
    }

    /**
     * @returns {boolean} `true` if the popup is open, `false` if it is closed.
     */
    isOpen() {
        // return !!this._map;
    }


    remove() {
        this.fire('close');

        return this;
    }


    /**
     * Sets the geographical location of the popup's anchor, and moves the popup to it.
     *
     * @param lnglat The geographical location to set as the popup's anchor.
     * @returns {Popup} `this`
     */
    setLngLat(lnglat) {
        this._lngLat = LngLat.convert(lnglat);
        // this._pos = null;
        // this._update();
        return this;
    }

    setText(text) {
        // return this.setDOMContent(window.document.createTextNode(text));
        this.text = text;
        console.log("from popup: " + this.text)
    }

}


module.exports = Popup;
