import { mount, createLocalVue } from '@vue/test-utils';
import SmDataFlowLayer from '../DataFlowLayer.vue';
import SmWebMap from '../../../WebMap.vue';
import '@libs/mapboxgl/mapbox-gl-enhance.js';
import mapEvent from '@types_mapboxgl/map-event';
import CircleStyle from '../../../../_types/CircleStyle';
import LineStyle from '../../../../_types/LineStyle';
import FillStyle from '../../../../_types/FillStyle';
import { message } from 'ant-design-vue';
const localVue = createLocalVue();
localVue.prototype.$message = message;

const layerStyle = { symbol: {}, circle: new CircleStyle(), line: new LineStyle(), fill: new FillStyle() };
const serviceUrl = '/iserver/services/dataflowTest/dataflow';
const layerId = 'dataflowlayer-source';
describe(`DataFlowLayer.vue`, () => {
  let wrapper;
  let mapWrapper;
  beforeEach(() => {
    mapEvent.firstMapTarget = null;
    mapEvent.$options.mapCache = {};
    mapEvent.$options.webMapCache = {};
    mapWrapper = mount(SmWebMap, {
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      }
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    if (wrapper) {
      wrapper.destroy();
    }
    if (mapWrapper) {
      mapWrapper.destroy();
    }
  });

  it('render', done => {
    wrapper = mount(SmDataFlowLayer, {
      localVue,
      propsData: {
        mapTarget: 'map',
        serviceUrl,
        layerId
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          expect(wrapper.vm.serviceUrl).toBe('/iserver/services/dataflowTest/dataflow');
          expect(wrapper.vm.mapTarget).toBe('map');
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('wrapperWebMap-Point', done => {
    const serviceUrl = '/dataflow/Point';
    const registerToken = '123';

    wrapper = mount(SmDataFlowLayer, {
      localVue,
      propsData: {
        mapTarget: 'map',
        serviceUrl,
        layerStyle,
        layerId,
        registerToken: registerToken
      }
    });
    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          expect(wrapper.vm.registerToken).toBe(registerToken);
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('wrapperWebMap-LineString', done => {
    
    const serviceUrl = '/dataflow/LineString';
    wrapper = mount(SmDataFlowLayer, {
      localVue,
      propsData: {
        mapTarget: 'map',
        serviceUrl,
        layerId,
        layerStyle
      }
    });
    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          expect(wrapper.vm.serviceUrl).toBe(serviceUrl);
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });
  it('wrapperWebMap-MultiLineString', done => {
    
    const serviceUrl = '/dataflow/MultiLineString';
    wrapper = mount(SmDataFlowLayer, {
      localVue,
      propsData: {
        mapTarget: 'map',
        serviceUrl,
        layerId,
        layerStyle
      }
    });
    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          expect(wrapper.vm.serviceUrl).toBe(serviceUrl);
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });
  it('wrapperWebMap-Line', done => {
    
    const serviceUrl = '/dataflow/Line';
    wrapper = mount(SmDataFlowLayer, {
      localVue,
      propsData: {
        mapTarget: 'map',
        serviceUrl,
        layerId,
        layerStyle
      }
    });
    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          expect(wrapper.vm.serviceUrl).toBe(serviceUrl);
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });
  it('wrapperWebMap-Polygon', done => {
    
    const serviceUrl = '/dataflow/Polygon';
    wrapper = mount(SmDataFlowLayer, {
      localVue,
      propsData: {
        mapTarget: 'map',
        serviceUrl,
        layerId,
        layerStyle
      }
    });
    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          expect(wrapper.vm.serviceUrl).toBe(serviceUrl);
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });
  it('wrapperWebMap-MultiPolygon', done => {
    
    const serviceUrl = '/dataflow/MultiPolygon';
    wrapper = mount(SmDataFlowLayer, {
      localVue,
      propsData: {
        mapTarget: 'map',
        serviceUrl,
        layerId,
        layerStyle
      }
    });
    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          expect(wrapper.vm.serviceUrl).toBe(serviceUrl);
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });
  it('wrapperWebMap-source', done => {
    
    const serviceUrl = '/dataflow/Point';
    const layerId = 'dataflowlayer-source';
    wrapper = mount(SmDataFlowLayer, {
      localVue,
      propsData: {
        mapTarget: 'map',
        serviceUrl,
        layerStyle,
        layerId
      }
    });
    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          expect(wrapper.vm.layerId).toBe(layerId);
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });
  it('wrapperWebMap-source-has-false', done => {
    
    const serviceUrl = '/dataflow/Point';
    const layerId = 'dataflowlayer-source-has-false';
    wrapper = mount(SmDataFlowLayer, {
      localVue,
      propsData: {
        mapTarget: 'map',
        serviceUrl,
        layerStyle,
        layerId
      }
    });
    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          expect(wrapper.vm.layerId).toBe(layerId);
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('setLayerStyle', done => {
    const serviceUrl = '/dataflow/Point';
    const newStyle = { circle: { color: 'red' }, line: {}, fill: {} };
    wrapper = mount(SmDataFlowLayer, {
      localVue,
      propsData: {
        mapTarget: 'map',
        serviceUrl,
        layerId,
        layerStyle
      }
    });
    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          wrapper.setProps({
            layerStyle: newStyle
          })
          expect(wrapper.vm.layerStyle).toBe(newStyle);
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });
});
