import { withKnobs, text, select } from '@storybook/addon-knobs';

export default { title: 'image', decorators: [withKnobs] };

export const BasicImage = () => ({
  props: {
    src: {
      default: text('src', 'https://iclient.supermap.io/img/whatsNewLandUse.png')
    }
  },
  template: '<sm-image style="width:600px; height:400px" v-bind="$props"></sm-image>'
});
BasicImage.story = {
  name: '图片'
};

export const RepeatImage = () => ({
  props: {
    repeat: {
      default: select('repeat', ['center', 'noRepeat', 'repeatX', 'repeatY', 'repeatXY'], 'center')
    },
    src: {
      default: text('src', 'https://iclient.supermap.io/img/whatsNewLandUse.png')
    }
  },
  template: '<sm-image style="width:600px; height:400px" v-bind="$props"></sm-image>'
});
RepeatImage.story = {
  name: '图片重复'
};

export const LinkImage = () => ({
  props: {
    src: {
      default: text('src', 'https://iclient.supermap.io/img/whatsNewLandUse.png')
    },
    href: {
      default: text('href', 'http://www.baidu.com')
    },
    target: {
      default: select('target', ['_self', '_blank', '_parent', '_top', 'framename'], '_self')
    }
  },
  template: '<sm-image style="width:600px; height:400px" v-bind="$props"></sm-image>'
});
LinkImage.story = {
  name: '带链接的图片'
};
