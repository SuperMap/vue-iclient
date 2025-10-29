import { mount } from '@vue/test-utils';
import SmFeatureCascader from '../FeatureCascader.vue';
import SmCascader from 'vue-iclient/src/common/cascader/Cascader.vue';
import {FetchRequest} from 'vue-iclient/static/libs/iclient-common/iclient-common';
import flushPromises from 'flush-promises';
import {
  fakeQuxianDataServiceResult
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
        idField: "parent_cod",
        // 显示名称字段
        titleField: "parent_nam",
        children: {
            dataset: {
                url: dataUrl,
                dataName: ["quxian:quxian"],
                type: 'iServer',
            },
            parentField: "parent_cod",
            idField: "admin_code",
            titleField: "division_n"
        }
    }, propsData = {config, changeOnSelect: true};
    beforeEach(() => {
        wrapper = null;
        jest.spyOn(FetchRequest, 'post').mockImplementation((url, params) => {
            return Promise.resolve(new Response(JSON.stringify(fakeQuxianDataServiceResult)));
        });
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
        jest.resetAllMocks();
    });

    it('render default correctly', async () => {
        wrapper = mount(SmFeatureCascader, {propsData});
        await flushPromises();
        expect(wrapper.vm.datas.length).toBe(5);
        expect(wrapper.find('.sm-component-feature-cascader').exists()).toBe(true);
        wrapper.find('.sm-component-feature-cascader').trigger('click');
        expect(document.querySelectorAll('.sm-component-cascader-menu').length).toBe(1);
    });

    it('click', async () => {
        const changeFn = jest.fn();
        wrapper = mount(SmFeatureCascader, {propsData: {...propsData, change: changeFn}});
        wrapper.vm.$on('change', changeFn);
        await flushPromises();
        const cascader = wrapper.find(SmCascader);
        cascader.vm.$emit('change', ['3301']);
        await flushPromises();
        expect(changeFn).toHaveBeenCalled();
    });
});
