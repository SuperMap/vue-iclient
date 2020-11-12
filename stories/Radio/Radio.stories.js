import { withKnobs } from '@storybook/addon-knobs';

export default { title: 'BasicComponent/radio', decorators: [withKnobs] };

export const BasicRadio = () => ({
  template: `<sm-radio>Radio</sm-radio>`
});
BasicRadio.story = {
  name: '基本单选框'
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
      <sm-button type="primary" @click="toggleDisabled">
        Toggle disabled
      </sm-button>
    </div>
  </div>
  `
});
DisabledRadio.story = {
  name: '不可用单选框'
};

export const RadioStyle = () => ({
  data() {
    return {
      value: 'a'
    };
  },
  methods: {
    onChange(e) {
      console.log(`checked = ${e.target.value}`);
    }
  },
  template: `
    <div>
    <div>
      <sm-radio-group v-model="value" @change="onChange">
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
      <sm-radio-group default-value="a" @change="onChange">
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
      <sm-radio-group disabled default-value="a" @change="onChange">
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
  name: '按钮样式'
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
  name: '填底的按钮样式'
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
  methods: {
    onChange(e) {
      console.log('radio checked', e.target.value);
    }
  },
  template: `
    <sm-radio-group v-model="value" @change="onChange">
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
  name: '垂直的RadioGroup'
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
  methods: {
    onChange1(e) {
      console.log('radio1 checked', e.target.value);
    },
    onChange2(e) {
      console.log('radio2 checked', e.target.value);
    },
    onChange3(e) {
      console.log('radio3 checked', e.target.value);
    }
  },
  template: `
    <div>
    <sm-radio-group :options="plainOptions" :default-value="value1" @change="onChange1" />
    <br />
    <sm-radio-group v-model="value2" :options="options" @change="onChange2" />
    <br />
    <sm-radio-group v-model="value3" :options="optionsWithDisabled" disabled @change="onChange3" />
  </div>
  `
});
RadioGroup.story = {
  name: 'RadioGroup组合'
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
  name: '单选组合_配合name使用'
};

export const GroupRadio = () => ({
  data() {
    return {
      value: 1
    };
  },
  methods: {
    onChange(e) {
      console.log('radio checked', e.target.value);
    }
  },
  template: `
  <div>
    <sm-radio-group v-model="value" @change="onChange">
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
  name: '单选组合'
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
  name: '大小组合'
};
