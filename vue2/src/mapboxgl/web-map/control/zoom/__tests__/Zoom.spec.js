import { mount, config } from '@vue/test-utils';
import SmZoom from '../Zoom.vue';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';
import mockFetch from 'vue-iclient/test/unit/mocks/FetchRequest';
import iportal_serviceProxy from 'vue-iclient/test/unit/mocks/data/iportal_serviceProxy';
import uniqueLayer_point from 'vue-iclient/test/unit/mocks/data/WebMap/uniqueLayer_point';
import layerData from 'vue-iclient/test/unit/mocks/data/layerData';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';

describe('Zoom.vue', () => {
  let mapWrapper;
  let wrapper;

  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    jest.resetAllMocks();
    if (mapWrapper) {
      mapWrapper.destroy();
    }
    if (wrapper) {
      wrapper.destroy();
    }
  });

  it('default', async done => {
    config.mapLoad = false;
    mapWrapper = await createEmptyMap();
    config.mapLoad = true;
    wrapper = mount(SmZoom, {
      propsData: {
        showZoom: true,
        position: 'top-left',
        showZoomSlider: true
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.showZoom).toBe(true);
    expect(wrapper.vm.position).toBe('top-left');
    expect(wrapper.vm.showZoomSlider).toBe(true);
    expect(wrapper.find('.sm-component-zoom').exists()).toBe(true);
    done();
  });

  it('zoomIn', async done => {
    config.mapLoad = false;
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_point,
      'https://fakeiportal.supermap.io/iportal/web/datas/676516522/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123': layerData
    };
    mockFetch(fetchResource);
    mapWrapper = await createEmptyMap({
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      }
    });
    wrapper = mount(SmZoom, {
      propsData: {
        showZoom: true,
        position: 'top-left',
        showZoomSlider: true
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.showZoom).toBe(true);
    expect(wrapper.vm.position).toBe('top-left');
    expect(wrapper.vm.showZoomSlider).toBe(true);
    expect(wrapper.vm.map.zoom).toBe(4);
    let spyZoomIn = jest.spyOn(wrapper.vm.map, 'zoomIn');
    wrapper.find('i.sm-components-icon-plus').trigger('click');
    expect(spyZoomIn).toBeCalled();
    expect(wrapper.vm.map.zoom).toBe(5);
    done();
  });

  it('zoomOut', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_point,
      'https://fakeiportal.supermap.io/iportal/web/datas/676516522/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123': layerData
    };
    mockFetch(fetchResource);
    mapWrapper = await createEmptyMap({
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      }
    });
    wrapper = mount(SmZoom, {
      propsData: {
        showZoom: true,
        position: 'top-left',
        showZoomSlider: true
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.showZoom).toBe(true);
    expect(wrapper.vm.position).toBe('top-left');
    expect(wrapper.vm.showZoomSlider).toBe(true);
    expect(wrapper.vm.map.zoom).toBe(4);
    let spyZoomOut = jest.spyOn(wrapper.vm.map, 'zoomOut');
    wrapper.find('i.sm-components-icon-minus').trigger('click');
    expect(spyZoomOut).toBeCalled();
    expect(wrapper.vm.map.zoom).toBe(3);
    done();
  });

  it('zoomSlider', async done => {
    config.mapLoad = false;
    mapWrapper = await createEmptyMap();
    config.mapLoad = true;
    wrapper = mount(SmZoom, {
      propsData: {
        showZoom: true,
        position: 'top-left',
        showZoomSlider: true
      }
    });
    const slider = jest.spyOn(wrapper.vm, 'setZoom');
    expect(wrapper.find('.sm-component-slider-handle').exists()).toBe(true);
    wrapper.vm.sliderChange();
    expect(slider).toBeCalled();
    wrapper.find('i.sm-components-icon-minus').trigger('click');
    done();
  });
});
