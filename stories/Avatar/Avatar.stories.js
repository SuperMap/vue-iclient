import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default { title: 'Basic Components/avatar' };

export const BasicAvatar = () => ({
  mixins: [theme],
  template: `
  <div>
    <div>
      <sm-avatar :size="64" icon="user" />
      <sm-avatar size="large" icon="user" />
      <sm-avatar icon="user" />
      <sm-avatar size="small" icon="user" />
    </div>
    <br />
    <div>
      <sm-avatar shape="square" :size="64" icon="user" />
      <sm-avatar shape="square" size="large" icon="user" />
      <sm-avatar shape="square" icon="user" />
      <sm-avatar shape="square" size="small" icon="user" />
    </div>
  </div>`
});
BasicAvatar.story = {
  name: toI18n('basicComponent.basic')
};

export const AvatarType = () => ({
  template: `
  <div>
    <sm-avatar icon="user" />
    <sm-avatar>
      <sm-icon slot="icon" type="user" />
    </sm-avatar>
    <sm-avatar>U</sm-avatar>
    <sm-avatar>USER</sm-avatar>
    <sm-avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
    <sm-avatar style="color: #f56a00; backgroundColor: #fde3cf">
      U
    </sm-avatar>
    <sm-avatar style="backgroundColor:#87d068" icon="user" />
  </div>
  `
});
AvatarType.story = {
  name: toI18n('basicComponent.avatar.type')
};

const UserList = ['U', 'Lucy', 'Tom', 'Edward'];
const colorList = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae'];
export const AvatarSize = () => ({
  data() {
    return {
      avatarValue: UserList[0],
      color: colorList[0]
    };
  },
  methods: {
    changeValue() {
      const index = UserList.indexOf(this.avatarValue);
      this.avatarValue = index < UserList.length - 1 ? UserList[index + 1] : UserList[0];
      this.color = index < colorList.length - 1 ? colorList[index + 1] : colorList[0];
    }
  },
  template: `
  <div>
    <sm-avatar
      shape="square"
      size="large"
      :style="{ backgroundColor: color, verticalAlign: 'middle' }"
    >
      {{ avatarValue }}
    </sm-avatar>
    <sm-button
      type="primary"
      size="small"
      :style="{ marginLeft: 16, verticalAlign: 'middle' }"
      v-on:click="changeValue"
    >
      改变
    </sm-button>
  </div>
  `
});
AvatarSize.story = {
  name: toI18n('basicComponent.avatar.autosetFontSize')
};
