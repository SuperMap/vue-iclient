import {
  toI18n
} from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: 'Basic Components/slider'
};

export const BasicSlider = () => ({
  mixins: [theme],
  data() {
    return {
      disabled: false
    };
  },
  methods: {
    handleDisabledChange(disabled) {
      this.disabled = disabled;
    }
  },
  template: `
  <div>
    <sm-slider id="test" :default-value="30" :disabled="disabled" />
    <sm-slider range :default-value="[20, 50]" :disabled="disabled" />
    Disabled: <sm-switch size="small" :checked="disabled" @change="handleDisabledChange" />
  </div>
  `
});
BasicSlider.story = {
  name: toI18n('basicComponent.basic')
};

export const IconSlider = () => ({
  data() {
    return {
      value: 0,
      min: 0,
      max: 20
    };
  },
  computed: {
    preColor() {
      const {
        max,
        min,
        value
      } = this;
      const mid = ((max - min) / 2).toFixed(5);
      return value >= mid ? '' : 'rgba(0, 0, 0, .45)';
    },
    nextColor() {
      const {
        max,
        min,
        value
      } = this;
      const mid = ((max - min) / 2).toFixed(5);
      return value >= mid ? 'rgba(0, 0, 0, .45)' : '';
    }
  },
  methods: {
    handleChange(value) {
      this.value = value;
    }
  },
  template: `
  <div style="position: relative; padding: 0px 30px;">
    <sm-icon :style="{ color: preColor, position: 'absolute', top: '-2px', left: '0', width: '16px', height: '16px', fontSize: '16px'}" type="frown-o" />
    <sm-slider :min="0" :max="20" :value="value" v-on:change="handleChange" />
    <sm-slider v-model="value" :min="0" :max="20" />
    <sm-icon :style="{ color: nextColor, position: 'absolute', top: '-2px', right: '0', width: '16px', height: '16px', fontSize: '16px'}" type="smile-o" />
  </div>
    `
});
IconSlider.story = {
  name: toI18n('basicComponent.slider.icon')
};

export const VerticalSlider = () => ({
  data() {
    return {
      marks: {
        0: '0°C',
        26: '26°C',
        37: '37°C',
        100: {
          style: {
            color: '#f50'
          },
          label: '100° C'
        }
      }
    };
  },
  methods: {
    handleDisabledChange(disabled) {
      this.disabled = disabled;
    }
  },
  template: `
  <div style="height: 300px">
    <div style="display: inline-block;height: 300px;marginLeft: 70px">
      <sm-slider vertical :default-value="30" />
    </div>
    <div style="display: inline-block;height: 300px;marginLeft: 70px">
      <sm-slider vertical range :step="10" :default-value="[20, 50]" />
    </div>
    <div style="display: inline-block;height: 300px;marginLeft: 70px">
      <sm-slider vertical range :marks="marks" :default-value="[26, 37]" />
    </div>
  </div>
    `
});
VerticalSlider.story = {
  name: toI18n('basicComponent.slider.vertical')
};

export const ReverseSlider = () => ({
  data() {
    return {
      reverse: true
    };
  },
  methods: {
    handleReverseChange(reverse) {
      this.reverse = reverse;
    }
  },
  template: `
  <div>
    <sm-slider :default-value="30" :reverse="reverse" />
    <sm-slider range :default-value="[20, 50]" :reverse="reverse" />
    Reversed: <sm-switch size="small" :checked="reverse" @change="handleReverseChange" />
  </div>
    `
});
ReverseSlider.story = {
  name: toI18n('basicComponent.slider.reverse')
};

export const WithNumberSlider = () => ({
  data() {
    return {
      inputValue: 0,
      inputValue1: 1
    };
  },
  template: `
  <div>
    <div>
      <sm-slider style="width: 750px;float: left" v-model="inputValue1" :min="1" :max="20" />
      <sm-input-number v-model="inputValue1" :min="1" :max="20" style="marginLeft: 16px" />
    </div>
    <div>
      <sm-slider style="width: 750px;float: left" v-model="inputValue" :min="0" :max="1" :step="0.01" />
      <sm-input-number
        v-model="inputValue"
        :min="0"
        :max="1"
        :step="0.01"
        style="marginLeft: 16px"
      />
    </div>
  </div>
    `
});
WithNumberSlider.story = {
  name: toI18n('basicComponent.slider.withNumber')
};

export const CustomTipSlider = () => ({
  data() {
    return {
      disabled: false
    };
  },
  methods: {
    formatter(value) {
      return `${value}%`;
    }
  },
  template: `
  <div>
    <sm-slider :tip-formatter="formatter" />
    <sm-slider :tip-formatter="null" />
  </div>
    `
});
CustomTipSlider.story = {
  name: toI18n('basicComponent.slider.customTip')
};

export const GradutedSlider = () => ({
  data() {
    return {
      marks: {
        0: '0°C',
        26: '26°C',
        37: '37°C',
        100: {
          style: {
            color: '#f50'
          },
          label: '100°C'
        }
      }
    };
  },
  methods: {
    formatter(value) {
      return `${value}%`;
    }
  },
  template: `
  <div>
    <h4 style="margin: 0 0 16px;">included=true</h4>
    <sm-slider style="margin-bottom: 44px;" :marks="marks" :default-value="37" />
    <sm-slider style="margin-bottom: 44px;" range :marks="marks" :default-value="[26, 37]" />

    <h4 style="margin: 0 0 16px;">included=false</h4>
    <sm-slider style="margin-bottom: 44px;" :marks="marks" :included="false" :default-value="37" />

    <h4 style="margin: 0 0 16px;">marks & step</h4>
    <sm-slider style="margin-bottom: 44px;" :marks="marks" :step="10" :default-value="37" />

    <h4 style="margin: 0 0 16px;">step=null</h4>
    <sm-slider style="margin-bottom: 44px;" :marks="marks" :step="null" :default-value="37" />
  </div>
    `
});
GradutedSlider.story = {
  name: toI18n('basicComponent.slider.graduted')
};

export const ControlTipSlider = () => ({
  template: `
  <sm-slider :default-value="30" :tooltip-visible="true" />
  `
});
ControlTipSlider.story = {
  name: toI18n('basicComponent.slider.controlTip')
};
