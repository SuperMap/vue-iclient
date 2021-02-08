# 图层颜色

```vue
<sm-web-map style="height:700px" serverUrl="https://www.supermapol.com/" mapId="505367620">
    <sm-layer-color :collapsed="false"></sm-layer-color>
  </sm-web-map>
```

### Attributes

| 参数         | 说明                       | 类型    | 可选值 | 默认值                           |
| :----------- | :------------------------- | :------ | :----- | :------------------------------- |
| allowReset   | 开启重置                   | boolean | -      | true                             |
| allowCapture | 开启捕捉                   | boolean | -      | true                             |
| iconClass    | 收缩按钮的 Font class 类名 | string  | -      | 'sm-components-icon-layer-color' |
| headerName   | 标题名                     | string  | -      | '图层颜色'                       |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)和[卡片混入参数](/zh/api/mixin/mixin.md#collapsedcard)和 [Control 混入参数](/zh/api/mixin/mixin.md#control)
