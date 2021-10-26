// @web-map

var Evented = require('mapbox-gl/src/util/evented');

class CRS extends Evented {
    constructor(options) {
        super();
    }
}
CRS.get = () => {
    return {getExtent:function(){return [-20037508.3427892, -20037508.3427892, 20037508.3427892, 20037508.3427892]},unit:'m'};
};
module.exports = CRS;
