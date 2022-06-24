import { mount } from '@vue/test-utils';
import SmWebMap from '../../../WebMap.vue';
import SmLegend from '../Legend.vue';
import mockFetch from 'vue-iclient/test/unit/mocks/FetchRequest';
import iportal_serviceProxy from 'vue-iclient/test/unit/mocks/data/iportal_serviceProxy';
import uniqueLayer_point from 'vue-iclient/test/unit/mocks/data/WebMap/uniqueLayer_point';
import layerData from 'vue-iclient/test/unit/mocks/data/layerData';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';

describe('Legend.vue', () => {
  let wrapper;
  let mapWrapper;

  beforeEach(() => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_point,
      'https://fakeiportal.supermap.io/iportal/web/datas/676516522/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123': layerData
    };
    mockFetch(fetchResource);
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

  it('render default correctly', async done => {
    wrapper = mount(SmLegend, {
      propsData: {
        layerNames: ['民航数据'],
        mapTarget: 'map'
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });
});
