import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default { title: 'Basic Components/switch' };

export const BasicSwitch = () => ({
  mixins: [theme],
  template: `
  <sm-switch default-checked/>
  `
});
BasicSwitch.story = {
  name: toI18n('basicComponent.basic')
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
    <sm-button type="primary" v-on:click="onToggle">
      Toggle disabled
    </sm-button>
  </div>
  `
});
DisabledSwitch.story = {
  name: toI18n('basicComponent.disabled')
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
  name: toI18n('basicComponent.switch.textIcon')
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
  name: toI18n('basicComponent.switch.size')
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
  name: toI18n('basicComponent.switch.loading')
};
