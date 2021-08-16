# 快速上手

本节将介绍如何在项目中使用。

### 使用之前

高效的开发，离不开基础工程的搭建。在开始使用 Vue-iClient-MapboxGL 之前，有必要先了解以下基础知识，我们也假设您已经写过 Vue，并掌握了下面的内容。

- [Vue 组件](https://cn.vuejs.org/v2/guide/components.html)
- [单文件组件](https://cn.vuejs.org/v2/guide/single-file-components.html)

以下概念贯穿 Vue-iClient-MapboxGL 前后，建议开发者花点时间来了解。

- prop 传递数据
- slot 内容分发
- events $emit @click 事件

### 引入 Vue-iClient-MapboxGL

在 main.js 中写入以下内容：

#### 完整引入

```js
import Vue from 'vue';
import VueiClient from '@supermap/vue-iclient-mapboxgl';
import App from './App.vue';

Vue.use(VueiClient);

new Vue({
  el: '#app',
  render: h => h(App)
});
```

#### 局部导入

局部导入的组件也会引入整个@supermap/vue-iclient-mapboxgl 模块。

```js
import Vue from 'vue';
import { Button, message } from '@supermap/vue-iclient-mapboxgl';
import App from './App.vue';

/* v10.2.0+ 自动注册Button下组件，如Button.Group */
Vue.use(Button);
Vue.prototype.$message = message;

new Vue({
  el: '#app',
  render: h => h(App)
});
```

#### 按需加载

第一种方式：单独引入每个组件来按需加载组件。

```js
import Button from '@supermap/vue-iclient-mapboxgl/lib/button';
import '@supermap/vue-iclient-mapboxgl/lib/button/style';
```

第二种方式：借助 babel-plugin-import，我们可以只引入需要的组件，以达到减小项目体积的目的：

首先，安装 babel-plugin-import：

```js
npm install babel-plugin-import -D
```

然后，在.babelrc 中添加如下配置：

```js
{
  "plugins": [
    ["import",
      {
      "libraryName": "@supermap/vue-iclient-mapboxgl",
      "style": "css"
      }
    ]
  ]
}
```

接下来，如果你只希望引入部分组件，比如 Button 和 message：

```js
import { Button, message } from '@supermap/vue-iclient-mapboxgl';

/* v10.2.0+ 自动注册Button下组件，如Button.Group */
Vue.use(Button);
Vue.prototype.$message = message;

new Vue({
  el: '#app',
  render: h => h(App)
});
```

完整组件列表和引入方式

```js
import Vue from 'vue';
import {
  message,
  notification,
  Avatar,
  Border,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Collapse,
  CollapseCard,
  ColorPicker,
  DatePicker,
  Dropdown,
  Empty,
  Icon,
  Iframe,
  Image,
  Indicator,
  Input,
  InputNumber,
  LayerSelect,
  Layout,
  LiquidFill,
  Menu,
  Modal,
  Pagination,
  Progress,
  Radio,
  Select,
  Slider,
  Slideshow,
  Spin,
  Steps,
  Switch,
  Table,
  TablePopup,
  Tabs,
  Text,
  TimeLine,
  TimeRange,
  TimeSlider,
  TimeText,
  Tooltip,
  Transfer,
  Tree,
  TreeSelect,
  VideoPlayer,
  Attributes,
  Chart,
  Compare,
  NcpMap,
  OpenFile,
  Query,
  Search,
  TextList,
  WebMap,
  WebScene,
  AnimateMarkerLayer,
  ClusterLayer,
  DataFlowLayer,
  DeckglLayer,
  EchartsLayer,
  FireLayer,
  GeojsonLayer,
  GraphThemeLayer,
  HeatmapLayer,
  LabelThemeLayer,
  MapvLayer,
  RangeThemeLayer,
  RanksymbolThemeLayer,
  RasterTileLayer,
  TrackLayer,
  UniqueThemeLayer,
  VectorTileLayer,
  Compass,
  CoordinateConversion,
  Draw,
  FlyTo,
  Identify,
  LayerColor,
  LayerList,
  LayerManager,
  Legend,
  Measure,
  MiniMap,
  Pan,
  Scale,
  Zoom,
  TdtMapSwitcher,
  TdtRoute,
  TdtSearch
} from '@supermap/vue-iclient-mapboxgl';

Vue.use(Avatar);
Vue.use(Border);
Vue.use(Breadcrumb);
Vue.use(Button);
Vue.use(Card);
Vue.use(Checkbox);
Vue.use(Collapse);
Vue.use(CollapseCard);
Vue.use(ColorPicker);
Vue.use(DatePicker);
Vue.use(Dropdown);
Vue.use(Empty);
Vue.use(Icon);
Vue.use(Iframe);
Vue.use(Image);
Vue.use(Indicator);
Vue.use(Input);
Vue.use(InputNumber);
Vue.use(LayerSelect);
Vue.use(Layout);
Vue.use(LiquidFill);
Vue.use(Menu);
Vue.use(Modal);
Vue.use(Pagination);
Vue.use(Progress);
Vue.use(Radio);
Vue.use(Select);
Vue.use(Slider);
Vue.use(Slideshow);
Vue.use(Spin);
Vue.use(Steps);
Vue.use(Switch);
Vue.use(Table);
Vue.use(TablePopup);
Vue.use(Tabs);
Vue.use(Text);
Vue.use(TimeLine);
Vue.use(TimeRange);
Vue.use(TimeSlider);
Vue.use(TimeText);
Vue.use(Tooltip);
Vue.use(Transfer);
Vue.use(Tree);
Vue.use(TreeSelect);
Vue.use(VideoPlayer);
Vue.use(Attributes);
Vue.use(Chart);
Vue.use(Compare);
Vue.use(NcpMap);
Vue.use(OpenFile);
Vue.use(Query);
Vue.use(Search);
Vue.use(TextList);
Vue.use(WebMap);
// 需要传入 Cesium 依赖
Vue.use(WebScene, {
  cesiumPath: './Build/Cesium/Cesium.js'
});
Vue.use(AnimateMarkerLayer);
Vue.use(ClusterLayer);
Vue.use(DataFlowLayer);
Vue.use(DeckglLayer);
Vue.use(EchartsLayer);
Vue.use(FireLayer);
Vue.use(GeojsonLayer);
Vue.use(GraphThemeLayer);
Vue.use(HeatmapLayer);
Vue.use(LabelThemeLayer);
Vue.use(MapvLayer);
Vue.use(RangeThemeLayer);
Vue.use(RanksymbolThemeLayer);
Vue.use(RasterTileLayer);
Vue.use(TrackLayer);
Vue.use(UniqueThemeLayer);
Vue.use(VectorTileLayer);
Vue.use(Compass);
Vue.use(CoordinateConversion);
Vue.use(Draw);
Vue.use(FlyTo);
Vue.use(Identify);
Vue.use(LayerColor);
Vue.use(LayerList);
Vue.use(LayerManager);
Vue.use(Legend);
Vue.use(Measure);
Vue.use(MiniMap);
Vue.use(Pan);
Vue.use(Scale);
Vue.use(Zoom);
Vue.use(TdtMapSwitcher);
Vue.use(TdtRoute);
Vue.use(TdtSearch);

Vue.prototype.$message = message;
Vue.prototype.$notification = notification;
Vue.prototype.$info = Modal.info;
Vue.prototype.$success = Modal.success;
Vue.prototype.$error = Modal.error;
Vue.prototype.$warning = Modal.warning;
Vue.prototype.$confirm = Modal.confirm;
Vue.prototype.$destroyAll = Modal.destroyAll;
```
