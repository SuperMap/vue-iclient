var supermap = {
  cloudTileLayer: () => {
    return {};
  },
  uniqueThemeLayer: () => {
    return { addFeatures: () => {} };
  },
  rangeThemeLayer: () => {
    return { addFeatures: () => {} };
  },
  labelThemeLayer: () => {
    return { addFeatures: () => {} };
  },
  heatMapLayer: () => {
    return { addFeatures: () => {} };
  },
  baiduTileLayer: () => {
    return {};
  },
  tiledMapLayer: () => {
    return {};
  },
  themeFeature: class {}
};
var L = require('@mocks/leaflet');
module.exports.SuperMap = require('./supermap');

L.supermap = supermap;
