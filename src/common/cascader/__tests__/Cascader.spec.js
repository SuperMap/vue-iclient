import { mount } from '@vue/test-utils';
import SmCascader from 'vue-iclient/src/common/cascader/Cascader.vue';


describe('Cascader.vue', () => {
    let wrapper;
    const propsData = {
        options: [
            {
                value: 'zhejiang',
                label: 'Zhejiang',
                children: [
                    {
                    value: 'hangzhou',
                    label: 'Hangzhou',
                    children: [
                        {
                        value: 'xihu',
                        label: 'West Lake'
                        }
                    ]
                    }
                ]
            },
            {
            value: 'jiangsu',
            label: 'Jiangsu',
            children: [
                {
                value: 'nanjing',
                label: 'Nanjing',
                children: [
                    {
                    value: 'zhonghuamen',
                    label: 'Zhong Hua Men'
                    }
                ]
                }
            ]
            }
        ],
        changeOnSelect: true
    };
    beforeEach(() => {
        wrapper = null;
    });

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
    });

    it('render default correctly', async () => {
        wrapper = mount(SmCascader, {propsData});
        expect(wrapper.find('.sm-component-cascader-picker').exists()).toBe(true);
        expect(wrapper.vm.changeOnSelect).toBe(true);
    });

    it('click', async () => {
        const changeFn = jest.fn();
        const value = ['zhejiang', 'hangzhou'];
        wrapper = mount(SmCascader, {propsData: {...propsData, change: changeFn}});
        wrapper.vm.$on('change', changeFn);
        wrapper.vm.$emit('change', value);
        await wrapper.vm.$nextTick();
        expect(changeFn).toHaveBeenCalledWith(value);
    });
});
