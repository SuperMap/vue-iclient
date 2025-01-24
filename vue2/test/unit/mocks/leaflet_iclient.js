import { Events } from 'vue-iclient-core/types/event/Events';
var supermap = {
  cloudTileLayer: () => {
    return { _layerAdd : jest.fn() };
  },
  uniqueThemeLayer: () => {
    return { addFeatures: () => {}, _layerAdd : jest.fn() };
  },
  rangeThemeLayer: () => {
    return { addFeatures: () => {}, _layerAdd : jest.fn() };
  },
  labelThemeLayer: () => {
    return { addFeatures: () => {}, _layerAdd : jest.fn() };
  },
  heatMapLayer: () => {
    return { addFeatures: () => {}, _layerAdd : jest.fn() };
  },
  baiduTileLayer: () => {
    return { _layerAdd : jest.fn() };
  },
  tiledMapLayer: () => {
    return { _layerAdd : jest.fn() };
  },
  dataFlowLayer: () => {
    return {
      on: () => {},
      off: () => {},
      addLayer: () => {},
      getLayerId: () => {},
      _layerAdd : jest.fn()
    };
  },
  tiandituTileLayer: () => {
    return { _layerAdd : jest.fn() };
  },
  themeFeature: class {},
  wmtsLayer: () => { _layerAdd : jest.fn() }
};

var L = require('@mocks/leaflet');
module.exports.SuperMap = require('./supermap');



L.supermap = supermap;
