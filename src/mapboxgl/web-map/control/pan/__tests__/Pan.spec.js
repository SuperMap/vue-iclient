import {
  mount,
  createLocalVue
} from '@vue/test-utils';
import SmWebMap from '../../../WebMap';
import SmPan from '../Pan.vue';
import Pan from '../index';
import mapEvent from '@types_mapboxgl/map-event';

import {
  Icon,
  Card,
  Collapse,
  Button
} from 'ant-design-vue';

const localVue = createLocalVue();
localVue.use(Card);
localVue.use(Collapse);
localVue.use(Icon);
localVue.use(Button);

describe('Pan.vue', () => {
  let wrapper;
  beforeEach(() => {
    mapEvent.firstMapTarget = null;
    mapEvent.$options.mapCache = {};
    mapEvent.$options.webMapCache = {};
    wrapper = null;

  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (wrapper) {
      wrapper.destroy();
    }
  });

  it('default', (done) => {
  let mapWrapper = mount(SmWebMap, {
      localVue,
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
    wrapper.vm.$on('loaded', () => {
      try {
        expect(wrapper.vm.mapTarget).toBe('map');
        testClick(wrapper, wrapper.vm.map);
        mapWrapper.destroy();
        done();
      } catch (exception) {
        console.log('Pan_default' + exception.name + ':' + exception.message);
        expect(false).toBeTruthy();
        mapWrapper.destroy();
        done();
      }
    })
  });

  it('default index', (done) => {
    let mapWrapper = mount(SmWebMap, {
        localVue,
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
      wrapper.vm.$on('loaded', () => {
        try {
          expect(wrapper.vm.mapTarget).toBe('map');
          testClick(wrapper, wrapper.vm.map);
          mapWrapper.destroy();
          done();
        } catch (exception) {
          console.log('Pan_default' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          mapWrapper.destroy();
          done();
        }
      })
    });
  
  /**
   * 测试平移组件包裹在map里面
   */

  // isControl
  it('isControl SmWebMap', done => {
    wrapper = mount({
      template: `<div><sm-web-map  server-url="https://fakeiportal.supermap.io/iportal"  :map-id="123"   
            ><sm-pan></sm-pan></sm-web-map></div>`,
      components: {
        SmPan,
        SmWebMap
      }
    });
    wrapper.vm.$children[0].$children[0].$on('loaded', () => {
      expect(wrapper.vm.$children[0].$children[0].getTargetName()).toBe('map');
      testClick(wrapper, wrapper.vm.$children[0].$children[0].map);
      done();
    });
  });

  /**
   * 测试平移组件与map同级
   */
  it('parallel single SmWebMap', done => {
    wrapper = mount({
      template: `<div><sm-web-map  server-url="https://fakeiportal.supermap.io/iportal" :map-id="123" >
            </sm-web-map><sm-pan></sm-pan></div>`,
      components: {
        SmPan,
        SmWebMap
      }
    });
    wrapper.vm.$children[1].$on('loaded', () => {
      // expect\(wrapper\.element\)\.toMatchSnapshot\(\);
      expect(wrapper.vm.$children[1].getTargetName()).toBe('map');
      testClick(wrapper, wrapper.vm.$children[1].map);
      done();
    });
  });

  /**
   * 测试平移组件与多个map同级，默认pan的mapTarget是第一个map
   */
  it('parallel multi SmWebMap', done => {
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
    wrapper.vm.$children[2].$on('loaded', () => {
      expect(wrapper.vm.$children[2].getTargetName()).toBe('map1');
      testClick(wrapper, wrapper.vm.$children[2].map);
      done();
    });
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
    expect(spyPanTo).toBeCalledWith({
      lat: 36.98401835599687,
      lng: 104.34202150000002
    });
  }
});