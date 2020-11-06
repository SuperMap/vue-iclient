import { withKnobs } from '@storybook/addon-knobs';

export default { title: 'BasicComponent/switch', decorators: [withKnobs] };

export const BasicSwitch = () => ({
  template: '<sm-switch default-checked/>'
});
BasicSwitch.story = {
  name: '基本开关'
};

export const DisabledSwitch = () => ({
  data() {
    return {
      disabled: true
    };
  },
  methods: {
    onToggle() {
      this.disabled = !this.disabled;
    }
  },
  template: `
  <div>
    <sm-switch default-checked :disabled="disabled" style="margin-bottom:5px" />
    <br />
    <sm-button type="primary" @click="onToggle">
      Toggle disabled
    </sm-button>
  </div>
    `
});
DisabledSwitch.story = {
  name: '不可用开关'
};

export const IconSwitch = () => ({
  template: `
    <div>
    <sm-switch style="margin:10px 0" checked-children="开" un-checked-children="关" default-checked />
    <br />
    <sm-switch checked-children="1" un-checked-children="0" />
    <br />
    <sm-switch style="margin:10px 0" default-checked>
      <sm-icon slot="checkedChildren" type="check" :iconStyle="{color:'#fff'}" />
      <sm-icon slot="unCheckedChildren" type="close" :iconStyle="{color:'#fff'}" />
    </sm-switch>
  </div>
  `
});
IconSwitch.story = {
  name: '带文字和图标的开关'
};

export const SwitchSize = () => ({
  template: `
 <div>
    <sm-switch default-checked />
    <br />
    <sm-switch size="small" default-checked />
  </div>
  `
});
SwitchSize.story = {
  name: '两种大小开关'
};

export const LoadingSwitch = () => ({
  template: `
  <div>
    <sm-switch loading default-checked />
    <br />
    <sm-switch size="small" loading />
  </div>
  `
});
LoadingSwitch.story = {
  name: '加载中开关'
};
