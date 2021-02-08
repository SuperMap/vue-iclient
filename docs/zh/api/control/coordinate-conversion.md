# 坐标转换

<sm-iframe src="https://iclient.supermap.io/examples/component/components_coordinate_conversion_vue.html"></sm-iframe>

```vue
<sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="801571284">
  <sm-coordinate-conversion></sm-coordinate-conversion>
</sm-web-map>
```

### Attributes

| 参数         | 说明                                                                                                                                           | 类型    | 可选值 | 默认值                                    |
| :----------- | :--------------------------------------------------------------------------------------------------------------------------------------------- | :------ | :----- | :---------------------------------------- |
| showLocation | 是否开启定位至                                                                                                                                 | boolean | -      | true                                      |
| formats      | 自定义转换方法，key 值是 title,包含 format, toWGS84 属性 ,format 将经纬度坐标转换成对应格式；toWGS84 将对应坐标转换成经纬度，返回值为{lng,lat} | object  | -      | -                                         |
| iconClass    | 收缩按钮的 Font class 类名                                                                                                                     | string  | -      | 'sm-components-icon-coordinate-coversion' |
| collapsed    | 是否默认折叠（iconClass 参数存在时生效）                                                                                                       | boolean | -      | false                                     |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)和[卡片混入参数](/zh/api/mixin/mixin.md#collapsedcard)和 [Control 混入参数](/zh/api/mixin/mixin.md#control)
