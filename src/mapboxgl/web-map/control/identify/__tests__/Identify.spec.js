import { mount, config } from '@vue/test-utils';
import SmIdentify from '../Identify.vue';
import Identify from '../index';
import SmWebMap from '../../../WebMap.vue';
import mapLoaded from 'vue-iclient/test/unit/mapLoaded.js';
import { LineStyle, CircleStyle, FillStyle } from '../../../../_types/index';
import mapboxgl from '@libs/mapboxgl/mapbox-gl-enhance.js';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded';


describe('Identify.vue', () => {
  let wrapper;
  let identifyWrapper;
  let mapWrapper;
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
    if (mapWrapper) {
      mapWrapper.destroy();
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
    const spyPopup = jest.spyOn(mapboxgl, 'Popup');
    spyPopup.mockReturnValue({
      setLngLat: jest.fn().mockReturnValue({
        setDOMContent: jest.fn().mockReturnValue({
          addTo: jest.fn().mockReturnValue({
            remove: jest.fn(),
            off: jest.fn(),
            on: jest.fn()
          })
        })
      })
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

  it('clcik layer on map', async done => {
    // 设置外界传入的参数，对面填充和边框的颜色
    const color = '#FF0000';
    wrapper = mount({
      template: `
        <sm-web-map style="height:700px" :mapId="mapInfo">
          <sm-identify 
            :fields="['地区','人口数']"
            :layerStyle="layerStyles"
            :layers="['第七次人口普查全国各省人口数(未包含港澳台','第七次人口普查全国各省人口数(未包含港澳台-strokeLine']">
          </sm-identify>
        </sm-web-map> `,
      //  `<sm-web-map style="height:700px" :mapId="mapInfo">
      //     <sm-identify :layers="['China']" :fields="['机场','同比增速%','2017旅客吞吐量（人次）']"></sm-identify>
      //   </sm-web-map>`,
      components: {
        SmIdentify,
        SmWebMap
      },
      data() {
        return {
          mapInfo: {
            extent: {
              leftBottom: { x: 0, y: 0 },
              rightTop: { x: 0, y: 0 }
            },
            level: 5,
            center: { x: 0, y: 0 },
            baseLayer: {
              mapId: 1160955209,
              layerType: 'TILE',
              name: 'China',
              url: 'http://172.16.14.44:8190/iportal'
            },
            layers: [],
            description: '',
            projection: 'EPSG:3857',
            title: 'testMap',
            version: '1.0'
          },
          layerStyles: {
            line: new LineStyle({ 'line-width': 3, 'line-color': '#3fb1e3' }),
            circle: new CircleStyle({ 'circle-color': '#3fb1e3', 'circle-radius': 6 }),
            fill: new FillStyle({ 'fill-color': '#3fb1e3', 'fill-opacity': 0.8 }),
            stokeLine: new LineStyle({ 'line-width': 3, 'line-color': color })
          }
        };
      }
    });
    const callback = jest.fn();
    identifyWrapper = wrapper.vm.$children[0].$children[0];
    identifyWrapper.$on('loaded', callback);
    await mapLoaded(wrapper.vm.$children[0]);
    identifyWrapper.setViewModel();
    const spy = jest.spyOn(identifyWrapper.viewModel, 'addOverlayToMap');
    // 手动设置点击事件的参数，确认是再点击面
    const layer = {
      id: '第七次人口普查全国各省人口数(未包含港澳台',
      type: 'fill',
      source: '第七次人口普查全国各省人口数(未包含港澳台',
      minzoom: 0,
      maxzoom: 22,
      layout: {},
      paint: {
        'fill-color': { r: 0.5098039215686274, g: 0.42745098039215684, b: 0.7294117647058823, a: 1 },
        'fill-opacity': 0.9
      }
    };
    // 设置过了条件，点击的行政区域
    const filter = '["all",["==","地区","青海"]]';

    //
    identifyWrapper.viewModel.addOverlayToMap(layer, filter);

    // 确保修改图层的函数被执行
    expect(spy).toHaveBeenCalledTimes(1);

    // 判断图层颜色是否被修改
    expect(identifyWrapper.viewModel.layerStyle.stokeLine.paint['line-color']).toBe(color);

    done();
  });

  it('clcik layer not on map', async done => {
    wrapper = mount({
      template: `<sm-web-map style="height:700px" :mapId="mapInfo">
          <sm-identify :layers="['test']"></sm-identify>
        </sm-web-map>`,
      components: {
        SmIdentify,
        SmWebMap
      },
      data() {
        return {
          mapInfo: {
            extent: {
              leftBottom: { x: 0, y: 0 },
              rightTop: { x: 0, y: 0 }
            },
            level: 5,
            center: { x: 0, y: 0 },
            baseLayer: {
              mapId: 1160955209,
              layerType: 'TILE',
              name: 'China',
              url: 'http://172.16.14.44:8190/iportal'
            },
            layers: [],
            description: '',
            projection: 'EPSG:3857',
            title: 'testMap',
            version: '1.0'
          }
        };
      }
    });
    const callback = jest.fn();
    identifyWrapper = wrapper.vm.$children[0].$children[0];
    identifyWrapper.$on('loaded', callback);
    await mapLoaded(wrapper.vm.$children[0]);
    identifyWrapper.bindQueryRenderedFeatures(
      {
        target: {
          getLayer: jest.fn(),
          queryRenderedFeatures: (a, b) => {
            expect(b.layers.length).toBe(0);
            done();
          }
        },
        point: { x: 0, y: 0 }
      },
      ['test']
    );
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

  it('render index correctly', done => {
    wrapper = mount(Identify);
    done();
  });

  it('changeLayers', async done => {
    mapWrapper = await createEmptyMap();
    wrapper = mount(SmIdentify, {
      propsData: {
        multiSelect: true,
        layers: ['民航数据'],
        fields: ['机场'],
        autoResize: false
      }
    });
    await mapSubComponentLoaded(wrapper);
    wrapper.vm.keydownCtrlCb({ ctrlKey: true });
    expect(wrapper.vm.isKeydownCtrl).toBe(true);
    wrapper.vm.map.queryRenderedFeatures = () => {
      return [
        {
          _vectorTileFeature: { _keys: ['机场', 'id'] },
          layer: { id: '民航数据' },
          properties: {
            id: 1,
            机场: '天府机场'
          }
        }
      ];
    };
    wrapper.vm.map.fire('click', {
      target: {
        getLayer: jest.fn()
      },
      point: {
        x: 10,
        y: 10
      }
    });
    wrapper.setProps({layers: ['民航数据']})
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.popupProps).toEqual({
      机场: {
        slotName: undefined,
        value: '天府机场'
      }
    });
    expect(wrapper.vm.currentLayer.id).toEqual('民航数据');
    expect(wrapper.vm.filters.length).toBe(2);
    expect(wrapper.vm.currentIndex).toBe(0);

    wrapper.setProps({layers: ['']})
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.currentLayer).toBe(null);
    expect(wrapper.vm.filters.length).toBe(1);
    expect(wrapper.vm.currentIndex).toBe(0);
    done();
  });

  it('multiSelect', async done => {
    mapWrapper = await createEmptyMap();
    wrapper = mount(SmIdentify, {
      propsData: {
        multiSelect: true,
        layers: ['民航数据'],
        fields: ['机场'],
        autoResize: false
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.find('.sm-component-identify').exists()).toBe(true);
    wrapper.vm.keydownCtrlCb({ ctrlKey: true });
    expect(wrapper.vm.isKeydownCtrl).toBe(true);
    wrapper.vm.map.queryRenderedFeatures = () => {
      return [
        {
          _vectorTileFeature: { _keys: ['机场', 'id'] },
          layer: { id: '民航数据' },
          properties: {
            id: 1,
            机场: '天府机场'
          }
        }
      ];
    };
    wrapper.vm.map.fire('click', {
      target: {
        getLayer: jest.fn()
      },
      point: {
        x: 10,
        y: 10
      }
    });
    expect(wrapper.vm.popupProps).toEqual({
      机场: {
        slotName: undefined,
        value: '天府机场'
      }
    });
    expect(wrapper.vm.currentLayer.id).toEqual('民航数据');
    expect(wrapper.vm.filters.length).toBe(2);
    expect(wrapper.vm.currentIndex).toBe(0);

    wrapper.vm.map.queryRenderedFeatures = () => {
      return [
        {
          _vectorTileFeature: { _keys: ['机场', 'id'] },
          layer: { id: '民航数据' },
          properties: {
            id: 2,
            机场: '大连机场'
          }
        }
      ];
    };
    wrapper.vm.map.fire('click', {
      target: {
        getLayer: jest.fn()
      },
      point: {
        x: 11,
        y: 12
      }
    });

    expect(wrapper.vm.popupProps).toEqual({
      机场: {
        slotName: undefined,
        value: '大连机场'
      }
    });
    expect(wrapper.vm.currentLayer.id).toEqual('民航数据');
    expect(wrapper.vm.filters.length).toBe(3);
    expect(wrapper.vm.currentIndex).toBe(1);

    wrapper.vm.keyupCtrlCb({ key: 'Control' });
    expect(wrapper.vm.isKeydownCtrl).toBe(false);
    expect(wrapper.vm.popupProps).toEqual({ 机场: { slotName: undefined, value: '大连机场' } });

    wrapper.vm.map.queryRenderedFeatures = () => {
      return [];
    };
    wrapper.vm.map.fire('click', {
      target: {
        getLayer: jest.fn()
      },
      point: {
        x: 11,
        y: 12
      }
    });
    expect(wrapper.vm.filters.length).toBe(1);

    expect(wrapper.vm.valueMaxWidth).toBe(170);
    done();
  });
});
