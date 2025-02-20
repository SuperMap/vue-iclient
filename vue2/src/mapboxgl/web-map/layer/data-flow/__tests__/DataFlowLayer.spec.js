import { mount, config } from '@vue/test-utils';
import SmDataFlowLayer from '../DataFlowLayer.vue';
import CircleStyle from 'vue-iclient-core/controllers/mapboxgl/types/CircleStyle';
import LineStyle from 'vue-iclient-core/controllers/mapboxgl/types/LineStyle';
import FillStyle from 'vue-iclient-core/controllers/mapboxgl/types/FillStyle';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';

describe(`DataFlowLayer.vue`, () => {
  let wrapper;
  let mapWrapper;
  const layerStyle = { symbol: {}, circle: new CircleStyle(), line: new LineStyle(), fill: new FillStyle() };
  const serviceUrl = '/iserver/services/dataflowTest/dataflow';
  const layerId = 'dataflowlayer-1';

  beforeAll(async () => {
    config.mapLoad = false;
    mapWrapper = await createEmptyMap();
  });

  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (wrapper) {
      wrapper.destroy();
    }
  });

  afterAll(() => {
    config.mapLoad = true;
    if (mapWrapper) {
      mapWrapper.destroy();
    }
  });

  it('render', async done => {
    wrapper = mount(SmDataFlowLayer, {
      propsData: {
        mapTarget: 'map',
        serviceUrl,
        layerId
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.serviceUrl).toBe('/iserver/services/dataflowTest/dataflow');
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('wrapperWebMap-Point', async done => {
    const serviceUrl = '/dataflow/Point';
    const registerToken = '123';
    wrapper = mount(SmDataFlowLayer, {
      propsData: {
        mapTarget: 'map',
        serviceUrl,
        layerStyle,
        layerId,
        registerToken: registerToken
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.registerToken).toBe(registerToken);
    done();
  });

  it('wrapperWebMap-LineString', async done => {
    const serviceUrl = '/dataflow/LineString';
    wrapper = mount(SmDataFlowLayer, {
      propsData: {
        mapTarget: 'map',
        serviceUrl,
        layerId,
        layerStyle
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.serviceUrl).toBe(serviceUrl);
    done();
  });

  it('wrapperWebMap-MultiLineString', async done => {
    const serviceUrl = '/dataflow/MultiLineString';
    wrapper = mount(SmDataFlowLayer, {
      propsData: {
        mapTarget: 'map',
        serviceUrl,
        layerId,
        layerStyle
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.serviceUrl).toBe(serviceUrl);
    done();
  });
  it('wrapperWebMap-Line', async done => {
    const serviceUrl = '/dataflow/Line';
    wrapper = mount(SmDataFlowLayer, {
      propsData: {
        mapTarget: 'map',
        serviceUrl,
        layerId,
        layerStyle
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.serviceUrl).toBe(serviceUrl);
    done();
  });

  it('wrapperWebMap-Polygon', async done => {
    const serviceUrl = '/dataflow/Polygon';
    wrapper = mount(SmDataFlowLayer, {
      propsData: {
        mapTarget: 'map',
        serviceUrl,
        layerId,
        layerStyle
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.serviceUrl).toBe(serviceUrl);
    done();
  });

  it('wrapperWebMap-MultiPolygon', async done => {
    const serviceUrl = '/dataflow/MultiPolygon';
    wrapper = mount(SmDataFlowLayer, {
      propsData: {
        mapTarget: 'map',
        serviceUrl,
        layerId,
        layerStyle
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.serviceUrl).toBe(serviceUrl);
    done();
  });

  it('wrapperWebMap-source', async done => {
    const serviceUrl = '/dataflow/Point';
    const layerId = 'dataflowlayer-source';
    wrapper = mount(SmDataFlowLayer, {
      propsData: {
        mapTarget: 'map',
        serviceUrl,
        layerStyle,
        layerId
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.layerId).toBe(layerId);
    done();
  });

  it('wrapperWebMap-source-has-false', async done => {
    const serviceUrl = '/dataflow/Point';
    const layerId = 'dataflowlayer-source-has-false';
    wrapper = mount(SmDataFlowLayer, {
      propsData: {
        mapTarget: 'map',
        serviceUrl,
        layerStyle,
        layerId
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.layerId).toBe(layerId);
    done();
  });

  it('setLayerStyle', async done => {
    const serviceUrl = '/dataflow/Point';
    const newStyle = { circle: { color: 'red' }, line: {}, fill: {} };
    wrapper = mount(SmDataFlowLayer, {
      propsData: {
        mapTarget: 'map',
        serviceUrl,
        layerId,
        layerStyle
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      layerStyle: newStyle
    });
    expect(wrapper.vm.layerStyle).toBe(newStyle);
    done();
  });
});
