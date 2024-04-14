import { mount } from '@vue/test-utils';
import SmMiniMap from '../MiniMap.vue';
import mockFetch from 'vue-iclient/test/unit/mocks/FetchRequest';
import iportal_serviceProxy from 'vue-iclient/test/unit/mocks/data/iportal_serviceProxy';
import uniqueLayer_point from 'vue-iclient/test/unit/mocks/data/WebMap/uniqueLayer_point';
import layerData from 'vue-iclient/test/unit/mocks/data/layerData';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap';

describe('MiniMap.vue', () => {
  let wrapper;
  let mapWrapper;
  beforeEach(async () => {
    const fetchResource = {
      'https://fakeiportal.supermap.io/iportal/web/config/portal.json': iportal_serviceProxy,
      'https://fakeiportal.supermap.io/iportal/web/maps/123/map.json': uniqueLayer_point,
      'https://fakeiportal.supermap.io/iportal/web/datas/676516522/content.json?pageSize=9999999&currentPage=1&parentResType=MAP&parentResId=123': layerData
    };
    mockFetch(fetchResource);
    mapWrapper = await createEmptyMap({
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      }
    });
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

  it('render default correctly', done => {
    wrapper = mount(SmMiniMap, {
      propsData: {
        mapTarget: 'map'
      }
    });
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });
});
