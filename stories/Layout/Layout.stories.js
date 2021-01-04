import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default { title: 'Basic Components/layout' };

export const BasicLayout = () => ({
  mixins: [theme],
  template: `
  <div style="text-align: center;">
    <sm-layout style="background: rgba(16, 142, 233, 1); color: #fff; min-height: 120px; line-height: 120px; margin-bottom: 48px;">
      <sm-layout-header style="background: #7dbcea; color: #fff;">Header</sm-layout-header>
      <sm-layout-content>Content</sm-layout-content>
      <sm-layout-footer style="background: #7dbcea; color: #fff; line-height: 1.5;">Footer</sm-layout-footer>
    </sm-layout>

    <sm-layout style="margin-bottom: 48px;">
      <sm-layout-header style="background: #7dbcea; color: #fff;">Header</sm-layout-header>
      <sm-layout style="background: rgba(16, 142, 233, 1); color: #fff; min-height: 120px; line-height: 120px;">
        <sm-layout-sider style="background: #3ba0e9; color: #fff; line-height: 120px;">Sider</sm-layout-sider>
        <sm-layout-content>Content</sm-layout-content>
      </sm-layout>
      <sm-layout-footer style="background: #7dbcea; color: #fff; line-height: 1.5;">Footer</sm-layout-footer>
    </sm-layout>

    <sm-layout style="margin-bottom: 48px;">
      <sm-layout-header style="background: #7dbcea; color: #fff;">Header</sm-layout-header>
      <sm-layout style="background: rgba(16, 142, 233, 1); color: #fff; min-height: 120px; line-height: 120px;">
        <sm-layout-content>Content</sm-layout-content>
        <sm-layout-sider style="background: #3ba0e9; color: #fff; line-height: 120px;">Sider</sm-layout-sider>
      </sm-layout>
      <sm-layout-footer style="background: #7dbcea; color: #fff; line-height: 1.5;">Footer</sm-layout-footer>
    </sm-layout>

    <sm-layout>
      <sm-layout-sider style="background: #3ba0e9; color: #fff; line-height: 120px;">Sider</sm-layout-sider>
      <sm-layout style="background: rgba(16, 142, 233, 1); color: #fff; min-height: 120px; line-height: 120px;">
        <sm-layout-header style="background: #7dbcea; color: #fff;">Header</sm-layout-header>
        <sm-layout-content>Content</sm-layout-content>
        <sm-layout-footer style="background: #7dbcea; color: #fff; line-height: 1.5;">Footer</sm-layout-footer>
      </sm-layout>
    </sm-layout>
  </div>
  `
});
BasicLayout.story = {
  name: toI18n('basicComponent.basic')
};
