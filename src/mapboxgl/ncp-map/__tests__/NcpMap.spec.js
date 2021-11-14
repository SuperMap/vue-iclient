import { mount, config } from '@vue/test-utils';
import SmNcpMap from '../NcpMap.vue';
import mapboxgl from '@libs/mapboxgl/mapbox-gl-enhance.js';
import mockFetch from 'vue-iclient/test/unit/mocks/FetchRequest';
import uniqueLayer_point from 'vue-iclient/test/unit/mocks/data/WebMap/uniqueLayer_point';
import layerData from 'vue-iclient/test/unit/mocks/data/layerData';
import themeInfo from 'vue-iclient/test/unit/mocks/data/NcpMap/themeInfo';
import mapWrapperLoaded from 'vue-iclient/test/unit/mapWrapperLoaded.js';

const mapOptions = {
  container: 'map',
  center: {
    lng: 104.93846582803894,
    lat: 33.37080662210445
  },
  zoom: 3,
  bearing: 0,
  pitch: 0,
  interactive: true,
  style: {
    version: 8,
    sources: {
      中国地图: {
        type: 'raster',
        tiles: [
          'https://maptiles.supermapol.com/iserver/services/map_China/rest/maps/China_Dark/zxyTileImage.png?z={z}&x={x}&y={y}'
        ],
        tileSize: 256
      }
    },
    layers: [
      {
        id: '中国地图',
        source: '中国地图',
        type: 'raster',
        minzoom: 0,
        maxzoom: 22
      }
    ]
  },
  rasterTileSize: 256,
  preserveDrawingBuffer: true
};

describe('NcpMap.vue', () => {
  let wrapper;

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

  it('initial', async done => {
    const fetchResource = {
      'fakeurl.com': layerData,
      'fakethemeurl.com': uniqueLayer_point
    };
    mockFetch(fetchResource);
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmNcpMap, {
      propsData: {
        mapOptions,
        dataOptions: {
          name: '全省确诊人数',
          proxyUrl: '',
          url: ''
        }
      }
    });
    await mapWrapperLoaded(wrapper);
    expect(spy).toBeCalled();
    expect(wrapper.element.id).toEqual('map');
    done();
  });

  it('change props', async done => {
    const fetchResource = {
      'fakeurl.com': themeInfo,
      'fakethemeurl.com': themeInfo
    };
    mockFetch(fetchResource);
    const newMapOptions = {
      center: {
        lng: 10,
        lat: 30
      },
      zoom: 5,
      maxBounds: [],
      bearing: 10,
      pitch: 10
    };
    const newDataOptions = {
      url: 'fakeurl.com',
      themeUrl: 'fakethemeurl.com',
      name: 'newName',
      proxyUrl: 'newproxyUrl'
    };
    const spy = jest.spyOn(mapboxgl, 'Map');
    wrapper = mount(SmNcpMap, {
      propsData: {
        mapOptions,
        dataOptions: {
          name: '全省确诊人数',
          proxyUrl: '',
          url: ''
        }
      }
    });
    await mapWrapperLoaded(wrapper);
    expect(spy).toBeCalled();
    done();
    // wrapper.setProps({
    //   mapOptions: newMapOptions,
    //   dataOptions: newDataOptions
    // })
    // wrapper.vm.$nextTick(() => {
    //   expect(wrapper.vm.mapOptions.zoom).toBe(5);
    //   done();
    // })
  });
});
