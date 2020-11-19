import { withKnobs } from '@storybook/addon-knobs';

export default { title: 'Basic/checkbox', decorators: [withKnobs] };

export const BasicCheckbox = () => ({
  template: `
  <sm-checkbox>Checkbox</sm-checkbox>
  `
});
BasicCheckbox.story = {
  name: '基本多选框多选框'
};

const plainOptions = ['Apple', 'Pear', 'Orange'];
const defaultCheckedList = ['Apple', 'Orange'];
export const AllCheckbox = () => ({
  data() {
    return {
      checkedList: defaultCheckedList,
      indeterminate: true,
      checkAll: false,
      plainOptions
    };
  },
  methods: {
    onChange(checkedList) {
      this.indeterminate = !!checkedList.length && checkedList.length < plainOptions.length;
      this.checkAll = checkedList.length === plainOptions.length;
    },
    onCheckAllChange(e) {
      Object.assign(this, {
        checkedList: e.target.checked ? plainOptions : [],
        indeterminate: false,
        checkAll: e.target.checked
      });
    }
  },
  template: `
    <div>
    <div :style="{ borderBottom: '1px solid #E9E9E9' }">
      <sm-checkbox :indeterminate="indeterminate" :checked="checkAll" @change="onCheckAllChange">
        Check all
      </sm-checkbox>
    </div>
    <br />
    <sm-checkbox-group v-model="checkedList" :options="plainOptions" @change="onChange" />
  </div>
  `
});
AllCheckbox.story = {
  name: '全选多选框'
};

const options = [
  { label: 'Apple', value: 'Apple' },
  { label: 'Pear', value: 'Pear' },
  { label: 'Orange', value: 'Orange' }
];
const optionsWithDisabled = [
  { value: 'Apple' },
  { label: 'Pear', value: 'Pear' },
  { label: 'Orange', value: 'Orange', disabled: false }
];
export const CheckboxGroup = () => ({
  data() {
    return {
      plainOptions,
      options,
      optionsWithDisabled,
      value: []
    };
  },
  methods: {
    onChange(checkedValues) {
      console.log('checked = ', checkedValues);
      console.log('value = ', this.value);
    }
  },
  template: `
    <div>
    <sm-checkbox-group
      v-model="value"
      name="checkboxgroup"
      :options="plainOptions"
      @change="onChange"
    />
    <br />
    <sm-checkbox-group :options="plainOptions" :default-value="['Apple']" @change="onChange" />
    <br />
    <sm-checkbox-group :options="options" :value="['Pear']" @change="onChange" />
    <br />
    <sm-checkbox-group
      :options="optionsWithDisabled"
      disabled
      :default-value="['Apple']"
      @change="onChange"
    >
      <span slot="label" slot-scope="{ value }" style="color: red">{{ value }}</span>
    </sm-checkbox-group>
  </div>
  `
});
CheckboxGroup.story = {
  name: 'Checkbox组'
};

export const ControledCheckbox = () => ({
  data() {
    return {
      checked: true,
      disabled: false
    };
  },
  computed: {
    label() {
      const { checked, disabled } = this;
      return `${checked ? 'Checked' : 'Unchecked'}-${disabled ? 'Disabled' : 'Enabled'}`;
    }
  },
  methods: {
    toggleChecked() {
      this.checked = !this.checked;
    },
    toggleDisable() {
      this.disabled = !this.disabled;
    },
    onChange(e) {
      this.checked = e.target.checked;
    }
  },
  template: `
    <div>
    <p :style="{ marginBottom: '20px' }">
      <sm-checkbox :checked="checked" :disabled="disabled" @change="onChange">
        {{ label }}
      </sm-checkbox>
    </p>
    <p>
      <sm-button type="primary" size="small" @click="toggleChecked">
        {{ !checked ? 'Check' : 'Uncheck' }}
      </sm-button>
      <sm-button :style="{ marginLeft: '10px' }" type="primary" size="small" @click="toggleDisable">
        {{ !disabled ? 'Disable' : 'Enable' }}
      </sm-button>
    </p>
  </div>
  `
});
ControledCheckbox.story = {
  name: '受控的checkbox'
};
