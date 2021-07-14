import {
  mount
} from '@vue/test-utils';
import SmTransfer from '../Transfer.vue';
import SmSwitch from '../../switch/Switch.vue';

describe('Transfer.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  })

  it('render default correctly', () => {
    wrapper = mount({
      template: `
      <div>
      <sm-transfer
        :data-source="mockData"
        :titles="['Source', 'Target']"
        :target-keys="targetKeys"
        :selected-keys="selectedKeys"
        :render="item => item.title"
        :disabled="disabled"
        v-on:change="handleChange"
        v-on:selectChange="handleSelectChange"
      />
      <sm-switch
        un-checked-children="enabled"
        checked-children="disabled"
        :checked="disabled"
        style="margin-top: 16px"
        v-on:change="handleDisable"
      />
    </div>`,
      components: {
        SmTransfer,
        SmSwitch
      },
      data() {
        const mockData = [];
        for (let i = 0; i < 20; i++) {
          mockData.push({
            key: i.toString(),
            title: `content${i + 1}`,
            description: `description of content${i + 1}`,
            disabled: i % 3 < 1
          });
        }
        const oriTargetKeys = mockData.filter(item => +item.key % 3 > 1).map(item => item.key);
        return {
          mockData: mockData,
          targetKeys: oriTargetKeys,
          selectedKeys: ['1', '4'],
          disabled: false
        };
      },
      methods: {
        handleChange(nextTargetKeys, direction, moveKeys) {
          this.targetKeys = nextTargetKeys;
        },
        handleSelectChange(sourceSelectedKeys, targetSelectedKeys) {
          this.selectedKeys = [...sourceSelectedKeys, ...targetSelectedKeys];
        },
        handleDisable(disabled) {
          this.disabled = disabled;
        }
      },
    },
  )
  })
})