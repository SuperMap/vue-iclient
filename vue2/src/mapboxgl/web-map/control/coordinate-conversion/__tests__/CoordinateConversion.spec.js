import { mount, createLocalVue, config } from '@vue/test-utils';
import SmCoordinateConversion from '../CoordinateConversion.vue';
import { Input } from 'ant-design-vue';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';
import proj4 from 'proj4';

const localVue = createLocalVue();
localVue.use(Input);

describe('CoordinateConversion.vue', () => {
  let wrapper;
  let mapWrapper;

  beforeAll(async () => {
    config.mapLoad = false;
    mapWrapper = await createEmptyMap();
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
    if (mapWrapper) {
      mapWrapper.destroy();
    }
  });

  it('render index correctly', () => {
    wrapper = mount(SmCoordinateConversion);
    expect(wrapper.find('div.sm-component-coordinate-conversion').exists()).toBe(true);
  });

  it('Judge click', done => {
    wrapper = mount(SmCoordinateConversion, {
      data() {
        return {
          activeFormat: 'XY'
        };
      }
    });
    const iconEle = wrapper.find('.sm-components-icon-click');
    iconEle.trigger('click');
    const e = {
      lngLat: {
        lng: 10,
        lat: 10
      }
    };
    const spy = jest.spyOn(wrapper.vm.viewModel, '_bindHover');
    expect(wrapper.vm.viewModel.marker).toBeNull();
    wrapper.vm.viewModel.map.fire('click', e);
    expect(wrapper.vm.viewModel.marker).not.toBeNull();
    iconEle.trigger('click');
    iconEle.trigger('click');
    wrapper.vm.viewModel.map.fire('mousemove', e);
    expect(spy).toHaveBeenCalledTimes(1);
    done();
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

  it('trigger input', () => {
    wrapper = mount(SmCoordinateConversion);
    const e = {
      target: {
        value: 'M'
      }
    };
    const a = {
      target: {}
    };
    const inputEle = wrapper.find('.sm-component-coordinate-conversion__a-input');
    inputEle.vm.$emit('input', e);
    expect(wrapper.vm.inputValue).toBe('M');
    inputEle.vm.$emit('blur', e);
    inputEle.vm.$emit('change', a);
    expect(wrapper.vm.enableLocation).toBe(false);
    expect(wrapper.vm.coordinate).toBe(null);
  });

  it('handle location', async () => {
    wrapper = mount(SmCoordinateConversion, {
      data() {
        return {
          coordinate: {
            lng: 10,
            lat: 10
          }
        };
      }
    });
    const spy = jest.spyOn(wrapper.vm.viewModel, '_flyTo');
    const divEle = wrapper.find('.sm-component-coordinate-conversion__location');
    expect(divEle.exists()).toBe(true);
    divEle.trigger('click');
    await wrapper.vm.$nextTick();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('change format to BASEMAP', async () => {
    wrapper = mount(SmCoordinateConversion, {
      data() {
        return {
          activeFormat: 'BASEMAP',
          coordinate: {
            lng: 10,
            lat: 10
          }
        };
      }
    });
    const wkt4326 = 'GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],AXIS["Easting", "EAST"],AXIS["Northing", "NORTH"],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4326"]]';
    const spyDefs = jest.spyOn(proj4, 'defs').mockImplementation(() => wkt4326);
    const spy = jest.spyOn(wrapper.vm.viewModel, '_clearMarker');
    const selectEle = wrapper.find('.sm-component-coordinate-conversion__a-select');
    expect(selectEle.exists()).toBe(true);
    selectEle.vm.$emit('change');
    await wrapper.vm.$nextTick();
    expect(spy).toHaveBeenCalledTimes(1);
    selectEle.vm.$emit('change', 'BASEMAP');
    expect(wrapper.vm.inputValue).toEqual('10.000 10.000');
    expect(spyDefs).toHaveBeenCalled();;
    const inputEle = wrapper.find('.sm-component-coordinate-conversion__a-input');
    const e = {
      target: {
        value: 'M'
      }
    };
    inputEle.vm.$emit('blur', e);
    expect(wrapper.vm.coordinate).toEqual({ lat: NaN, lng: NaN });
    spyDefs.mockClear();
  });

  it('change format to XY', () => {
    wrapper = mount(SmCoordinateConversion, {
      data() {
        return {
          activeFormat: 'XY',
          coordinate: {
            lng: 10,
            lat: 10
          }
        };
      }
    });
    const selectEle = wrapper.find('.sm-component-coordinate-conversion__a-select');
    expect(selectEle.exists()).toBe(true);
    selectEle.vm.$emit('change', 'XY');
    expect(wrapper.vm.inputValue).toEqual('10°‎, 10°‎');
    const inputEle = wrapper.find('.sm-component-coordinate-conversion__a-input');
    const e = {
      target: {
        value: 'M'
      }
    };
    inputEle.vm.$emit('blur', e);
    expect(wrapper.vm.coordinate).toEqual({ lat: NaN, lng: NaN });
  });

  it('change format to UTM', () => {
    wrapper = mount(SmCoordinateConversion, {
      data() {
        return {
          activeFormat: 'UTM',
          coordinate: {
            lng: 10,
            lat: 10
          }
        };
      }
    });
    const selectEle = wrapper.find('.sm-component-coordinate-conversion__a-select');
    expect(selectEle.exists()).toBe(true);
    selectEle.vm.$emit('change', 'UTM');
    expect(wrapper.vm.inputValue).toEqual('32P 609600 1105578');
    const inputEle = wrapper.find('.sm-component-coordinate-conversion__a-input');
    const e = {
      target: {
        value: 'M'
      }
    };
    inputEle.vm.$emit('blur', e);
    expect(wrapper.vm.coordinate).toEqual({ lat: NaN, lng: NaN });
  });

  it('change format to Mercator', () => {
    wrapper = mount(SmCoordinateConversion, {
      data() {
        return {
          activeFormat: 'Mercator',
          coordinate: {
            lng: 10,
            lat: 10
          }
        };
      }
    });
    const selectEle = wrapper.find('.sm-component-coordinate-conversion__a-select');
    expect(selectEle.exists()).toBe(true);
    selectEle.vm.$emit('change', 'Mercator');
    expect(wrapper.vm.inputValue).toEqual('1113194.908 1118889.975');
    const inputEle = wrapper.find('.sm-component-coordinate-conversion__a-input');
    const e = {
      target: {
        value: '10 10'
      }
    };
    inputEle.vm.$emit('blur', e);
    expect(wrapper.vm.coordinate).toEqual({ lat: 0.00008983152840993817, lng: 0.00008983152841195215 });
  });

  it('change format to DD', () => {
    wrapper = mount(SmCoordinateConversion, {
      data() {
        return {
          activeFormat: 'DD',
          coordinate: {
            lng: 10,
            lat: 10
          }
        };
      }
    });
    const selectEle = wrapper.find('.sm-component-coordinate-conversion__a-select');
    expect(selectEle.exists()).toBe(true);
    selectEle.vm.$emit('change', 'DD');
    const inputEle = wrapper.find('.sm-component-coordinate-conversion__a-input');
    const e = {
      target: {
        value: 'M'
      }
    };
    inputEle.vm.$emit('blur', e);
    expect(wrapper.vm.coordinate).toEqual({ lat: NaN, lng: NaN });
  });

  it('change format to DOM', () => {
    wrapper = mount(SmCoordinateConversion, {
      data() {
        return {
          activeFormat: 'DOM',
          coordinate: {
            lng: 10,
            lat: 10
          }
        };
      }
    });
    const selectEle = wrapper.find('.sm-component-coordinate-conversion__a-select');
    expect(selectEle.exists()).toBe(true);
    selectEle.vm.$emit('change', 'DOM');
    const inputEle = wrapper.find('.sm-component-coordinate-conversion__a-input');
    const e = {
      target: {
        value: 'M'
      }
    };
    inputEle.vm.$emit('blur', e);
    expect(wrapper.vm.coordinate).toEqual({ lat: NaN, lng: NaN });
  });

  it('change format to DMS', () => {
    wrapper = mount(SmCoordinateConversion, {
      data() {
        return {
          activeFormat: 'DMS',
          coordinate: {
            lng: 10,
            lat: 10
          }
        };
      }
    });
    const selectEle = wrapper.find('.sm-component-coordinate-conversion__a-select');
    expect(selectEle.exists()).toBe(true);
    selectEle.vm.$emit('change', 'DMS');
    const inputEle = wrapper.find('.sm-component-coordinate-conversion__a-input');
    const e = {
      target: {
        value: 'M'
      }
    };
    inputEle.vm.$emit('blur', e);
    expect(wrapper.vm.coordinate).toEqual({ lat: NaN, lng: NaN });
  });

  it('isCapture', () => {
    wrapper = mount(SmCoordinateConversion, {
      data() {
        return {
          activeFormat: 'DMS',
          coordinate: {
            lng: 10,
            lat: 10
          }
        };
      }
    });
    const selectEle = wrapper.find('.sm-component-coordinate-conversion__a-select');
    expect(selectEle.exists()).toBe(true);
    selectEle.vm.$emit('change', 'DMS');
    const inputEle = wrapper.find('.sm-component-coordinate-conversion__a-input');
    const e = {
      target: {
        value: 'M'
      }
    };
    inputEle.vm.$emit('blur', e);
    expect(wrapper.vm.coordinate).toEqual({ lat: NaN, lng: NaN });
  });

  it('change lib DOM DMS parseInt', () => {
    wrapper = mount(SmCoordinateConversion, {
      data() {
        return {
          activeFormat: 'DOM',
          coordinate: {
            lng: 10,
            lat: 10
          }
        };
      }
    });
    let res = wrapper.vm.getDOM({ lng: 10, lat: 10 });
    expect(res).toBe(`10° 0' N 10° 0' E`);
    res = wrapper.vm.getDMS({ lng: 10, lat: 10 });
    expect(res).toBe(`10° 0' 0" N 10° 0' 0" E`);
  });
  it('change lib DOM DMS float', () => {
    wrapper = mount(SmCoordinateConversion, {
      data() {
        return {
          activeFormat: 'DOM',
          coordinate: {
            lng: 10,
            lat: 10
          }
        };
      }
    });
    let res = wrapper.vm.getDOM({ lng: 116.4683933, lat: 40.0512234 });
    expect(res).toBe(`40° 3.073404' N 116° 28.103598' E`);
    res = wrapper.vm.getDMS({ lng: 116.4683933, lat: 40.0512234 });
    expect(res).toBe(`40° 3' 4.4042" N 116° 28' 6.2159" E`);
  });
  it('change lib Lnglat DOM DMS float', () => {
    wrapper = mount(SmCoordinateConversion, {
      data() {
        return {
          activeFormat: 'DOM',
          coordinate: {
            lng: 10,
            lat: 10
          }
        };
      }
    });
    let res = wrapper.vm.getCoorByDOM(`40° 3.073404' N 116° 28.103598' E`);
    expect(res.lng).toBe(116.4683933);
    expect(res.lat).toBe(40.0512234);
    res = wrapper.vm.getCoorByDMS(`40° 3' 4.4042" N 116° 28' 6.2159" E`);
    expect(res.lng).toBe(116.4683933);
    expect(res.lat).toBe(40.0512234);
  });
  it('change lib Lnglat DOM DMS', () => {
    wrapper = mount(SmCoordinateConversion, {
      data() {
        return {
          activeFormat: 'DOM',
          coordinate: {
            lng: 10,
            lat: 10
          }
        };
      }
    });
    let res = wrapper.vm.getCoorByDOM(`40° 0' N 116° 0' E`);
    expect(res.lng).toBe(116);
    expect(res.lat).toBe(40);
    res = wrapper.vm.getCoorByDMS(`40° 0' 0" N 116° 0' 0" E`);
    expect(res.lng).toBe(116);
    expect(res.lat).toBe(40);
  });
});
