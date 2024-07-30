import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: `${toI18n('basicComponent.title')}/${toI18n('basicComponent.inputNumber.title')}`,
  id: 'BasicComponents/inputNumber'
};

export const BasicInputNumber = () => ({
  mixins: [theme],
  data() {
    return {
      value: 2
    };
  },
  template: `
  <div>
    <sm-input-number :min="1" :max="10" placeholder="Basic input"></sm-input-number>
    <sm-input-number :min="1" :max="10" v-model="value"></sm-input-number>
  </div>
    `
});
BasicInputNumber.story = {
  name: toI18n('basicComponent.basic')
};

export const SizeInputNumber = () => ({
  template: `
    <div>
      <sm-input-number size="large" :min="1" :max="100000" :default-value="3" />
      <sm-input-number :min="1" :max="100000" :default-value="3"/>
      <sm-input-number size="small" :min="1" :max="100000" :default-value="3" />
    </div>
    `
});
SizeInputNumber.story = {
  name: toI18n('basicComponent.inputNumber.size')
};

export const DisableInputNumber = () => ({
  template: `
        <sm-input-number :disabled="true" :min="1" :max="100000" :default-value="3" />
      `
});
DisableInputNumber.story = {
  name: toI18n('basicComponent.inputNumber.disabled')
};

export const FormatterInputNumber = () => ({
  computed: {
    formatterDollar() {
      return value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    formatterPercentage() {
      return value => `${value}%`;
    },
    parserDollar() {
      return value => value.replace(/\$\s?|(,*)/g, '');
    },
    parserPercentage() {
      return value => value.replace('%', '');
    }
  },
  template: `
  <div>
    <sm-input-number :min="1" :max="100000" :default-value="3" :formatter="formatterDollar" :parser="parserDollar"/>
    <sm-input-number :min="1" :max="100000" :default-value="3" :formatter="formatterPercentage" :parser="parserPercentage"/>
  </div>
        `
});
FormatterInputNumber.story = {
  name: toI18n('basicComponent.inputNumber.formatter')
};

export const DecimalInputNumber = () => ({
  template: `<sm-input-number :min="0" :max="10" :step="0.1" :default-value="3"/>`
});
DecimalInputNumber.story = {
  name: toI18n('basicComponent.inputNumber.decimal')
};

export const ErrorInputNumber = () => ({
  template: `<sm-input-number :error="true" :min="0" :max="10" :step="0.1" :default-value="3"/>`
});
ErrorInputNumber.story = {
  name: toI18n('basicComponent.inputNumber.error')
};
