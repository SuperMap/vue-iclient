import { withKnobs } from '@storybook/addon-knobs';
import { toI18n } from '../../.storybook/lang';

export default { title: 'Basic/iframe', decorators: [withKnobs] };

export const Iframe = () => ({
  template: `
  <sm-iframe style="width:100%; height:600px" src="https://www.baidu.com/"></sm-iframe>
  `
});
Iframe.story = {
  name: toI18n('basicComponent.basic')
};
