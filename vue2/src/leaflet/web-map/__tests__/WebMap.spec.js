import { mount, createLocalVue, config } from '@vue/test-utils';
import SmWebMap from '../WebMap.vue';
import { message } from 'ant-design-vue';
import flushPromises from 'flush-promises';
import Message from 'vue-iclient/src/common/message/index.js';

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

  it('webmap layercreatefailed', async done => {
    wrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      }
    });
    await flushPromises();
    expect(wrapper.vm.viewModel).not.toBeUndefined();
    const spyFn = jest.spyOn(Message, 'error');
    let errorMsg = 'test error';
    wrapper.vm.viewModel.triggerEvent('layercreatefailed', { error: new Error(errorMsg) });
    expect(spyFn).toHaveBeenCalledWith('webmap.getLayerInfoFailed');
    errorMsg = 'SAMPLE DATA is not supported';
    wrapper.vm.viewModel.triggerEvent('layercreatefailed', { error: errorMsg });
    expect(spyFn).toHaveBeenCalledWith('webmap.sampleDataNotSupport');
    done();
  });

  it('webmap mapcreatefailed', async done => {
    wrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      }
    });
    await flushPromises();
    expect(wrapper.vm.viewModel).not.toBeUndefined();
    const spyFn = jest.spyOn(Message, 'error');
    const errorMsg = 'test error';
    wrapper.vm.viewModel.triggerEvent('mapcreatefailed', { error: new Error(errorMsg) });
    expect(spyFn).toHaveBeenCalledWith(errorMsg);
    done();
  });

  it('webmap mvtnotsupport', async done => {
    wrapper = mount(SmWebMap, {
      localVue,
      propsData: {
        serverUrl: 'https://fakeiportal.supermap.io/iportal',
        mapId: '123'
      }
    });
    await flushPromises();
    expect(wrapper.vm.viewModel).not.toBeUndefined();
    const spyFn = jest.spyOn(Message, 'error');
    wrapper.vm.viewModel.triggerEvent('mvtnotsupport');
    expect(spyFn).toHaveBeenCalledWith('webmap.mvtNotSupport');
    done();
  });
});

