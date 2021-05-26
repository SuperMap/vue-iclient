import { mount, createLocalVue } from '@vue/test-utils';
import SmDrillMap from '../DrillMap.vue';
import mapboxgl from '@libs/mapboxgl/mapbox-gl-enhance.js';
import { Icon, Card, Collapse, Button, Spin, message } from 'ant-design-vue';

const localVue = createLocalVue();
localVue.use(Card);
localVue.use(Collapse);
localVue.use(Icon);
localVue.use(Button);
localVue.use(Spin);
localVue.prototype.$message = message;

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
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (wrapper) {
      wrapper.destroy();
    }
  });

  it('initial_same_map', done => {
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmDrillMap, {
      localVue,
      propsData: {
        data: getDrillingMapData(),
        target: 'map1'
      }
    });
    wrapper.vm.$on('load', () => {
      try {
        expect(spy).toBeCalled();
        expect(wrapper.vm.mapProps.target).toBe('map1');
        expect(wrapper.vm.mapProps.serverUrl).toEqual('https://fakeiportal.supermap.io/iportal');
        done();
      } catch (exception) {
        console.log('DrillMap' + exception.name + ':' + exception.message);
        expect(false).toBeTruthy();
        spy.mockReset();
        spy.mockRestore();
        done();
      }
    });
  });

  it('initial_Control', done => {
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
        }
      }
    });
    wrapper.vm.$on('load', () => {
      try {
        expect(spy).toBeCalled();
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
      } catch (exception) {
        console.log('DrillMap' + exception.name + ':' + exception.message);
        expect(false).toBeTruthy();
        spy.mockReset();
        spy.mockRestore();
        done();
      }
    });
  });

  it('initial_diffrent_map', done => {
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmDrillMap, {
      localVue,
      propsData: {
        data: getDrillingMapData([1653065660, 891303728, 366831804])
      }
    });
    wrapper.vm.$on('load', () => {
      try {
        expect(spy).toBeCalled();
        expect(wrapper.vm.mapProps.serverUrl).toEqual('https://fakeiportal.supermap.io/iportal');
        const layers = wrapper.vm.mapProps.mapId.layers;
        const layerIDs = layers.map(item => item.name);
        expect(layers.length).toEqual(3);
        expect(layerIDs).toContain('云贵川');
        expect(layerIDs).toContain('云贵川市');
        expect(layerIDs).toContain('云贵川区县');
        done();
      } catch (exception) {
        console.log('DrillMap' + exception.name + ':' + exception.message);
        expect(false).toBeTruthy();
        spy.mockReset();
        spy.mockRestore();
        done();
      }
    });
  });

  it('drill_next_map', done => {
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmDrillMap, {
      localVue,
      propsData: {
        data: getDrillingMapData()
      }
    });
    wrapper.vm.$on('load', e => {
      try {
        expect(spy).toBeCalled();
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
      } catch (exception) {
        console.log('DrillMap' + exception);
        expect(false).toBeTruthy();
        spy.mockReset();
        spy.mockRestore();
        done();
      }
    });
  });

  it('go_back', done => {
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmDrillMap, {
      localVue,
      propsData: {
        data: getDrillingMapData()
      },
      scopedSlots: {
        goBack: `<a-button id="go-back" @click="props.goBack">返回</a-button>`
      }
    });
    wrapper.vm.$on('load', e => {
      try {
        expect(spy).toBeCalled();
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
      } catch (exception) {
        console.log('DrillMap' + exception);
        expect(false).toBeTruthy();
        spy.mockReset();
        spy.mockRestore();
        done();
      }
    });
  });

  it('click_blank', done => {
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmDrillMap, {
      localVue,
      propsData: {
        data: getDrillingMapData()
      }
    });
    wrapper.vm.$on('load', e => {
      try {
        expect(spy).toBeCalled();
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
      } catch (exception) {
        console.log('DrillMap' + exception);
        expect(false).toBeTruthy();
        spy.mockReset();
        spy.mockRestore();
        done();
      }
    });
  });
});
