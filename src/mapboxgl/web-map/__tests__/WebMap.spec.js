import { mount, createLocalVue } from '@vue/test-utils';
import SmWebMap from '../WebMap';
import mapboxgl from "@libs/mapboxgl/mapbox-gl-enhance.js";
// jest.mock('@libs/mapboxgl/mapbox-gl-enhance', () => require('@mocks/mapboxgl').mapboxgl);
jest.mock('@libs/mapboxgl/mapbox-gl-enhance', () => require('@mocks/mapboxgl').mapboxgl)
jest.mock('@libs/iclient-mapboxgl/iclient9-mapboxgl.min', () => require('@mocks/mapboxgl_iclient'));
import { Icon, Card, Collapse, Button } from 'ant-design-vue';

const localVue = createLocalVue()
localVue.use(Card);
localVue.use(Collapse);
localVue.use(Icon);
localVue.use(Button);
// localVue.use(Checkbox);


describe('WebMap.vue', () => {

  it('initial_serverUrl', (done) => {
    const spy = jest.spyOn(mapboxgl, "Map");
    const wrapper = mount(SmWebMap,
      {
        localVue,
        propsData: {
          serverUrl: 'http://support.supermap.com.cn:8092/',
          mapId: '1649097980'
        }
      }
    )

    wrapper.vm.$on("load", () => {
      try {
        expect(spy).toBeCalled();
        expect(wrapper.element.id).toEqual('map');
        expect(wrapper.vm.mapId).toBe("1649097980");
        expect(wrapper.vm.viewModel.serverUrl).toBe('http://support.supermap.com.cn:8092/');
        // expect(wrapper.vm.panControl.show).toBe(false);
        // expect(wrapper.vm.scaleControl.show).toBe(false);
        // expect(wrapper.vm.zoomControl.show).toBe(false);
        expect(wrapper.element.outerHTML).not.toContain("pan")
        expect(wrapper.element.outerHTML).not.toContain("zoom")
        expect(wrapper.element.outerHTML).not.toContain("scale")
        done()
      }
      catch (exception) {
        console.log("WebMap" + exception.name + ":" + exception.message);
        expect(false).toBeTruthy();
        spy.mockReset();
        spy.mockRestore();
        done()
      }
    })
  })

  it('initial_Control', (done) => {
    const spy = jest.spyOn(mapboxgl, "Map");
    const wrapper = mount(SmWebMap,
      {
        localVue,
        propsData: {
          mapId: '1649097980',
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
            zoomWithSlider: false
          }
        }
      }
    )

    wrapper.vm.$on("load", () => {
      try {
        console.log("")
        expect(spy).toBeCalled();
        expect(wrapper.element.id).toEqual('map');
        expect(wrapper.vm.serverUrl).toBe("http://www.supermapol.com");
        expect(wrapper.vm.mapId).toBe("1649097980");
        expect(wrapper.vm.panControl.show).toBe(true);
        expect(wrapper.vm.scaleControl.position).toBe('bottom-right');
        expect(wrapper.vm.zoomControl.zoomWithSlider).toBe(false);
        expect(wrapper.find('.sm-component-pan').exists()).toBe(true)
        expect(wrapper.element.outerHTML).toContain("pan")
        expect(wrapper.element.outerHTML).toContain("zoom")
        expect(wrapper.element.outerHTML).toContain("scale")
        done()
      }
      catch (exception) {
        console.log("WebMap" + exception.name + ":" + exception.message);
        expect(false).toBeTruthy();
        spy.mockReset();
        spy.mockRestore();
        done()
      }
    })
  })


  it('initial_mapObject', (done) => {
    const spy = jest.spyOn(mapboxgl, "Map");
    const wrapper = mount(SmWebMap,
      {
        propsData: {
          mapOptions: {
            container: 'map', // container id
            style: {
              version: 8,
              sources: {
                'raster-tiles': {
                  attribution: 'attribution',
                  type: 'raster',
                  tiles: [
                    'http://support.supermap.com.cn:8090/iserver/services/map-china400/rest/maps/China/zxyTileImage.png?z={z}&x={x}&y={y}'
                  ],
                  tileSize: 256
                }
              },
              layers: [
                {
                  id: 'simple-tiles',
                  type: 'raster',
                  source: 'raster-tiles',
                  minzoom: 0,
                  maxzoom: 22
                }
              ]
            },
            center: [120.143, 30.236],
            zoom: 3
          }
        }
      }
    )

    wrapper.vm.$on("load", () => {
      try {
        expect(spy).toBeCalled();
        expect(wrapper.element.id).toEqual('map');
        expect(wrapper.vm.mapOptions.style.layers[0].id).toBe("simple-tiles");
        done()
      }
      catch (exception) {
        console.log("WebMap" + exception.name + ":" + exception.message);
        expect(false).toBeTruthy();
        spy.mockReset();
        spy.mockRestore();
        done()
      }
    })
  })
})