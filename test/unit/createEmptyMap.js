import { mount } from '@vue/test-utils';
import SmWebMap from '../../src/mapboxgl/web-map/WebMap.vue';
const mapInfo = {
  extent: {
    leftBottom: { x: 0, y: 0 },
    rightTop: { x: 0, y: 0 }
  },
  level: 5,
  center: { x: 0, y: 0 },
  baseLayer: {
    layerType: 'TILE',
    name: 'China',
    url: 'http://test'
  },
  layers: [],
  description: '',
  projection: 'EPSG:3857',
  title: 'testMap',
  version: '1.0'
};

export default function createEmptyMap() {
  const wrapper = mount(SmWebMap, {
    propsData: {
      mapId: mapInfo
    },
  });
  wrapper.vm.viewModel.map.fire('load');
  return wrapper;
}

