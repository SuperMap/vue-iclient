import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default { title: 'Basic Components/iframe' };

export const Iframe = () => ({
  mixins: [theme],
  template: `
  <sm-iframe style="width:100%; height:600px" src="https://www.baidu.com/"></sm-iframe>
  `
});
Iframe.story = {
  name: toI18n('basicComponent.basic')
};
