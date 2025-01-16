import { mount } from '@vue/test-utils';
import SmWebMap from '../../../WebMap';
import SmPan from '../Pan.vue';
import Pan from '../index';
import mockFetch from 'vue-iclient/test/unit/mocks/FetchRequest';
import iportal_serviceProxy from 'vue-iclient/test/unit/mocks/data/iportal_serviceProxy.json';
import uniqueLayer_point from 'vue-iclient/test/unit/mocks/data/WebMap/uniqueLayer_point.json';
import layerData from 'vue-iclient/test/unit/mocks/data/layerData.json';
import mapWrapperLoaded from 'vue-iclient/test/unit/mapWrapperLoaded.js';
import flushPromises from 'flush-promises';
import mapLoaded from 'vue-iclient/test/unit/mapLoaded.js';

describe('Pan.vue', () => {
  let wrapper;
  let mapWrapper;
  beforeEach(() => {
    wrapper = null;
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_point,
      'https://fakeiportal.supermap.io/iportal/web/datas/676516522/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123':
        layerData
    };
    mockFetch(fetchResource);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (wrapper) {
      wrapper.destroy();
    }
    if (mapWrapper) {
      mapWrapper.destroy();
    }
  });

  it('default', async done => {
    mapWrapper = mount(SmWebMap, {
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      }
    });
    wrapper = mount(SmPan, {
      propsData: {
        mapTarget: 'map'
      }
    });
    const callback = jest.fn();
    wrapper.vm.$on('loaded', callback);
    await mapWrapperLoaded(mapWrapper);
    await flushPromises();
    expect(wrapper.vm.mapTarget).toBe('map');
    testClick(wrapper, wrapper.vm.map);
    done();
  });

  it('default index', async done => {
    mapWrapper = mount(SmWebMap, {
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      }
    });
    wrapper = mount(Pan, {
      propsData: {
        mapTarget: 'map'
      }
    });
    const callback = jest.fn();
    wrapper.vm.$on('loaded', callback);
    await mapWrapperLoaded(mapWrapper);
    await flushPromises();
    expect(wrapper.vm.mapTarget).toBe('map');
    testClick(wrapper, wrapper.vm.map);
    done();
  });

  /**
   * 测试平移组件包裹在map里面
   */

  // isControl
  it('isControl SmWebMap', async done => {
    wrapper = mount({
      template: `<div><sm-web-map  server-url="https://fakeiportal.supermap.io/iportal"  :map-id="123"   
            ><sm-pan></sm-pan></sm-web-map></div>`,
      components: {
        SmPan,
        SmWebMap
      }
    });
    const callback = jest.fn();
    wrapper.vm.$children[0].$children[0].$on('loaded', callback);
    await mapLoaded(wrapper.vm.$children[0]);
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    expect(wrapper.vm.$children[0].$children[0].getTargetName()).toBe('map');
    testClick(wrapper, wrapper.vm.$children[0].$children[0].map);
    done();
  });

  /**
   * 测试平移组件与map同级
   */
  it('parallel single SmWebMap', async done => {
    wrapper = mount({
      template: `<div><sm-web-map  server-url="https://fakeiportal.supermap.io/iportal" :map-id="123" >
            </sm-web-map><sm-pan></sm-pan></div>`,
      components: {
        SmPan,
        SmWebMap
      }
    });
    const callback = jest.fn();
    wrapper.vm.$children[1].$on('loaded', callback);
    await mapLoaded(wrapper.vm.$children[0]);
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    expect(wrapper.vm.$children[1].getTargetName()).toBe('map');
    testClick(wrapper, wrapper.vm.$children[1].map);
    done();
  });

  /**
   * 测试平移组件与多个map同级，默认pan的mapTarget是第一个map
   */
  it('parallel multi SmWebMap', async done => {
    wrapper = mount({
      template: `<div><sm-web-map  server-url="https://fakeiportal.supermap.io/iportal"    :map-id="123"  target="map1">
            </sm-web-map>
            <sm-web-map  server-url="https://fakeiportal.supermap.io/iportal"   :map-id="123"  target="map2">
            </sm-web-map>
            <sm-pan></sm-pan>
            <sm-web-map  server-url="https://fakeiportal.supermap.io/iportal"   :map-id="123"   target="map3">
            </sm-web-map>
            <sm-web-map  server-url="https://fakeiportal.supermap.io/iportal"   :map-id="123"   target="map4">
            </sm-web-map></div>`,
      components: {
        SmPan,
        SmWebMap
      }
    });
    const callback = jest.fn();
    wrapper.vm.$children[2].$on('loaded', callback);
    await mapLoaded(wrapper.vm.$children[0]);
    await mapLoaded(wrapper.vm.$children[1]);
    await mapLoaded(wrapper.vm.$children[3]);
    await mapLoaded(wrapper.vm.$children[4]);
    await flushPromises();
    expect(callback.mock.called).toBeTruthy;
    expect(wrapper.vm.$children[2].getTargetName()).toBe('map1');
    testClick(wrapper, wrapper.vm.$children[2].map);
    done();
  });

  /**
   *
   * @param {*} wrapper
   * @param {*} map Pan绑定的Map组件的map对象
   */
  function testClick(wrapper, map) {
    var panLength = 200;
    let spyPanTo = jest.spyOn(map, 'panTo');
    let spyPanby = jest.spyOn(map, 'panBy');
    wrapper.find('.is-left').trigger('click');
    // 验证点击之后 pan绑定的map组件的map会发生相应变化，即会平移
    expect(spyPanby).toBeCalledWith([-panLength, 0]);
    wrapper.find('.is-right').trigger('click');
    expect(spyPanby).toBeCalledWith([panLength, 0]);
    wrapper.find('.is-top').trigger('click');
    expect(spyPanby).toBeCalledWith([0, -panLength]);
    wrapper.find('.is-bottom').trigger('click');
    expect(spyPanby).toBeCalledWith([0, panLength]);
    wrapper.find('.sm-component-pan__center').trigger('click');
    expect(spyPanTo).toBeCalledWith({ lng: 0, lat: 0 });
  }
});
