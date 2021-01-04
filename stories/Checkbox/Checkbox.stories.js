import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default { title: 'Basic Components/checkbox' };

export const BasicCheckbox = () => ({
  mixins: [theme],
  template: `
  <sm-checkbox>Checkbox</sm-checkbox>
  `
});
BasicCheckbox.story = {
  name: toI18n('basicComponent.basic')
};

export const AllCheckbox = () => ({
  data() {
    return {
      checkedList: ['Apple', 'Orange'],
      indeterminate: true,
      checkAll: false,
      plainOptions: ['Apple', 'Pear', 'Orange']
    };
  },
  methods: {
    onChange(checkedList) {
      this.indeterminate = !!checkedList.length && checkedList.length < this.plainOptions.length;
      this.checkAll = checkedList.length === this.plainOptions.length;
    },
    onCheckAllChange(e) {
      Object.assign(this, {
        checkedList: e.target.checked ? this.plainOptions : [],
        indeterminate: false,
        checkAll: e.target.checked
      });
    }
  },
  template: `
  <div>
    <div :style="{ borderBottom: '1px solid #E9E9E9' }">
      <sm-checkbox :indeterminate="indeterminate" :checked="checkAll" v-on:change="onCheckAllChange">
        Check all
      </sm-checkbox>
    </div>
    <br />
    <sm-checkbox-group v-model="checkedList" :options="plainOptions" v-on:change="onChange" />
  </div>
  `
});
AllCheckbox.story = {
  name: toI18n('basicComponent.checkbox.checkAll')
};

export const CheckboxGroup = () => ({
  data() {
    return {
      plainOptions: ['Apple', 'Pear', 'Orange'],
      options: [
        { label: 'Apple', value: 'Apple' },
        { label: 'Pear', value: 'Pear' },
        { label: 'Orange', value: 'Orange' }
      ],
      optionsWithDisabled: [
        { value: 'Apple' },
        { label: 'Pear', value: 'Pear' },
        { label: 'Orange', value: 'Orange', disabled: false }
      ],
      value: []
    };
  },
  template: `
  <div>
    <sm-checkbox-group
      v-model="value"
      name="checkboxgroup"
      :options="plainOptions"
    />
    <br />
    <sm-checkbox-group :options="plainOptions" :default-value="['Apple']" />
    <br />
    <sm-checkbox-group :options="options" :value="['Pear']" />
    <br />
    <sm-checkbox-group
      :options="optionsWithDisabled"
      disabled
      :default-value="['Apple']"
    >
      <span slot="label" slot-scope="{ value }" style="color: red">{{ value }}</span>
    </sm-checkbox-group>
  </div>
  `
});
CheckboxGroup.story = {
  name: toI18n('basicComponent.checkbox.group')
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
      <sm-checkbox :checked="checked" :disabled="disabled" v-on:change="onChange">
        {{ label }}
      </sm-checkbox>
    </p>
    <p>
      <sm-button type="primary" size="small" v-on:click="toggleChecked">
        {{ !checked ? 'Check' : 'Uncheck' }}
      </sm-button>
      <sm-button :style="{ marginLeft: '10px' }" type="primary" size="small" v-on:click="toggleDisable">
        {{ !disabled ? 'Disable' : 'Enable' }}
      </sm-button>
    </p>
  </div>
  `
});
ControledCheckbox.story = {
  name: toI18n('basicComponent.checkbox.controlled')
};
