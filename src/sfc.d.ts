// TODO 声明文件待分离

/**
 * 告诉 TypeScript *.vue 后缀的文件可以交给 vue 模块来处理
 * 而在代码中导入 *.vue 文件的时候，需要写上 .vue 后缀。
 * 原因还是因为 TypeScript 默认只识别 *.ts 文件，不识别 *.vue 文件
 */
//给配置文件中types：['mapbox-gl']引入的namespace mapboxgl起个别名
import mapboxglTypes = mapboxgl;

declare module '*.vue' {
  import Vue from 'vue';

  export default Vue;
}
/**
 * 告诉 TypeScript window是个全局对象，直接可用，这样就不会在window.xx = 123时报错
 */
interface Window {
  Vue: any;
  convert: any;
  jsonsql: any;
  canvg: any;
  isLocal: boolean;
  server: string;
  CSS: any;
}

declare var window: Window;
declare var SuperMap: any;
// declare var require: any;

// typings.d.ts
declare module '*.json' {
  const value: any;
  export default value;
}
