import { mount, createLocalVue } from '@vue/test-utils';
import SmTdtSearch from '../TdtSearch.vue';
import SmWebMap from '../../../web-map/WebMap.vue';
import mapEvent from '@types_mapboxgl/map-event';
import '@libs/mapboxgl/mapbox-gl-enhance';
import { Input, message } from 'ant-design-vue';

const localVue = createLocalVue();
localVue.use(Input);
message.config({
  top: `10%`,
  maxCount: 1
});
localVue.prototype.$message = message;

describe('TdtSearch.vue', () => {
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
    wrapper = mount(SmTdtSearch, {
      localVue,
      propsData: {
        mapTarget: 'map',
        collapsed: false
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
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

  it('search', done => {
    wrapper = mount(SmTdtSearch, {
      localVue,
      propsData: {
        mapTarget: 'map',
        collapsed: true,
        data: {
          tk: '1d109683f4d84198e37a38c442d68311'
        }
      }
    });

    mapWrapper.vm.$on('load', () => {
      wrapper.vm.$on('loaded', () => {
        try {
          expect(wrapper.vm.collapsed).toBeTruthy();
          expect(wrapper.vm.mapTarget).toBe('map');
          const inputSeatch = wrapper.find('.sm-component-input');
          expect(inputSeatch.exists()).toBeTruthy();
          inputSeatch.setValue('成都');
          wrapper.find('.sm-component-search__search-icon').trigger('click');
          expect(wrapper.find('.sm-component-search__result')).toBeTruthy();
          setTimeout(() => {
            const result = wrapper.findAll('.sm-component-search__result li');
            expect(result.length).toBe(10);
            expect(wrapper.find('.sm-component-tdtAreaResults')).toBeFalsy();
            result.at(0).trigger('click');
          }, 500);
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
