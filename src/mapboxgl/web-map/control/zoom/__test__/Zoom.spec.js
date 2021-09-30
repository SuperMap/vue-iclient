import { mount, createLocalVue, config} from '@vue/test-utils';
import SmWebMap from '../../../../web-map/WebMap.vue';
import SmZoom from '../Zoom.vue';
import mapEvent from '@types_mapboxgl/map-event';
import { Icon, Card, Collapse, Button } from 'ant-design-vue';
config.stubs.transition = false
const localVue = createLocalVue();
localVue.use(Card);
localVue.use(Collapse);
localVue.use(Icon);
localVue.use(Button);

describe('Zoom.vue', () => {
  let mapWrapper;
  let wrapper;
  beforeEach(() => {
    jest.resetAllMocks();
    mapEvent.firstMapTargedt = null;
    mapEvent.$options.mapCache = {};
    mapEvent.$options.webMapCache = {};
    mapWrapper = null;
    wrapper = null;
  })

  afterEach(() => {
    if (mapWrapper) {
      mapWrapper.destroy();
    }
    if (wrapper) {
      wrapper.destroy();
    }
  });

  it('default', (done) => {
    mapWrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      }
    });
    wrapper = mount(SmZoom,{
      propsData: {
        showZoom: true,
        position: 'top-left',
        showZoomSlider: true
        }
      })

    wrapper.vm.$on("loaded", () => {
      try {
        expect(wrapper.vm.showZoom).toBe(true);
        expect(wrapper.vm.position).toBe('top-left');
        expect(wrapper.vm.showZoomSlider).toBe(true);
        expect(wrapper.find('.sm-component-zoom').exists()).toBe(true);
        done()
      }
      catch (exception) {
        console.log("WebMap" + exception.name + ":" + exception.message);
        expect(false).toBeTruthy();
        wrapper.destroy();
        mapWrapper.destroy();
        done();
      }
    })
  });

  it('zoomIn', (done) => {
    mapWrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      }
    });
    wrapper = mount(SmZoom,{
      propsData: {
        showZoom: true,
        position: 'top-left',
        showZoomSlider: true
        }
      })
    wrapper.vm.$on("loaded", () => {
      try {
        expect(wrapper.vm.showZoom).toBe(true);
        expect(wrapper.vm.position).toBe('top-left');
        expect(wrapper.vm.showZoomSlider).toBe(true);
        expect(wrapper.vm.map.zoom).toBe(4);
        let spyZoomIn = jest.spyOn(wrapper.vm.map, 'zoomIn');
        wrapper.find('i.sm-components-icon-plus').trigger('click');
        expect(spyZoomIn).toBeCalled();
        expect(wrapper.vm.map.zoom).toBe(5);
        done()
      }
      catch (exception) {
        console.log("WebMap" + exception.name + ":" + exception.message);
        expect(false).toBeTruthy();
        wrapper.destroy();
        mapWrapper.destroy();
        done();
      }
    })
  });

  it('zoomOut', (done) => {
    mapWrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      }
    });
    wrapper = mount(SmZoom,{
      propsData: {
        showZoom: true,
        position: 'top-left',
        showZoomSlider: true
        }
      })
    wrapper.vm.$on("loaded", () => {
      try {
        expect(wrapper.vm.showZoom).toBe(true);
        expect(wrapper.vm.position).toBe('top-left');
        expect(wrapper.vm.showZoomSlider).toBe(true);
        expect(wrapper.vm.map.zoom).toBe(4);
        let spyZoomOut = jest.spyOn(wrapper.vm.map, 'zoomOut');
        wrapper.find('i.sm-components-icon-minus').trigger('click');
        expect(spyZoomOut).toBeCalled();
        expect(wrapper.vm.map.zoom).toBe(3);
        done()
      }
      catch (exception) {
        console.log("WebMap" + exception.name + ":" + exception.message);
        expect(false).toBeTruthy();
        wrapper.destroy();
        mapWrapper.destroy();
        done();
      }
    })
  });

  it('zoomSlider', (done) => {
    mapWrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      }
    });
    wrapper = mount(SmZoom,{
      propsData: {
        showZoom: true,
        position: 'top-left',
        showZoomSlider: true
        }
      })
    wrapper.vm.$on("loaded", () => {
      try {
        const slider = jest.spyOn(wrapper.vm,'setZoom');
        expect(wrapper.find('.sm-component-slider-handle').exists()).toBe(true);
        wrapper.vm.sliderChange();
        expect(slider).toBeCalled();
        wrapper.find('i.sm-components-icon-minus').trigger('click');
        done()
      }
      catch (exception) {
        console.log("WebMap" + exception.name + ":" + exception.message);
        expect(false).toBeTruthy();
        wrapper.destroy();
        mapWrapper.destroy();
        done();
      }
    })
  });
})
