import { mount } from '@vue/test-utils';
import SmCollapse from '../Collapse.vue';
import Collapse from '../index';
import SmCollapsePanel from '../Panel.vue';

describe('Collapse.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  });

  it('render default correctly', () => {
    const change = jest.fn();
    wrapper = mount(
      {
        template: `
      <sm-collapse :default-active-key="activeKey" :bordered="false" @change="change">
        <sm-collapse-panel key="1" header="This is panel header 1" :style="customStyle">
          <p>{{ text }}</p>
        </sm-collapse-panel>
        <sm-collapse-panel key="2" header="This is panel header 2" :style="customStyle">
          <p>{{ text }}</p>
        </sm-collapse-panel>
        <sm-collapse-panel key="3" header="This is panel header 3" :style="customStyle">
          <p>{{ text }}</p>
        </sm-collapse-panel>
      </sm-collapse>`,
        components: {
          SmCollapse,
          SmCollapsePanel
        },
        data() {
          return {
            text: `test`,
            customStyle: 'background: #f7f7f7;border-radius: 4px;',
            activeKey: 1
          };
        },
        methods: {
          change: change
        }
      },
      {
        sync: false
      }
    );
    const collapseItem = wrapper.findAll('.sm-component-collapse-item');
    const collapseItemActive = wrapper.findAll('.sm-component-collapse-item-active');
    const collapseHeader = wrapper.findAll('.sm-component-collapse-header');
    expect(collapseItem.length).toBe(3);
    expect(collapseItem.at(0).contains('.sm-component-collapse-item-active')).toBe(true);
    expect(collapseItemActive.length).toBe(1);
    collapseHeader.at(1).trigger('click');
    expect(change).toBeCalled();
  });

  it('render index correctly', () => {
    wrapper = mount(Collapse);
    expect(wrapper.find('.sm-component-collapse').exists()).toBe(true);
  });
});
