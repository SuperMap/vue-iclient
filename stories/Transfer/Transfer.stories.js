import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default { title: 'Basic Components/transfer' };

export const BasicTransfer = () => ({
  mixins: [theme],
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
      mockData,
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
  </div>
  `
});
BasicTransfer.story = {
  name: toI18n('basicComponent.basic')
};

export const SearchTransfer = () => ({
  data() {
    return {
      mockData: [],
      targetKeys: []
    };
  },
  mounted() {
    this.getMock();
  },
  methods: {
    getMock() {
      const targetKeys = [];
      const mockData = [];
      for (let i = 0; i < 20; i++) {
        const data = {
          key: i.toString(),
          title: `content${i + 1}`,
          description: `description of content${i + 1}`,
          chosen: Math.random() * 2 > 1
        };
        if (data.chosen) {
          targetKeys.push(data.key);
        }
        mockData.push(data);
      }
      this.mockData = mockData;
      this.targetKeys = targetKeys;
    },
    filterOption(inputValue, option) {
      return option.description.indexOf(inputValue) > -1;
    },
    handleChange(targetKeys, direction, moveKeys) {
      console.log(targetKeys, direction, moveKeys);
      this.targetKeys = targetKeys;
    }
  },
  template: `
  <sm-transfer
    :data-source="mockData"
    show-search
    :filter-option="filterOption"
    :target-keys="targetKeys"
    :render="item => item.title"
    v-on:change="handleChange"
  />
  `
});
SearchTransfer.story = {
  name: toI18n('basicComponent.transfer.search')
};

export const SeniorTransfer = () => ({
  data() {
    return {
      mockData: [],
      targetKeys: []
    };
  },
  mounted() {
    this.getMock();
  },
  methods: {
    getMock() {
      const targetKeys = [];
      const mockData = [];
      for (let i = 0; i < 20; i++) {
        const data = {
          key: i.toString(),
          title: `content${i + 1}`,
          description: `description of content${i + 1}`,
          chosen: Math.random() * 2 > 1
        };
        if (data.chosen) {
          targetKeys.push(data.key);
        }
        mockData.push(data);
      }
      this.mockData = mockData;
      this.targetKeys = targetKeys;
    },
    handleChange(targetKeys, direction, moveKeys) {
      this.targetKeys = targetKeys;
    },
    renderItem(item) {
      const customLabel = item.title + '-' + item.description;
      return {
        label: customLabel, // for displayed item
        value: item.title // for title and filter matching
      };
    }
  },
  template: `
  <sm-transfer
    :data-source="mockData"
    show-search
    :list-style="{
      width: '250px',
      height: '300px',
    }"
    :operations="['to right', 'to left']"
    :target-keys="targetKeys"
    :render="renderItem"
    v-on:change="handleChange"
  >
    <sm-button
      slot="footer"
      slot-scope="props"
      size="small"
      style="float:right;margin: 5px"
      v-on:click="getMock"
    >
      reload
    </sm-button>
    <span slot="notFoundContent">
      没数据
    </span>
  </sm-transfer>
  `
});
SeniorTransfer.story = {
  name: toI18n('basicComponent.transfer.advanced')
};

export const CustomRowTransfer = () => ({
  data() {
    return {
      mockData: [],
      targetKeys: []
    };
  },
  mounted() {
    this.getMock();
  },
  methods: {
    getMock() {
      const targetKeys = [];
      const mockData = [];
      for (let i = 0; i < 20; i++) {
        const data = {
          key: i.toString(),
          title: `content${i + 1}`,
          description: `description of content${i + 1}`,
          chosen: Math.random() * 2 > 1
        };
        if (data.chosen) {
          targetKeys.push(data.key);
        }
        mockData.push(data);
      }
      this.mockData = mockData;
      this.targetKeys = targetKeys;
    },
    renderItem(item) {
      const customLabel = item.title + '-' + item.description;
      return {
        label: customLabel, // for displayed item
        value: item.title // for title and filter matching
      };
    },
    handleChange(targetKeys, direction, moveKeys) {
      this.targetKeys = targetKeys;
    }
  },
  template: `
  <sm-transfer
    :data-source="mockData"
    :list-style="{
      width: '300px',
      height: '300px',
    }"
    :target-keys="targetKeys"
    :render="renderItem"
    v-on:change="handleChange"
  />
  `
});
CustomRowTransfer.story = {
  name: toI18n('basicComponent.transfer.customDatasource')
};
