import { mount } from '@vue/test-utils';
import SmWebMap from '../../src/mapboxgl/web-map/WebMap.vue';
import flushPromises from 'flush-promises';
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

export default async function createEmptyMap(options = { mapId: mapInfo }) {
  jest.useFakeTimers();
  const wrapper = mount(SmWebMap, options);
  await wrapper.vm.$nextTick();
  await flushPromises();
  jest.advanceTimersByTime(120);
  wrapper.vm.viewModel.map.fire('load');
  jest.useRealTimers();
  return wrapper;
}
