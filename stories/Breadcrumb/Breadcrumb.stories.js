import { withKnobs } from '@storybook/addon-knobs';

export default { title: 'BasicComponent/breadcrumb', decorators: [withKnobs] };

export const BasicBreadcrumb = () => ({
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
  name: '基本用法'
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
  name: '带图标的面包屑'
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
  name: '自定义分隔符'
};

// export const DropDownBreadcrumb = () => ({
//   template: `
//   <sm-breadcrumb>
//     <sm-breadcrumb-item>Ant Design Vue</sm-breadcrumb-item>
//     <sm-breadcrumb-item><a href="">Component</a></sm-breadcrumb-item>
//     <sm-breadcrumb-item>
//       <a href="">General</a>
//       <sm-menu slot="overlay">
//         <sm-menu-item>
//           <a target="_blank" rel="noopener noreferrer" href="http://www.alipay.com/">
//             General
//           </a>
//         </sm-menu-item>
//         <sm-menu-item>
//           <a target="_blank" rel="noopener noreferrer" href="http://www.taobao.com/">
//             Layout
//           </a>
//         </sm-menu-item>
//         <sm-menu-item>
//           <a target="_blank" rel="noopener noreferrer" href="http://www.tmall.com/">
//             Navigation
//           </a>
//         </sm-menu-item>
//       </sm-menu>
//     </sm-breadcrumb-item>
//     <sm-breadcrumb-item>Button</sm-breadcrumb-item>
//   </sm-breadcrumb>
//   `
// });
// DropDownBreadcrumb.story = {
//   name: '带下拉菜单的面包屑'
// };

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
  name: '标签自定义分隔符'
};
