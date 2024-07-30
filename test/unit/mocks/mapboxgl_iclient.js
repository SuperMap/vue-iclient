var supermap = require('./supermap_mapboxgl');
var mapboxgl = require('@mocks/mapboxgl').mapboxgl;
module.exports.SuperMap = require('./supermap');
var WebMapV3 = require('./mapboxgl_iclient_webmapv3');

mapboxgl.supermap = {
  ...supermap,
  WebMapV3
};
