import { mount, createLocalVue } from '@vue/test-utils';
import SmTdtRoute from '../TdtRoute.vue';
import SmWebMap from '../../../web-map/WebMap.vue';
import mapEvent from '@types_mapboxgl/map-event';
import '@libs/mapboxgl/mapbox-gl-enhance';
import { Input } from 'ant-design-vue';

const localVue = createLocalVue();
localVue.use(Input);
describe('TdtRoute.vue', () => {
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
    wrapper = mount(SmTdtRoute, {
      localVue,
      propsData: {
        mapTarget: 'map',
        collapsed: false
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          // const setStyleOptionsSpy = jest.spyOn(wrapper.vm.viewModel, 'setStyleOptions');
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

  it('change route', done => {
    wrapper = mount(SmTdtRoute, {
      localVue,
      propsData: {
        mapTarget: 'map',
        collapsed: false
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          // const setStyleOptionsSpy = jest.spyOn(wrapper.vm.viewModel, 'setStyleOptions');

          expect(wrapper.find('.sm-component-tdtRoute').exists()).toBe(true);
          const btnEle = wrapper.find('.bus-icon');
          btnEle.trigger('click');
          wrapper.vm.$nextTick();
          expect(wrapper.vm.routeActive).toBe('bus');
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('switch route', done => {
    wrapper = mount(SmTdtRoute, {
      localVue,
      propsData: {
        mapTarget: 'map',
        collapsed: false
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          // const setStyleOptionsSpy = jest.spyOn(wrapper.vm.viewModel, 'setStyleOptions');

          expect(wrapper.find('.sm-component-tdtRoute').exists()).toBe(true);
          const iconEle = wrapper.find('.switch-route');
          iconEle.trigger('click');
          wrapper.vm.$nextTick();
          // expect(wrapper.vm.routeActive).toBe('bus');
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('search route', done => {
    wrapper = mount(SmTdtRoute, {
      localVue,
      propsData: {
        mapTarget: 'map',
        collapsed: false,
        data: {
          tk: '1d109683f4d84198e37a38c442d68311'
        }
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          // const setStyleOptionsSpy = jest.spyOn(wrapper.vm.viewModel, 'setStyleOptions');
          expect(wrapper.find('.sm-component-tdtRoute').exists()).toBe(true);
          expect(wrapper.find('.sm-component-input').exists()).toBe(true);
          const startInputEles = wrapper.find('.start-route input');
          startInputEles.setValue('成都');
          expect(wrapper.vm.start).toBe('成都');
          const endInputEles = wrapper.find('.end-route input');
          endInputEles.setValue('北京');
          expect(wrapper.vm.end).toBe('北京');
          const searchBtn = wrapper.find('.search-btn .sm-component-btn');
          searchBtn.trigger('click');
          wrapper.vm.$nextTick();
          setTimeout(() => {
            expect(wrapper.find('.sm-component-tdtPointsResults').exists()).toBe(true);
          }, 500);
          // iconEle.trigger('click');
          // wrapper.vm.$nextTick();
          // expect(wrapper.vm.routeActive).toBe('bus');
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('clear route', done => {
    wrapper = mount(SmTdtRoute, {
      localVue,
      propsData: {
        mapTarget: 'map',
        collapsed: false,
        data: {
          tk: '1d109683f4d84198e37a38c442d68311',
          carUrl: 'https://api.tianditu.gov.cn/drive',
          busUrl: 'https://api.tianditu.gov.cn/transit',
          searchUrl: 'https://api.tianditu.gov.cn/search'
        }
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          // const setStyleOptionsSpy = jest.spyOn(wrapper.vm.viewModel, 'setStyleOptions');
          const startInputEles = wrapper.find('.start-route input');
          startInputEles.setValue('成都');
          expect(wrapper.vm.start).toBe('成都');
          const endInputEles = wrapper.find('.end-route input');
          endInputEles.setValue('北京');
          expect(wrapper.vm.end).toBe('北京');
          expect(wrapper.find('.clear-route').exists()).toBe(true);
          const clearBtnEle = wrapper.find('.clear-route');
          clearBtnEle.trigger('click');
          wrapper.vm.$nextTick();
          expect(wrapper.vm.start).toBe('');
          expect(wrapper.vm.end).toBe('');
          done();
        } catch (exception) {
          console.log('案例失败：' + exception.name + ':' + exception.message);
          expect(false).toBeTruthy();
          done();
        }
      });
    });
  });

  it('setData', done => {
    wrapper = mount(SmTdtRoute, {
      localVue,
      propsData: {
        mapTarget: 'map',
        collapsed: false,
        data: {
          carUrl: 'https://api.tianditu.gov.cn/drive',
          busUrl: 'https://api.tianditu.gov.cn/transit',
          searchUrl: 'https://api.tianditu.gov.cn/search',
          tk: '5465465464564564588888999999'
        }
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          const setDataSpy = jest.spyOn(wrapper.vm.viewModel, 'setData');
          wrapper.setProps({
            data: {
              carUrl: 'https://api.tianditu.gov.cn/drive',
              busUrl: 'https://api.tianditu.gov.cn/transit',
              searchUrl: 'https://api.tianditu.gov.cn/search',
              tk: '1d109683f4d84198e37a38c442d68311'
            }
          });
          expect(setDataSpy).toBeCalled();
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
