import debounce from 'lodash/debounce';
import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default { title: 'Basic Components/select' };

export const BasicSelect = () => ({
  mixins: [theme],
  template: `
  <div>
    <sm-select default-value="lucy" style="width: 120px">
      <sm-select-option value="jack">
        Jack
      </sm-select-option>
      <sm-select-option value="lucy">
        Lucy
      </sm-select-option>
      <sm-select-option value="disabled" disabled>
        Disabled
      </sm-select-option>
      <sm-select-option value="Yiminghe">
        yiminghe
      </sm-select-option>
    </sm-select>
    <sm-select default-value="lucy" style="width: 120px" disabled>
      <sm-select-option value="lucy">
        Lucy
      </sm-select-option>
    </sm-select>
    <sm-select default-value="lucy" style="width: 120px" loading>
      <sm-select-option value="lucy">
        Lucy
      </sm-select-option>
    </sm-select>
  </div>
  `
});
BasicSelect.story = {
  name: toI18n('basicComponent.basic')
};

export const SelectSize = () => ({
  data() {
    return {
      size: 'default'
    };
  },
  template: `
  <div>
    <sm-radio-group v-model="size">
      <sm-radio-button value="large">
        Large
      </sm-radio-button>
      <sm-radio-button value="default">
        Default
      </sm-radio-button>
      <sm-radio-button value="small">
        Small
      </sm-radio-button>
    </sm-radio-group>
    <br /><br />
    <sm-select :size="size" default-value="a1" style="width: 200px;margin:10px 0;">
      <sm-select-option v-for="i in 25" :key="(i + 9).toString(36) + i">
        {{ (i + 9).toString(36) + i }}
      </sm-select-option>
    </sm-select>
    <br />
    <sm-select
      mode="multiple"
      :size="size"
      placeholder="Please select"
      :default-value="['a1', 'b2']"
      style="width: 200px;margin:10px 0;"
    >
      <sm-select-option v-for="i in 25" :key="(i + 9).toString(36) + i">
        {{ (i + 9).toString(36) + i }}
      </sm-select-option>
    </sm-select>
    <br />
    <sm-select
      mode="tags"
      :size="size"
      placeholder="Please select"
      :default-value="['a1', 'b2']"
      style="width: 200px;margin:10px 0;"
    >
      <sm-select-option v-for="i in 25" :key="(i + 9).toString(36) + i">
        {{ (i + 9).toString(36) + i }}
      </sm-select-option>
    </sm-select>
  </div>
  `
});
SelectSize.story = {
  name: toI18n('basicComponent.select.size')
};

export const TagsSelect = () => ({
  template: `
  <sm-select mode="tags" style="width: 100%" placeholder="Tags Mode">
    <sm-select-option v-for="i in 25" :key="(i + 9).toString(36) + i">
      {{ (i + 9).toString(36) + i }}
    </sm-select-option>
  </sm-select>
  `
});
TagsSelect.story = {
  name: toI18n('basicComponent.select.tags')
};

export const ParticiplesSelect = () => ({
  template: `
  <sm-select mode="tags" style="width: 100%" :token-separators="[',']">
    <sm-select-option v-for="i in 25" :key="(i + 9).toString(36) + i">
      {{ (i + 9).toString(36) + i }}
    </sm-select-option>
  </sm-select>
  `
});
ParticiplesSelect.story = {
  name: toI18n('basicComponent.select.automaticTokenization')
};

export const SelectMore = () => ({
  template: `
  <sm-select
    mode="multiple"
    :default-value="['a1', 'b2']"
    style="width: 100%"
    placeholder="Please select"
  >
    <sm-select-option v-for="i in 25" :key="(i + 9).toString(36) + i">
      {{ (i + 9).toString(36) + i }}
    </sm-select-option>
  </sm-select>
  `
});
SelectMore.story = {
  name: toI18n('basicComponent.select.multipleSelection')
};

export const GroupSelect = () => ({
  template: `
  <sm-select default-value="lucy" style="width: 200px">
    <sm-select-opt-group>
      <span slot="label"><sm-icon type="user" />Manager</span>
      <sm-select-option value="jack">
        Jack
      </sm-select-option>
      <sm-select-option value="lucy">
        Lucy
      </sm-select-option>
    </sm-select-opt-group>
    <sm-select-opt-group label="Engineer">
      <sm-select-option value="Yiminghe">
        yiminghe
      </sm-select-option>
    </sm-select-opt-group>
  </sm-select>
  `
});
GroupSelect.story = {
  name: toI18n('basicComponent.select.optionGroup')
};

export const SearchSelect = () => ({
  methods: {
    filterOption(input, option) {
      return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    }
  },
  template: `
  <sm-select
    show-search
    placeholder="Select a person"
    option-filter-prop="children"
    style="width: 200px"
    :filter-option="filterOption"
  >
    <sm-select-option value="jack">
      Jack
    </sm-select-option>
    <sm-select-option value="lucy">
      Lucy
    </sm-select-option>
    <sm-select-option value="tom">
      Tom
    </sm-select-option>
  </sm-select>
  `
});
SearchSelect.story = {
  name: toI18n('basicComponent.select.withSearchField')
};

export const IconSelect = () => ({
  template: `
  <div>
    <sm-select default-value="lucy" style="width: 120px">
      <sm-icon style="padding:0px" slot="suffixIcon" type="smile" />
      <sm-select-option value="jack">
        Jack
      </sm-select-option>
      <sm-select-option value="lucy">
        Lucy
      </sm-select-option>
      <sm-select-option value="disabled" disabled>
        Disabled
      </sm-select-option>
      <sm-select-option value="Yiminghe">
        yiminghe
      </sm-select-option>
    </sm-select>
    <sm-select default-value="lucy" style="width: 120px" disabled>
      <sm-icon style="padding:0px" slot="suffixIcon" type="meh" />
      <sm-select-option value="lucy">
        Lucy
      </sm-select-option>
    </sm-select>
  </div>
  `
});
IconSelect.story = {
  name: toI18n('basicComponent.select.suffix')
};

let index = 0;
export const ExtendSelect = () => ({
  components: {
    VNodes: {
      functional: true,
      render: (h, ctx) => ctx.props.vnodes
    }
  },
  data: () => ({ items: ['jack', 'lucy'] }),
  methods: {
    addItem() {
      this.items.push(`New item ${index++}`);
    }
  },
  template: `
  <sm-select default-value="lucy" style="width: 120px">
    <div slot="dropdownRender" slot-scope="menu">
      <v-nodes :vnodes="menu" />
      <div style="width: 100%;height: 1px;background: #fff;"></div>
      <div
        style="padding: 4px 8px; cursor: pointer;"
        @mousedown="e => e.preventDefault()"
        @click="addItem"
      >
        <sm-icon type="plus" /> Add item
      </div>
    </div>
    <sm-select-option v-for="item in items" :key="item" :value="item">
      {{ item }}
    </sm-select-option>
  </sm-select>
  `
});
ExtendSelect.story = {
  name: toI18n('basicComponent.select.customDropdown')
};

export const TextSelect = () => ({
  template: `
  <sm-select
    label-in-value
    :default-value="{ key: 'lucy' }"
    style="width: 120px"
  >
    <sm-select-option value="jack">
      Jack (100)
    </sm-select-option>
    <sm-select-option value="lucy">
      Lucy (101)
    </sm-select-option>
  </sm-select>
  `
});
TextSelect.story = {
  name: toI18n('basicComponent.select.getValue')
};

const provinceData = ['Zhejiang', 'Jiangsu'];
const cityData = {
  Zhejiang: ['Hangzhou', 'Ningbo', 'Wenzhou'],
  Jiangsu: ['Nanjing', 'Suzhou', 'Zhenjiang']
};
export const LinkageSelect = () => ({
  data() {
    return {
      provinceData,
      cityData,
      cities: cityData[provinceData[0]],
      secondCity: cityData[provinceData[0]][0]
    };
  },
  methods: {
    handleProvinceChange(value) {
      this.cities = cityData[value];
      this.secondCity = cityData[value][0];
    }
  },
  template: `
  <div>
    <sm-select :default-value="provinceData[0]" style="width: 120px" @change="handleProvinceChange">
      <sm-select-option v-for="province in provinceData" :key="province">
        {{ province }}
      </sm-select-option>
    </sm-select>
    <sm-select v-model="secondCity" style="width: 120px">
      <sm-select-option v-for="city in cities" :key="city">
        {{ city }}
      </sm-select-option>
    </sm-select>
  </div>
   `
});
LinkageSelect.story = {
  name: toI18n('basicComponent.select.coordinate')
};

export const SearchUserSelect = () => ({
  data() {
    this.lastFetchId = 0;
    this.fetchUser = debounce(this.fetchUser, 800);
    return {
      data: [],
      value: [],
      fetching: false
    };
  },
  methods: {
    fetchUser(value) {
      console.log('fetching user', value);
      this.lastFetchId += 1;
      const fetchId = this.lastFetchId;
      this.data = [];
      this.fetching = true;
      fetch('https://randomuser.me/api/?results=5')
        .then(response => response.json())
        .then(body => {
          if (fetchId !== this.lastFetchId) {
            // for fetch callback order
            return;
          }
          const data = body.results.map(user => ({
            text: `${user.name.first} ${user.name.last}`,
            value: user.login.username
          }));
          this.data = data;
          this.fetching = false;
        });
    },
    handleChange(value) {
      Object.assign(this, {
        value,
        data: [],
        fetching: false
      });
    }
  },
  template: `
  <sm-select
    mode="multiple"
    label-in-value
    :value="value"
    placeholder="Select users"
    style="width: 100%"
    :filter-option="false"
    :not-found-content="fetching ? undefined : null"
    @search="fetchUser"
    @change="handleChange"
  >
    <sm-select-option v-for="d in data" :key="d.value">
      {{ d.text }}
    </sm-select-option>
  </sm-select>
  `
});
SearchUserSelect.story = {
  name: toI18n('basicComponent.select.searchUsers')
};

const OPTIONS = ['Apples', 'Nails', 'Bananas', 'Helicopters'];
export const HiddenSelect = () => ({
  data() {
    return {
      selectedItems: []
    };
  },
  computed: {
    filteredOptions() {
      return OPTIONS.filter(o => !this.selectedItems.includes(o));
    }
  },
  methods: {
    handleChange(selectedItems) {
      this.selectedItems = selectedItems;
    }
  },
  template: `
  <sm-select
    mode="multiple"
    placeholder="Inserted are removed"
    :value="selectedItems"
    style="width: 100%"
    @change="handleChange"
  >
    <sm-select-option v-for="item in filteredOptions" :key="item" :value="item">
      {{ item }}
    </sm-select-option>
  </sm-select>
  `
});
HiddenSelect.story = {
  name: toI18n('basicComponent.select.hideAlreadySelected')
};

export const LabelPropSelect = () => ({
  data() {
    return {
      value: ['china']
    };
  },
  template: `
  <sm-select
    v-model="value"
    mode="multiple"
    style="width: 100%"
    placeholder="select one country"
    option-label-prop="label"
  >
    <sm-select-option value="china" label="China">
      <span role="img" aria-label="China">
        🇨🇳
      </span>
      China (中国)
    </sm-select-option>
    <sm-select-option value="usa" label="USA">
      <span role="img" aria-label="USA">
        🇺🇸
      </span>
      USA (美国)
    </sm-select-option>
    <sm-select-option value="japan" label="Japan">
      <span role="img" aria-label="Japan">
        🇯🇵
      </span>
      Japan (日本)
    </sm-select-option>
    <sm-select-option value="korea" label="Korea">
      <span role="img" aria-label="Korea">
        🇰🇷
      </span>
      Korea (韩国)
    </sm-select-option>
  </sm-select>
  `
});
LabelPropSelect.story = {
  name: toI18n('basicComponent.select.customSelectionRender')
};
