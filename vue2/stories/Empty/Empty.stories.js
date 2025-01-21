import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: `${toI18n('basicComponent.title')}/${toI18n('basicComponent.empty.title')}`,
  id: 'BasicComponents/empty'
};

export const BasicEmpty = () => ({
  mixins: [theme],
  template: `
  <sm-empty />
  `
});
BasicEmpty.story = {
  name: toI18n('basicComponent.basic')
};

export const CustomEmpty = () => ({
  template: `
  <sm-empty
      image="https://iclient.supermap.io/dev/web/img/svg/logo.svg"
      :image-style="{
      height: '60px',
      }"
  >
      <span slot="description"> Customize <a href="#">Description</a> </span>
      <sm-button type="primary">
      Create Now
      </sm-button>
  </sm-empty>
  `
});
CustomEmpty.story = {
  name: toI18n('basicComponent.custom')
};

export const NoDescriptionEmpty = () => ({
  template: `
  <sm-empty :description="false"  />
  `
});
NoDescriptionEmpty.story = {
  name: toI18n('basicComponent.empty.noDescription')
};
