import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default { title: 'Basic Components/radio' };

export const BasicRadio = () => ({
  mixins: [theme],
  template: `
  <sm-radio>Radio</sm-radio>
  `
});
BasicRadio.story = {
  name: toI18n('basicComponent.basic')
};

export const DisabledRadio = () => ({
  data() {
    return {
      disabled: true
    };
  },
  methods: {
    toggleDisabled() {
      this.disabled = !this.disabled;
    }
  },
  template: `
  <div>
    <sm-radio :default-checked="false" :disabled="disabled">
      Disabled
    </sm-radio>
    <br />
    <sm-radio default-checked :disabled="disabled">
      Disabled
    </sm-radio>
    <div :style="{ marginTop: 20 }">
      <sm-button type="primary" v-on:click="toggleDisabled">
        Toggle disabled
      </sm-button>
    </div>
  </div>
  `
});
DisabledRadio.story = {
  name: toI18n('basicComponent.disabled')
};

export const RadioStyle = () => ({
  data() {
    return {
      value: 'a'
    };
  },
  template: `
  <div>
    <div>
      <sm-radio-group v-model="value" >
        <sm-radio-button value="a">
          Hangzhou
        </sm-radio-button>
        <sm-radio-button value="b">
          Shanghai
        </sm-radio-button>
        <sm-radio-button value="c">
          Beijing
        </sm-radio-button>
        <sm-radio-button value="d">
          Chengdu
        </sm-radio-button>
      </sm-radio-group>
    </div>
    <div :style="{ marginTop: '16px' }">
      <sm-radio-group default-value="a" >
        <sm-radio-button value="a">
          Hangzhou
        </sm-radio-button>
        <sm-radio-button value="b" disabled>
          Shanghai
        </sm-radio-button>
        <sm-radio-button value="c">
          Beijing
        </sm-radio-button>
        <sm-radio-button value="d">
          Chengdu
        </sm-radio-button>
      </sm-radio-group>
    </div>
    <div :style="{ marginTop: '16px' }">
      <sm-radio-group disabled default-value="a" >
        <sm-radio-button value="a">
          Hangzhou
        </sm-radio-button>
        <sm-radio-button value="b">
          Shanghai
        </sm-radio-button>
        <sm-radio-button value="c">
          Beijing
        </sm-radio-button>
        <sm-radio-button value="d">
          Chengdu
        </sm-radio-button>
      </sm-radio-group>
    </div>
  </div>
  `
});
RadioStyle.story = {
  name: toI18n('basicComponent.radio.style')
};

export const RadioButtomStyle = () => ({
  template: `
  <div>
    <div>
      <sm-radio-group default-value="a" button-style="solid">
        <sm-radio-button value="a">
          Hangzhou
        </sm-radio-button>
        <sm-radio-button value="b">
          Shanghai
        </sm-radio-button>
        <sm-radio-button value="c">
          Beijing
        </sm-radio-button>
        <sm-radio-button value="d">
          Chengdu
        </sm-radio-button>
      </sm-radio-group>
    </div>
    <div :style="{ marginTop: '16px' }">
      <sm-radio-group default-value="c" button-style="solid">
        <sm-radio-button value="a">
          Hangzhou
        </sm-radio-button>
        <sm-radio-button value="b" disabled>
          Shanghai
        </sm-radio-button>
        <sm-radio-button value="c">
          Beijing
        </sm-radio-button>
        <sm-radio-button value="d">
          Chengdu
        </sm-radio-button>
      </sm-radio-group>
    </div>
  </div>
  `
});
RadioButtomStyle.story = {
  name: toI18n('basicComponent.radio.solidButton')
};

export const VerticalRadioGroup = () => ({
  data() {
    return {
      value: 1,
      radioStyle: {
        display: 'block',
        height: '30px',
        lineHeight: '30px'
      }
    };
  },
  template: `
  <sm-radio-group v-model="value" >
    <sm-radio :style="radioStyle" :value="1">
      Option A
    </sm-radio>
    <sm-radio :style="radioStyle" :value="2">
      Option B
    </sm-radio>
    <sm-radio :style="radioStyle" :value="3">
      Option C
    </sm-radio>
    <sm-radio :style="radioStyle" :value="4">
      More...
      <sm-input v-if="value === 4" :style="{ width: 100, marginLeft: 10 }" />
    </sm-radio>
  </sm-radio-group>
  `
});
VerticalRadioGroup.story = {
  name: toI18n('basicComponent.radio.verticalRadioGroup')
};

export const RadioGroup = () => ({
  data() {
    return {
      plainOptions: ['Apple', 'Pear', 'Orange'],
      options: [{
        label: 'Apple',
        value: 'Apple'
      },
      {
        label: 'Pear',
        value: 'Pear'
      },
      {
        label: 'Orange',
        value: 'Orange'
      }
      ],
      optionsWithDisabled: [{
        label: 'Apple',
        value: 'Apple'
      },
      {
        label: 'Pear',
        value: 'Pear'
      },
      {
        label: 'Orange',
        value: 'Orange',
        disabled: false
      }
      ],
      value1: 'Apple',
      value2: 'Apple',
      value3: 'Apple'
    };
  },
  template: `
    <div>
    <sm-radio-group :options="plainOptions" :default-value="value1" />
    <br />
    <sm-radio-group v-model="value2" :options="options" />
    <br />
    <sm-radio-group v-model="value3" :options="optionsWithDisabled" disabled />
  </div>
  `
});
RadioGroup.story = {
  name: toI18n('basicComponent.radio.radioGroupOptional')
};

export const GroupRadioName = () => ({
  template: `
  <sm-radio-group name="radioGroup" :default-value="1">
    <sm-radio :value="1">
      A
    </sm-radio>
    <sm-radio :value="2">
      B
    </sm-radio>
    <sm-radio :value="3">
      C
    </sm-radio>
    <sm-radio :value="4">
      D
    </sm-radio>
  </sm-radio-group>
  `
});
GroupRadioName.story = {
  name: toI18n('basicComponent.radio.radioGroupWithName')
};

export const GroupRadio = () => ({
  data() {
    return {
      value: 1
    };
  },
  template: `
  <div>
    <sm-radio-group v-model="value" >
      <sm-radio :value="1">
        A
      </sm-radio>
      <sm-radio :value="2">
        B
      </sm-radio>
      <sm-radio :value="3">
        C
      </sm-radio>
      <sm-radio :value="4">
        D
      </sm-radio>
    </sm-radio-group>
  </div>
  `
});
GroupRadio.story = {
  name: toI18n('basicComponent.radio.radioGroup')
};

export const RadioSize = () => ({
  template: `
  <div>
    <div>
      <sm-radio-group default-value="a" size="large">
        <sm-radio-button value="a">
          Hangzhou
        </sm-radio-button>
        <sm-radio-button value="b">
          Shanghai
        </sm-radio-button>
        <sm-radio-button value="c">
          Beijing
        </sm-radio-button>
        <sm-radio-button value="d">
          Chengdu
        </sm-radio-button>
      </sm-radio-group>
    </div>
    <div :style="{ marginTop: '16px' }">
      <sm-radio-group default-value="a">
        <sm-radio-button value="a">
          Hangzhou
        </sm-radio-button>
        <sm-radio-button value="b">
          Shanghai
        </sm-radio-button>
        <sm-radio-button value="c">
          Beijing
        </sm-radio-button>
        <sm-radio-button value="d">
          Chengdu
        </sm-radio-button>
      </sm-radio-group>
    </div>
    <div :style="{ marginTop: '16px' }">
      <sm-radio-group default-value="a" size="small">
        <sm-radio-button value="a">
          Hangzhou
        </sm-radio-button>
        <sm-radio-button value="b">
          Shanghai
        </sm-radio-button>
        <sm-radio-button value="c">
          Beijing
        </sm-radio-button>
        <sm-radio-button value="d">
          Chengdu
        </sm-radio-button>
      </sm-radio-group>
    </div>
  </div>
  `
});
RadioSize.story = {
  name: toI18n('basicComponent.radio.size')
};
