import { mount, config } from '@vue/test-utils';
import SmFlyTo from '../FlyTo.vue';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';

describe('FlyTo.vue', () => {
  let wrapper;
  let mapWrapper;

  beforeAll(async () => {
    config.mapLoad = false;
    mapWrapper = await createEmptyMap();
  })

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
  })

  it('render', async done => {
    wrapper = mount(SmFlyTo, {
      propsData: {
        data: [
          [103.93303602365336, 33.04646925591396],
          [103.90771770744831, 33.163703206300525],
          [103.93169934861643, 33.25624201104978]
        ],
        flyOptions: {
          duration: 1500,
          zoom: 15,
          pitch: 60
        },
        mapTarget: 'map'
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('no data', async done => {
    wrapper = mount(SmFlyTo, {
      propsData: {
        flyOptions: {
          duration: 1500,
          zoom: 15,
          pitch: 60
        },
        mapTarget: 'map'
      }
    });
    await mapSubComponentLoaded(wrapper);
    expect(wrapper.vm.data).toBe(undefined);
    done();
  });

  it('change props', async done => {
    const newData = [[103.93303602365336, 33.04646925591396]];
    wrapper = mount(SmFlyTo, {
      propsData: {
        data: [
          [103.93303602365336, 33.04646925591396],
          [103.90771770744831, 33.163703206300525]
        ],
        mapTarget: 'map'
      }
    });
    await mapSubComponentLoaded(wrapper);
    wrapper.setProps({
      data: newData
    });
    expect(wrapper.vm.data).toBe(newData);
    done();
  });
});
