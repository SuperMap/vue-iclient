import { withKnobs } from '@storybook/addon-knobs';
import { Empty } from 'ant-design-vue';

export default { title: 'Basic/empty', decorators: [withKnobs] };

export const BasicEmpty = () => ({
  template: `
    <sm-empty />
  `
});
BasicEmpty.story = {
  name: '基本的空状态',
  parameters: {
    info: {
      text: `
        description or documentation about my component, supports markdown
    
        ~~~js
        <Button>Click Here</Button>
        ~~~
      `
    }
  }
};

export const CustomEmpty = () => ({
  template: `
    <sm-empty
        image="https://gw.alipayobjects.com/mdn/miniapp_social/afts/img/A*pevERLJC9v0AAAAAAAAAAABjAQAAAQ/original"
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
  name: '自定义内容的空状态'
};

export const NoDescriptionEmpty = () => ({
  template: `
    <sm-empty :description="false"  />
  `
});
NoDescriptionEmpty.story = {
  name: '无描述的空状态'
};

export const EmptyStyle = () => ({
  beforeCreate() {
    this.simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;
  },
  template: `
    <sm-empty :image="simpleImage"  />
  `
});
EmptyStyle.story = {
  name: '选择图片的空状态'
};
