import { mount, config } from '@vue/test-utils';
import SmTdtMapSwitcher from '../TdtMapSwitcher.vue';
import createEmptyMap from 'vue-iclient/test/unit/createEmptyMap.js';
import mapSubComponentLoaded from 'vue-iclient/test/unit/mapSubComponentLoaded.js';

describe('TdtMapSwitcher.vue', () => {
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

  it('render', async done => {
    wrapper = mount(SmTdtMapSwitcher, {
      propsData: {
        mapTarget: 'map',
        collapsed: false,
        data: {
          select: 'img',
          label: false,
          tk: '1d109683f4d84198e37a38c442d68311'
        }
      }
    });
    await mapSubComponentLoaded(wrapper);
    const tdtItem = wrapper.find('.layer-item.map-item');
    expect(tdtItem.exists()).toBe(true);
    tdtItem.trigger('click');
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });

  it('change token', async done => {
    wrapper = mount(SmTdtMapSwitcher, {
      propsData: {
        mapTarget: 'map',
        data: {
          select: '',
          label: false,
          tk: '1d109683f4d84198e37a38c442d68311'
        }
      }
    });
    await mapSubComponentLoaded(wrapper);
    const newTk = '22309683f4d84198e37a38c442d55555';
    const setTkSpy = jest.spyOn(wrapper.vm.viewModel, 'setTk');
    await wrapper.setProps({
      data: {
        tk: newTk
      }
    });
    expect(setTkSpy).toBeCalled();
    expect(wrapper.vm.mapTarget).toBe('map');
    done();
  });
});
