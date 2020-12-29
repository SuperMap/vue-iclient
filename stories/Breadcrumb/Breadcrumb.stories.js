import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default { title: 'Basic Components/breadcrumb' };

export const BasicBreadcrumb = () => ({
  mixins: [theme],
  template: `
  <sm-breadcrumb>
      <sm-breadcrumb-item>Home</sm-breadcrumb-item>
      <sm-breadcrumb-item><a href="">Application Center</a></sm-breadcrumb-item>
      <sm-breadcrumb-item><a href="">Application List</a></sm-breadcrumb-item>
      <sm-breadcrumb-item>An Application</sm-breadcrumb-item>
  </sm-breadcrumb>
  `
});
BasicBreadcrumb.story = {
  name: toI18n('basicComponent.basic')
};

export const IconBreadcrumb = () => ({
  template: `
  <sm-breadcrumb>
    <sm-breadcrumb-item href="">
      <sm-icon type="home" />
    </sm-breadcrumb-item>
    <sm-breadcrumb-item href="">
      <sm-icon type="user" />
      <span>Application List</span>
    </sm-breadcrumb-item>
    <sm-breadcrumb-item>
      Application
    </sm-breadcrumb-item>
  </sm-breadcrumb>
  `
});
IconBreadcrumb.story = {
  name: toI18n('basicComponent.breadcrum.withIcon')
};

export const SeparatorBreadcrumb = () => ({
  template: `
  <div>
    <sm-breadcrumb separator=">">
      <sm-breadcrumb-item>Home</sm-breadcrumb-item>
      <sm-breadcrumb-item href="">
        Application Center
      </sm-breadcrumb-item>
      <sm-breadcrumb-item href="">
        Application List
      </sm-breadcrumb-item>
      <sm-breadcrumb-item>An Application</sm-breadcrumb-item>
    </sm-breadcrumb>
    <sm-breadcrumb>
      <span slot="separator" style="color: red">></span>
      <sm-breadcrumb-item>Home</sm-breadcrumb-item>
      <sm-breadcrumb-item href="">
        Application Center
      </sm-breadcrumb-item>
      <sm-breadcrumb-item href="">
        Application List
      </sm-breadcrumb-item>
      <sm-breadcrumb-item>An Application</sm-breadcrumb-item>
    </sm-breadcrumb>
  </div>
  `
});
SeparatorBreadcrumb.story = {
  name: toI18n('basicComponent.breadcrum.attrSeparator')
};

export const CustomBreadcrumb = () => ({
  template: `
  <sm-breadcrumb separator="">
      <sm-breadcrumb-item>Location</sm-breadcrumb-item>
      <sm-breadcrumb-separator>:</sm-breadcrumb-separator>
      <sm-breadcrumb-item href="">
      Application Center
      </sm-breadcrumb-item>
      <sm-breadcrumb-separator />
      <sm-breadcrumb-item href="">
      Application List
      </sm-breadcrumb-item>
      <sm-breadcrumb-separator />
      <sm-breadcrumb-item>An Application</sm-breadcrumb-item>
  </sm-breadcrumb>
  `
});
CustomBreadcrumb.story = {
  name: toI18n('basicComponent.breadcrum.componentSeparator')
};
