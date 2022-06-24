import { mount, createLocalVue, config } from '@vue/test-utils';
import SmDrillMap from '../DrillMap.vue';
import SmWebMap from 'vue-iclient/src/mapboxgl/web-map/WebMap.vue';
import mapboxgl from '@libs/mapboxgl/mapbox-gl-enhance.js';
import { Button } from 'ant-design-vue';
import mockFetch from 'vue-iclient/test/unit/mocks/FetchRequest';
import iportal_serviceProxy from 'vue-iclient/test/unit/mocks/data/iportal_serviceProxy.json';
import mapInfo from 'vue-iclient/test/unit/mocks/data/DrillMap/mapInfo.json';
import provinceInfo from 'vue-iclient/test/unit/mocks/data/DrillMap/provinceInfo.json';
import cityInfo from 'vue-iclient/test/unit/mocks/data/DrillMap/cityInfo.json';
import countyInfo from 'vue-iclient/test/unit/mocks/data/DrillMap/countyInfo.json';
import flushPromises from 'flush-promises';
import mapWrapperLoaded from 'vue-iclient/test/unit/mapWrapperLoaded.js';

const localVue = createLocalVue();
localVue.use(Button);

const getDrillingMapData = function (mapIds = [244114284, 244114284, 244114284]) {
  return [
    {
      layerId: '云贵川',
      serverUrl: 'https://fakeiportal.supermap.io/iportal',
      mapId: mapIds[0],
      foreignField: '行政区划_c'
    },
    {
      layerId: '云贵川市',
      serverUrl: 'https://fakeiportal.supermap.io/iportal',
      mapId: mapIds[1],
      primaryField: 'FIRST_行政',
      foreignField: '行政区划_c'
    },
    {
      layerId: '云贵川区县',
      serverUrl: 'https://fakeiportal.supermap.io/iportal',
      mapId: mapIds[2],
      linkField: ['行政区划_c', '行政区划_1'],
      primaryField: '行政区划_1'
    }
  ];
};

describe('DrillMap.vue', () => {
  let wrapper;
  const spy = jest.spyOn(mapboxgl, 'Map');

  beforeAll(() => {
    config.mapLoad = false;
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
  });

  it('initial_same_map', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/244114284/map.json': mapInfo,
      'https://fakeiportal.supermap.io/iportal/web/datas/719613442/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': provinceInfo,
      'https://fakeiportal.supermap.io/iportal/web/datas/1687422166/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': cityInfo,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': countyInfo
    };
    mockFetch(fetchResource);
    wrapper = mount(SmDrillMap, {
      localVue,
      propsData: {
        data: getDrillingMapData(),
        target: 'map1'
      }
    });
    await flushPromises();
    await mapWrapperLoaded(wrapper.find(SmWebMap));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.mapProps.target).toBe('map1');
    expect(wrapper.vm.mapProps.serverUrl).toEqual('https://fakeiportal.supermap.io/iportal');
    done();
  });

  it('initial_Control', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/244114284/map.json': mapInfo,
      'https://fakeiportal.supermap.io/iportal/web/datas/719613442/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': provinceInfo,
      'https://fakeiportal.supermap.io/iportal/web/datas/1687422166/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': cityInfo,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': countyInfo
    };
    mockFetch(fetchResource);
    wrapper = mount(SmDrillMap, {
      localVue,
      stubs: ['SmPan', 'SmScale', 'SmZoom'],
      propsData: {
        data: getDrillingMapData(),
        panControl: {
          show: true,
          position: 'top-left'
        },
        scaleControl: {
          show: true,
          position: 'bottom-right'
        },
        zoomControl: {
          show: true,
          position: 'top-left',
          showZoomSlider: false
        }
      }
    });
    await flushPromises();
    await mapWrapperLoaded(wrapper.find(SmWebMap));
    expect(spy).toHaveBeenCalledTimes(1);
    const map = wrapper.find('#map');
    expect(map.element.id).toEqual('map');
    expect(wrapper.vm.panControl.show).toBe(true);
    expect(wrapper.vm.scaleControl.position).toBe('bottom-right');
    expect(wrapper.vm.zoomControl.showZoomSlider).toBe(false);
    expect(wrapper.find('.sm-component-pan').exists()).toBe(false);
    expect(map.element.outerHTML).toContain('pan');
    expect(map.element.outerHTML).toContain('zoom');
    expect(map.element.outerHTML).toContain('scale');
    done();
  });

  it('initial_diffrent_map', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/1653065660/map.json': mapInfo,
      'https://fakeiportal.supermap.io/iportal/web/maps/891303728/map.json': mapInfo, //  其他
      'https://fakeiportal.supermap.io/iportal/web/maps/366831804/map.json': mapInfo, //  其他
      'https://fakeiportal.supermap.io/iportal/web/datas/719613442/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': provinceInfo,
      'https://fakeiportal.supermap.io/iportal/web/datas/1687422166/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': cityInfo,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': countyInfo
    };
    mockFetch(fetchResource);
    wrapper = mount(SmDrillMap, {
      localVue,
      propsData: {
        data: getDrillingMapData([1653065660, 891303728, 366831804])
      }
    });
    await flushPromises();
    await mapWrapperLoaded(wrapper.find(SmWebMap));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.mapProps.serverUrl).toEqual('https://fakeiportal.supermap.io/iportal');
    const layers = wrapper.vm.mapProps.mapId.layers;
    const layerIDs = layers.map(item => item.name);
    expect(layers.length).toEqual(3);
    expect(layerIDs).toContain('云贵川');
    expect(layerIDs).toContain('云贵川市');
    expect(layerIDs).toContain('云贵川区县');
    done();
  });

  it('drill_next_map', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/244114284/map.json': mapInfo,
      'https://fakeiportal.supermap.io/iportal/web/datas/719613442/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': provinceInfo,
      'https://fakeiportal.supermap.io/iportal/web/datas/1687422166/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': cityInfo,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': countyInfo
    };
    mockFetch(fetchResource);
    wrapper = mount(SmDrillMap, {
      localVue,
      propsData: {
        data: getDrillingMapData()
      }
    });
    await flushPromises();
    wrapper.find(SmWebMap).vm.$on('load', callback);
    await mapWrapperLoaded(wrapper.find(SmWebMap));
    function callback(e) {
      expect(spy).toHaveBeenCalledTimes(1);
      const map = e.map;
      const spy1 = jest.spyOn(map, 'queryRenderedFeatures');
      spy1.mockReturnValue([
        {
          type: 'feature',
          properties: {
            Shape_Area: 45.7573378841,
            Shape_Leng: 67.3938464236,
            UserID: 0,
            行政区划_c: '四川省',
            index: 1
          },
          geometry: {
            type: 'MultiPolygon',
            coordinates: [
              [
                [
                  [116.452409755349, 40.92656164358],
                  [116.483357386004, 40.9069469918439],

                  [116.442423257771, 40.9417511118507],
                  [116.452409755349, 40.92656164358]
                ]
              ],
              [
                [
                  [116.560117987415, 40.9749988417875],

                  [116.547892153981, 40.9705907375336],
                  [116.552270926448, 40.980672910927],
                  [116.560117987415, 40.9749988417875]
                ]
              ]
            ]
          }
        }
      ]);
      const spy2 = jest.spyOn(wrapper.vm.viewModel, 'getBboxByFeature');
      spy2.mockReturnValue([]);
      expect(wrapper.vm.mapProps.target).toBe('map');
      expect(wrapper.vm.mapProps.serverUrl).toEqual('https://fakeiportal.supermap.io/iportal');
      wrapper.vm.viewModel.drillNextMap({
        target: map,
        point: {
          x: 478,
          y: 490
        }
      });
      const currentIndex = wrapper.vm.currentIndex;
      const data = wrapper.vm.data[currentIndex];
      const layer = map.getLayer(data.layerId);
      expect(currentIndex).toEqual(1);
      expect(layer.layout.visibility).toBe('visible');
      done();
    }
  });

  it('go_back', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/244114284/map.json': mapInfo,
      'https://fakeiportal.supermap.io/iportal/web/datas/719613442/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': provinceInfo,
      'https://fakeiportal.supermap.io/iportal/web/datas/1687422166/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': cityInfo,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': countyInfo
    };
    mockFetch(fetchResource);
    wrapper = mount(SmDrillMap, {
      localVue,
      propsData: {
        data: getDrillingMapData()
      },
      scopedSlots: {
        goBack: `<a-button id="go-back" @click="props.goBack">返回</a-button>`
      }
    });
    await flushPromises();
    wrapper.find(SmWebMap).vm.$on('load', callback);
    await mapWrapperLoaded(wrapper.find(SmWebMap));
    function callback(e) {
      expect(spy).toHaveBeenCalledTimes(1);
      const map = e.map;
      const spy1 = jest.spyOn(map, 'queryRenderedFeatures');
      spy1.mockReturnValue([
        {
          type: 'feature',
          properties: {
            Shape_Area: 45.7573378841,
            Shape_Leng: 67.3938464236,
            UserID: 0,
            行政区划_c: '四川省',
            index: 1
          },
          geometry: {
            type: 'MultiPolygon',
            coordinates: [
              [
                [
                  [116.452409755349, 40.92656164358],
                  [116.483357386004, 40.9069469918439],

                  [116.442423257771, 40.9417511118507],
                  [116.452409755349, 40.92656164358]
                ]
              ],
              [
                [
                  [116.560117987415, 40.9749988417875],

                  [116.547892153981, 40.9705907375336],
                  [116.552270926448, 40.980672910927],
                  [116.560117987415, 40.9749988417875]
                ]
              ]
            ]
          }
        }
      ]);
      const spy2 = jest.spyOn(wrapper.vm.viewModel, 'getBboxByFeature');
      spy2.mockReturnValue([]);
      expect(wrapper.vm.mapProps.target).toBe('map');
      expect(wrapper.vm.mapProps.serverUrl).toEqual('https://fakeiportal.supermap.io/iportal');
      wrapper.vm.viewModel.drillNextMap({
        target: map,
        point: {
          x: 478,
          y: 490
        }
      });
      const currentIndex = wrapper.vm.currentIndex;
      const data = wrapper.vm.data[currentIndex];
      const layer = map.getLayer(data.layerId);
      expect(currentIndex).toEqual(1);
      expect(layer.layout.visibility).toBe('visible');
      // wrapper.vm.viewModel.boundsList = [{ center: [0, 0], zoom: 3 }];
      const goback = wrapper.find('#go-back');
      goback.trigger('click');
      expect(wrapper.vm.currentIndex).toEqual(0);
      const layerId = wrapper.vm.data[0].layerId;
      expect(map.getLayer(layerId).layout.visibility).toBe('visible');
      done();
    }
  });

  it('click_blank', async done => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/244114284/map.json': mapInfo,
      'https://fakeiportal.supermap.io/iportal/web/datas/719613442/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': provinceInfo,
      'https://fakeiportal.supermap.io/iportal/web/datas/1687422166/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': cityInfo,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined': countyInfo
    };
    mockFetch(fetchResource);
    wrapper = mount(SmDrillMap, {
      localVue,
      propsData: {
        data: getDrillingMapData()
      }
    });
    await flushPromises();
    wrapper.find(SmWebMap).vm.$on('load', callback);
    await mapWrapperLoaded(wrapper.find(SmWebMap));
    function callback(e) {
      expect(spy).toHaveBeenCalledTimes(1);
      const map = e.map;
      const spy1 = jest.spyOn(map, 'queryRenderedFeatures');
      spy1.mockReturnValue([
        {
          type: 'feature',
          properties: {
            Shape_Area: 45.7573378841,
            Shape_Leng: 67.3938464236,
            UserID: 0,
            行政区划_c: '四川省',
            index: 1
          },
          geometry: {
            type: 'MultiPolygon',
            coordinates: [
              [
                [
                  [116.452409755349, 40.92656164358],
                  [116.483357386004, 40.9069469918439],

                  [116.442423257771, 40.9417511118507],
                  [116.452409755349, 40.92656164358]
                ]
              ],
              [
                [
                  [116.560117987415, 40.9749988417875],

                  [116.547892153981, 40.9705907375336],
                  [116.552270926448, 40.980672910927],
                  [116.560117987415, 40.9749988417875]
                ]
              ]
            ]
          }
        }
      ]);
      const spy2 = jest.spyOn(wrapper.vm.viewModel, 'getBboxByFeature');
      spy2.mockReturnValue([]);
      expect(wrapper.vm.mapProps.target).toBe('map');
      expect(wrapper.vm.mapProps.serverUrl).toEqual('https://fakeiportal.supermap.io/iportal');
      wrapper.vm.viewModel.drillNextMap({
        target: map,
        point: {
          x: 478,
          y: 490
        }
      });
      const currentIndex = wrapper.vm.currentIndex;
      const data = wrapper.vm.data[currentIndex];
      const layer = map.getLayer(data.layerId);
      expect(currentIndex).toEqual(1);
      expect(layer.layout.visibility).toBe('visible');
      const spy3 = jest.spyOn(map, 'queryRenderedFeatures');
      spy3.mockReturnValue(null);
      wrapper.vm.viewModel.drillNextMap({
        target: map,
        point: {
          x: 478,
          y: 490
        }
      });
      expect(wrapper.vm.currentIndex).toEqual(0);
      const layerId = wrapper.vm.data[0].layerId;
      expect(map.getLayer(layerId).layout.visibility).toBe('visible');
      done();
    }
  });
});
