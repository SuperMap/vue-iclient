import { mount, createLocalVue, config } from '@vue/test-utils';
import SmWebMap from '../../../WebMap';
import SmCoordinateConversion from '../CoordinateConversion.vue';
import LayerList from '../index';
import mapEvent from '@types_mapboxgl/map-event';
import { Input } from 'ant-design-vue';
import { map } from 'leaflet';

config.stubs.transition = false;
const localVue = createLocalVue();
localVue.use(Input);

describe('CoordinateConversion.vue', () => {
  let wrapper;
  let mapWrapper;

  beforeEach(() => {
    mapEvent.firstMapTarget = null;
    mapEvent.$options.mapCache = {};
    mapEvent.$options.webMapCache = {};
    wrapper = null;
    mapWrapper = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (wrapper) {
      wrapper.destroy();
    }
    if (mapWrapper) {
      mapWrapper.destroy();
    }
  });
  it('render index correctly', () => {
    wrapper = mount(SmCoordinateConversion);
    expect(wrapper.find('div.sm-component-coordinate-conversion').exists()).toBe(true);
  });

  it('Judge click', done => {
    mapWrapper = mount(SmWebMap, {
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      }
    });
    wrapper = mount(SmCoordinateConversion, {
      localVue
    });
    mapWrapper.vm.$on('load', () => {
      let handleLocation = jest.spyOn(wrapper.vm, 'handleLocation');
      expect(wrapper.find('.sm-component-coordinate-conversion__location').exists()).toBe(true);
      wrapper.find('.sm-components-icon-click').trigger('click');
      wrapper.find('.sm-component-coordinate-conversion__location').trigger('click');
      expect(handleLocation).toHaveBeenCalledTimes(1);
      wrapper.find('.sm-components-icon-click').trigger('click');
      wrapper.find('.sm-components-icon-click').trigger('click');
      done();
    });
  });

  it('set props formats object', async () => {
    wrapper = mount(SmCoordinateConversion);
    await wrapper.setProps({
      formats: [
        'BASEMAP',
        'XY',
        {
          title: 'custom',
          display: `X Y`,
          fromWGS84: () => {
            return '1 1';
          },
          toWGS84: value => {
            const coor = value.split(' ');
            // @ts-ignore
            const coor1 = { lng: coor[0] * 1, lat: coor[1] * 1 };
            return this.getEpsgCoordinate(coor1, 'EPSG:4326', this.getEpsgCode());
          }
        }
      ]
    });
    expect(wrapper.vm.formats.length).toBe(3);
    expect(wrapper.find('div.sm-component-coordinate-conversion').exists()).toBe(true);
  });
});
