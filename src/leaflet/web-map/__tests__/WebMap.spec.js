import { mount, createLocalVue, config } from '@vue/test-utils';
import SmWebMap from '../WebMap.vue';
import { message } from 'ant-design-vue';
import L from '../../leaflet-wrapper';
import mockFetch from 'vue-iclient/test/unit/mocks/FetchRequest';
import iportal_serviceProxy from '../../../../test/unit/mocks/data/iportal_serviceProxy.json';
import flushPromises from 'flush-promises';
import uniqueLayer_point from 'vue-iclient/test/unit/mocks/data/WebMap/uniqueLayer_point';
import layerData from 'vue-iclient/test/unit/mocks/data/layerData';

const localVue = createLocalVue();
localVue.prototype.$message = message;

document.getElementsByClassName = () => {
  return [
    {
      style: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10
      }
    }
  ];
};

describe('WebMap.vue', () => {
  let wrapper;

  beforeAll(() => {
    config.mapLoad = false;
  });

  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    if (wrapper) {
      wrapper.destroy();
    }
  });

  afterAll(() => {
    config.mapLoad = true;
  });

  it('initial_serverUrl', async done => {
    wrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      }
    });
    await flushPromises();
    expect(wrapper.element.id).toEqual('map');
    expect(wrapper.vm.mapId).toBe('123');
    expect(wrapper.vm.serverUrl).toBe('https://fakeiportal.supermap.io/iportal');
    done();
  });

  it('webmap resize', async done => {
    wrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      }
    });
    await flushPromises();
    expect(wrapper.element.id).toEqual('map');
    const spyFn = jest.spyOn(wrapper.vm.viewModel, 'resize')
    await wrapper.vm.resize();
    expect(spyFn).toHaveBeenCalled();
    done();
  });
});
