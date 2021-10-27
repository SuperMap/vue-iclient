// @web-map

var Evented = require('mapbox-gl/src/util/evented');

class CRS extends Evented {
    constructor(options) {
        super();
    }
}
CRS.get = (baseProjection) => {
    // 处理 WebMapViewModel 的 !mapboxgl.CRS.get(this.baseProjection)
    if (baseProjection === 'EPSG:4326') {
        return ''
    };
    return {getExtent:function(){return [-20037508.3427892, -20037508.3427892, 20037508.3427892, 20037508.3427892]},unit:'m'};
};
CRS.set = () => jest.fn();
module.exports = CRS;
