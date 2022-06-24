import { mount, config } from '@vue/test-utils';
import SmUniqueThemeLayer from '../UniqueThemeLayer.vue';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';

describe('UniqueThemeLayer.vue', () => {
  let wrapper;
  let mapWrapper;
  let data = [
    {
      geometry: {
        type: 'Point',
        coordinates: [122.36999999999999, 53.470000000000006]
      },
      properties: {
        站台: '漠河',
        省份: '黑龙江',
        海拔: '296'
      },
      type: 'Feature'
    }
  ];
  let options = {
    themeField: 'LANDTYPE',
    styleGroups: [
      {
        value: '沼泽',
        style: {
          fillColor: '#2F4F4F'
        }
      },
      {
        value: '缺省风格',
        style: {
          fillColor: '#ABABAB'
        }
      }
    ]
  };

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

  it('render default correctly', async done => {
    wrapper = mount(SmUniqueThemeLayer, {
      propsData: {
        mapTarget: 'map',
        options: options,
        data: data
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('change props', async done => {
    let newData = [
      {
        geometry: {
          type: 'Point',
          coordinates: [122.36999999999999, 53.470000000000006]
        },
        properties: {
          海拔: '296'
        },
        type: 'Feature'
      }
    ];
    let newOptions = {
      themeField: 'LANDTYPE',
      styleGroups: [
        {
          value: '缺省风格',
          style: {
            fillColor: '#ABABAB'
          }
        }
      ]
    };
    wrapper = mount(SmUniqueThemeLayer, {
      propsData: {
        mapTarget: 'map',
        options: options,
        data: data
      }
    });
    await mapSubComponentLoaded(wrapper);
    await wrapper.setProps({
      data: newData,
      options: newOptions
    });
    expect(wrapper.vm.options.styleGroups.length).toBe(1);
    done();
  });
});
