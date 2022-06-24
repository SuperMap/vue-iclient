import { mount, config } from '@vue/test-utils';
import SmIdentify from '../Identify.vue';
import Identify from '../index';
import SmWebMap from '../../../WebMap.vue';
import mapLoaded from 'vue-iclient/test/unit/mapLoaded.js';

describe('Identify.vue', () => {
  let wrapper;
  let identifyWrapper;
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

  beforeEach(() => {
    config.mapLoad = false;
    wrapper = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    config.mapLoad = true;
    if (wrapper) {
      wrapper.destroy();
    }
  });

  it('render default correctly', async done => {
    wrapper = mount({
      template: `
      <sm-web-map style="height:700px" :mapId="mapInfo">
        <sm-identify :layers="['民航数据']" :autoResize="autoResize" :fields="['机场','同比增速%','2017旅客吞吐量（人次）']"></sm-identify>
      </sm-web-map> `,
      components: {
        SmIdentify,
        SmWebMap
      },
      data() {
        return {
          mapInfo: mapInfo,
          autoResize: false
        };
      }
    });
    const callback = jest.fn();
    identifyWrapper = wrapper.vm.$children[0].$children[0];
    identifyWrapper.$on('loaded', callback);
    await mapLoaded(wrapper.vm.$children[0]);
    expect(callback.mock.called).toBeTruthy;
    expect(wrapper.find('.sm-component-identify').exists()).toBe(true);
    identifyWrapper.getWidthStyle;
    expect(identifyWrapper.keyMaxWidth).toBe(110);
    expect(identifyWrapper.valueMaxWidth).toBe(170);
    done();
  });

  it('clcik map', async done => {
    wrapper = mount({
      template: `
      <sm-web-map style="height:700px" :mapId="mapInfo">
        <sm-identify :layers="['China']" :fields="['机场','同比增速%','2017旅客吞吐量（人次）']"></sm-identify>
      </sm-web-map> `,
      components: {
        SmIdentify,
        SmWebMap
      },
      data() {
        return {
          mapInfo: mapInfo
        };
      }
    });
    const callback = jest.fn();
    identifyWrapper = wrapper.vm.$children[0].$children[0];
    identifyWrapper.$on('loaded', callback);
    await mapLoaded(wrapper.vm.$children[0]);
    expect(callback.mock.called).toBeTruthy;
    const spy = jest.spyOn(identifyWrapper.viewModel, 'removed');
    const e = {
      target: '',
      point: {
        x: 10,
        y: 10
      }
    };
    identifyWrapper.map.fire('click', e);
    await wrapper.setProps({
      layers: ['民航数据']
    });
    expect(spy).toHaveBeenCalledTimes(1);
    done();
  });

  it('grab', async done => {
    wrapper = mount({
      template: `
      <sm-web-map style="height:700px" :mapId="mapInfo">
        <sm-identify :layers="['China']" :fields="['机场','同比增速%','2017旅客吞吐量（人次）']"></sm-identify>
      </sm-web-map> `,
      components: {
        SmIdentify,
        SmWebMap
      },
      data() {
        return {
          mapInfo: mapInfo
        };
      }
    });
    const callback = jest.fn();
    identifyWrapper = wrapper.vm.$children[0].$children[0];
    identifyWrapper.$on('loaded', callback);
    await mapLoaded(wrapper.vm.$children[0]);
    expect(callback.mock.called).toBeTruthy;
    const spy = jest.spyOn(identifyWrapper.map, 'getCanvas');
    identifyWrapper.getWidthStyle;
    identifyWrapper.layerStyle;
    identifyWrapper.changeCursorGrab();
    identifyWrapper.changeCursorPointer();
    expect(spy).toHaveBeenCalledTimes(4);
    done();
  });

  it('render index correctly', () => {
    wrapper = mount(Identify);
  });
});
