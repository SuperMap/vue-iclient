import { mount } from '@vue/test-utils';
import SmFeatureCascader from '../FeatureCascader.vue';
import SmCascader from 'vue-iclient/src/common/cascader/Cascader.vue';
import { FetchRequest } from 'vue-iclient/static/libs/iclient-common/iclient-common';
import flushPromises from 'flush-promises';
import {
  fakeQuxianDataServiceResult,
  fakeQuxianDataServiceFields
} from '@mocks/services';

describe('FeatureCascader.vue', () => {
  const dataUrl = 'http://ip:8090/iserver/services/data-quxian/rest/data';
  let wrapper, config = {
    // 数据服务地址
    dataset: {
      url: dataUrl,
      dataName: ["quxian:quxian"],
      type: 'iServer',
    },
    // 标识字段
    idField: "PARENT_COD",
    // 显示名称字段
    titleField: "PARENT_NAM",
    children: {
      dataset: {
        url: dataUrl,
        dataName: ["quxian:quxian"],
        type: 'iServer',
      },
      parentField: "PARENT_COD",
      idField: "ADMIN_CODE",
      titleField: "DIVISION_N"
    }
  }, propsData = { config, changeOnSelect: true };
  beforeEach(() => {
    wrapper = null;
    jest.spyOn(FetchRequest, 'get').mockImplementation((url, params) => {
      if (url.includes('fields?returnAll=true')) {
        return new Promise(resolve => {
          resolve(new Response(JSON.stringify(fakeQuxianDataServiceFields)));
        });
      }
    });
    jest.spyOn(FetchRequest, 'post').mockImplementation((url, params) => {
      return Promise.resolve(new Response(JSON.stringify(fakeQuxianDataServiceResult)));
    });
  });

  afterEach(async () => {
    if (wrapper) {
      wrapper.destroy();
    }
    await new Promise(resolve => setTimeout(resolve, 0));
    jest.resetAllMocks();
    jest.clearAllTimers();
  });

  it('render default correctly', async () => {
    wrapper = mount(SmFeatureCascader, { propsData });
    await flushPromises();
    expect(wrapper.vm.datas.length).toBe(5);
    expect(wrapper.find('.sm-component-feature-cascader').exists()).toBe(true);
    wrapper.find('.sm-component-feature-cascader').trigger('click');
    expect(document.querySelectorAll('.sm-component-cascader-menu').length).toBe(1);
  });

  it('click', async () => {
    const changeFn = jest.fn();
    wrapper = mount(SmFeatureCascader, { propsData: { ...propsData, change: changeFn } });
    wrapper.vm.$on('change', changeFn);
    await flushPromises();
    const cascader = wrapper.find(SmCascader);
    cascader.vm.$emit('change', ['3301']);
    await flushPromises();
    expect(changeFn).toHaveBeenCalled();
  });


  it('should initialize internalValue as empty array', () => {
    wrapper = mount(SmFeatureCascader, { propsData });
    expect(wrapper.vm.internalValue).toEqual([]);
  });

  it('should update internalValue when SmCascader emits change', async () => {
    wrapper = mount(SmFeatureCascader, { propsData });
    await flushPromises();
    const cascader = wrapper.find(SmCascader);
    cascader.vm.$emit('change', ['3301', '330102']);
    await flushPromises();
    expect(wrapper.vm.internalValue).toEqual(['3301', '330102']);
  });

  it('should clear internalValue when clearSelectOptions is called', async () => {
    wrapper = mount(SmFeatureCascader, { propsData });
    await flushPromises();
    const cascader = wrapper.find(SmCascader);
    cascader.vm.$emit('change', ['3301', '330102']);
    await flushPromises();

    expect(wrapper.vm.internalValue).toEqual(['3301', '330102']);

    wrapper.vm.clearSelectOptions();
    expect(wrapper.vm.internalValue).toEqual([]);
  });

  it('should work with empty internalValue', () => {
    wrapper = mount(SmFeatureCascader, { propsData });
    expect(wrapper.vm.internalValue).toEqual([]);
    wrapper.vm.clearSelectOptions();
    expect(wrapper.vm.internalValue).toEqual([]);
  });

  it('should be callable from parent component via ref', async () => {
    wrapper = mount(SmFeatureCascader, { propsData });
    await flushPromises();
    const cascader = wrapper.find(SmCascader);
    cascader.vm.$emit('change', ['3301', '330102', '330102001']);
    await flushPromises();

    expect(wrapper.vm.internalValue).toEqual(['3301', '330102', '330102001']);

    // Simulate parent calling the method via ref
    wrapper.vm.clearSelectOptions();
    expect(wrapper.vm.internalValue).toEqual([]);
  });

  it('onChange with empty value should emit change with empty array and null', async () => {
    const changeFn = jest.fn();
    wrapper = mount(SmFeatureCascader, { propsData: { ...propsData, change: changeFn } });
    wrapper.vm.$on('change', changeFn);
    await flushPromises();

    await wrapper.vm.onChange([]);

    expect(changeFn).toHaveBeenCalledWith([], null);
  });

  it('onChange with null value should emit change with empty array and null', async () => {
    const changeFn = jest.fn();
    wrapper = mount(SmFeatureCascader, { propsData: { ...propsData, change: changeFn } });
    wrapper.vm.$on('change', changeFn);
    await flushPromises();

    await wrapper.vm.onChange(null);

    expect(changeFn).toHaveBeenCalledWith([], null);
  });

  it('onChange with target not found should emit change with value and null', async () => {
    const changeFn = jest.fn();
    wrapper = mount(SmFeatureCascader, { propsData: { ...propsData, change: changeFn } });
    wrapper.vm.$on('change', changeFn);
    await flushPromises();

    await wrapper.vm.onChange(['non-existent-value']);

    expect(changeFn).toHaveBeenCalledWith(['non-existent-value'], null);
  });

  it('onChange with target found should emit change with value and first feature', async () => {
    const changeFn = jest.fn();
    wrapper = mount(SmFeatureCascader, { propsData: { ...propsData, change: changeFn } });
    wrapper.vm.$on('change', changeFn);
    await flushPromises();

    await wrapper.vm.onChange(['3301']);

    expect(changeFn).toHaveBeenCalled();
    const callArgs = changeFn.mock.calls[0];
    expect(callArgs[0]).toEqual(['3301']);
    expect(callArgs[1]).not.toBeNull();
  });

  it('onChange constructs correct attributeFilter for target', async () => {
    const changeFn = jest.fn();
    const postSpy = jest.spyOn(FetchRequest, 'post');
    wrapper = mount(SmFeatureCascader, { propsData: { ...propsData, change: changeFn } });
    wrapper.vm.$on('change', changeFn);
    await flushPromises();

    await wrapper.vm.onChange(['3301']);

    const lastCall = postSpy.mock.calls[postSpy.mock.calls.length - 1];
    console.log(lastCall);
    expect(lastCall[1]).toContain(`(\\\"parent_cod\\\" = '3301')`);
  });
});
