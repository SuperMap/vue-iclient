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
import cloneDeep from 'lodash.clonedeep';

const localVue = createLocalVue();
localVue.use(Button);

const getDrillingMapData = function (mapIds = [244114284, 244114284, 244114284]) {
  return [
    {
      layerId: '云贵川',
      serverUrl: 'https://fakeiportal.supermap.io/iportal/' + mapIds[0],
      mapId: mapIds[0],
      foreignField: '行政区划_c'
    },
    {
      layerId: '云贵川市',
      serverUrl: 'https://fakeiportal.supermap.io/iportal/' + mapIds[1],
      mapId: mapIds[1],
      primaryField: 'FIRST_行政',
      foreignField: '行政区划_c'
    },
    {
      layerId: '云贵川区县',
      serverUrl: 'https://fakeiportal.supermap.io/iportal/' + mapIds[2],
      mapId: mapIds[2],
      linkField: ['行政区划_c', '行政区划_1'],
      primaryField: '行政区划_1'
    }
  ];
};
const map = {
  getCenter() {},
  getZoom() {},
  on() {},
  off() {},
  getFilter() {},
  fitBounds() {},
  queryRenderedFeatures() {
    return [];
  },
  setLayoutProperty() {},
  getLayer(layerId) {
    return [{ name: '云贵川' }, { name: '云贵川市' }, { name: '云贵川区县' }].find(item => item.name === layerId);
  }
};
describe('DrillMap.vue', () => {
  let wrapper, mapWrapper, spy;

  beforeAll(() => {
    // config.mapLoad = false;
  });

  beforeEach(() => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/244114284/map.json': cloneDeep(mapInfo),
      'https://fakeiportal.supermap.io/iportal/web/datas/719613442/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        provinceInfo,
      'https://fakeiportal.supermap.io/iportal/web/datas/1687422166/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        cityInfo,
      'https://fakeiportal.supermap.io/iportal/web/datas/1960447494/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=undefined':
        countyInfo
    };
    mockFetch(fetchResource);
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
      wrapper = null;
    }
    if (mapWrapper) {
      mapWrapper.destroy();
      mapWrapper = null;
    }
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  afterAll(() => {
    config.mapLoad = true;
  });

  it('initial_same_map', async done => {
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmDrillMap, {
      localVue,
      propsData: {
        data: getDrillingMapData(),
        target: 'map1'
      }
    });
    await flushPromises();
    await wrapper.vm.$nextTick();
    mapWrapper = wrapper.find(SmWebMap);
    mapWrapper.vm.$on('load', callback);
    function callback() {
      expect(spy).toHaveBeenCalledTimes(1);
      expect(wrapper.vm.mapProps.target).toBe('map1');
      expect(wrapper.vm.mapProps.serverUrl).toEqual('https://fakeiportal.supermap.io/iportal/244114284');
      done();
    }
  });

  it('initial_Control', async done => {
    const spy = jest.spyOn(mapboxgl, 'Map');
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
        },
        target: 'map2'
      }
    });
    await flushPromises();
    await wrapper.vm.$nextTick();
    mapWrapper = wrapper.find(SmWebMap);
    mapWrapper.vm.$on('load', callback);
    mapWrapper.vm.$emit('load', {
      map
    });
    function callback() {
      expect(spy).toHaveBeenCalledTimes(1);
      const map = wrapper.find('#map2');
      expect(map.element.id).toEqual('map2');
      expect(wrapper.vm.panControl.show).toBe(true);
      expect(wrapper.vm.scaleControl.position).toBe('bottom-right');
      expect(wrapper.vm.zoomControl.showZoomSlider).toBe(false);
      expect(wrapper.find('.sm-component-pan').exists()).toBe(false);
      expect(map.element.outerHTML).toContain('pan');
      expect(map.element.outerHTML).toContain('zoom');
      expect(map.element.outerHTML).toContain('scale');
      done();
    }
  });

  it('initial_diffrent_map', async done => {
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmDrillMap, {
      localVue,
      propsData: {
        data: getDrillingMapData([1653065660, 891303728, 366831804]),
        target: 'map3'
      }
    });
    await flushPromises();
    await wrapper.vm.$nextTick();
    mapWrapper = wrapper.find(SmWebMap);
    mapWrapper.vm.$on('load', callback);
    mapWrapper.vm.$emit('load', {
      map
    });
    function callback() {
      expect(spy).toHaveBeenCalledTimes(1);
      expect(wrapper.vm.mapProps.serverUrl).toEqual('https://fakeiportal.supermap.io/iportal/1653065660');
      const layers = wrapper.vm.mapProps.mapId.layers;
      const layerIDs = layers.map(item => item.name);
      expect(layers.length).toEqual(3);
      expect(layerIDs).toContain('云贵川');
      expect(layerIDs).toContain('云贵川市');
      expect(layerIDs).toContain('云贵川区县');
      done();
    }
  });

  it('drill_next_map', async done => {
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmDrillMap, {
      localVue,
      propsData: {
        data: getDrillingMapData(),
        target: 'map4'
      }
    });
    await flushPromises();
    await wrapper.vm.$nextTick();
    mapWrapper = wrapper.find(SmWebMap);
    mapWrapper.vm.$on('load', callback);
    mapWrapper.vm.$emit('load', {
      map: {
        getCenter() {},
        getZoom() {},
        on() {},
        off() {},
        getFilter() {},
        fitBounds() {},
        setFilter() {},
        queryRenderedFeatures() {
          return [
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
          ];
        },
        setLayoutProperty() {},
        getLayer(layerId) {
          return [
            { name: '云贵川', layout: { visibility: 'visible' } },
            { name: '云贵川市', layout: { visibility: 'visible' } },
            { name: '云贵川区县', layout: { visibility: 'visible' } }
          ].find(item => item.name === layerId);
        }
      }
    });
    function callback(e) {
      expect(spy).toHaveBeenCalledTimes(1);
      const map = e.map;
      const spy2 = jest.spyOn(wrapper.vm.viewModel, 'getBboxByFeature');
      spy2.mockReturnValue([]);
      expect(wrapper.vm.mapProps.target).toBe('map4');
      expect(wrapper.vm.mapProps.serverUrl).toEqual('https://fakeiportal.supermap.io/iportal/244114284');
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
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmDrillMap, {
      localVue,
      propsData: {
        data: getDrillingMapData(),
        target: 'map5'
      },
      scopedSlots: {
        goBack: `<a-button id="go-back" @click="props.goBack">返回</a-button>`
      }
    });
    await flushPromises();
    await wrapper.vm.$nextTick();
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
      expect(wrapper.vm.mapProps.target).toBe('map5');
      expect(wrapper.vm.mapProps.serverUrl).toEqual('https://fakeiportal.supermap.io/iportal/244114284');
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
    mapWrapper = wrapper.find(SmWebMap);
    mapWrapper.vm.$on('load', callback);
    mapWrapper.vm.$emit('load', {
      map: {
        getCenter() {},
        setCenter() {},
        getZoom() {},
        setZoom() {},
        on() {},
        off() {},
        getFilter() {},
        fitBounds() {},
        queryRenderedFeatures() {
          return [];
        },
        setFilter() {},
        setLayoutProperty() {},
        getLayer(layerId) {
          return [
            { name: '云贵川', layout: { visibility: 'visible' } },
            { name: '云贵川市', layout: { visibility: 'visible' } },
            { name: '云贵川区县', layout: { visibility: 'visible' } }
          ].find(item => item.name === layerId);
        }
      }
    });
  });

  it('click_blank', async done => {
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmDrillMap, {
      localVue,
      propsData: {
        data: getDrillingMapData(),
        target: 'map6'
      }
    });
    await flushPromises();
    await wrapper.vm.$nextTick();
    mapWrapper = wrapper.find(SmWebMap);
    mapWrapper.vm.$on('load', callback);
    mapWrapper.vm.$emit('load', {
      map: {
        setFilter() {},
        getCenter() {},
        setCenter() {},
        getZoom() {},
        setZoom() {},
        on() {},
        off() {},
        getFilter() {},
        fitBounds() {},
        queryRenderedFeatures() {
          return [];
        },
        setLayoutProperty() {},
        getLayer(layerId) {
          return [
            { name: '云贵川', layout: { visibility: 'visible' } },
            { name: '云贵川市', layout: { visibility: 'visible' } },
            { name: '云贵川区县', layout: { visibility: 'visible' } }
          ].find(item => item.name === layerId);
        }
      }
    });
    function callback(e) {
      // expect(spy).toHaveBeenCalledTimes(1);
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
      expect(wrapper.vm.mapProps.target).toBe('map6');
      expect(wrapper.vm.mapProps.serverUrl).toEqual('https://fakeiportal.supermap.io/iportal/244114284');
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
