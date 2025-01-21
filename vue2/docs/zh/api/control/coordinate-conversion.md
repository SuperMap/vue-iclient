# 坐标转换

<sm-iframe src="https://iclient.supermap.io/examples/component/components_coordinate_conversion_vue.html"></sm-iframe>

```vue
<sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="801571284">
  <sm-coordinate-conversion></sm-coordinate-conversion>
</sm-web-map>
```

### Attributes

| 参数         | 说明                                     | 类型                                                                | 可选值                                                   | 默认值                                               |
| :----------- | :--------------------------------------- | :------------------------------------------------------------------ | :------------------------------------------------------- | :--------------------------------------------------- |
| showLocation | 是否开启定位至                           | boolean                                                             | -                                                        | true                                                 |
| formats      | 自定义坐标转换方法。                     | array<[string \| <a href="#formatsparameter">FormatsParameter</a>]> | 'UTM'、'BASEMAP'、'XY' 、'Mercator'、'DD'、'DOM'、' DMS' | ['UTM','BASEMAP','XY' ,'Mercator','DD','DOM',' DMS'] |
| iconClass    | 收缩按钮的 Font class 类名               | string                                                              | -                                                        | 'sm-components-icon-coordinate-coversion'            |
| collapsed    | 是否默认折叠（iconClass 参数存在时生效） | boolean                                                             | -                                                        | false                                                |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)和[卡片混入参数](/zh/api/mixin/mixin.md#collapsedcard)和 [Control 混入参数](/zh/api/mixin/mixin.md#control)

### FormatsParameter

| 参数      | 说明                                                                      | 类型                                     | 可选值 | 默认值 |
| :-------- | :------------------------------------------------------------------------ | :--------------------------------------- | :----- | :----- |
| title     | 自定义格式名称                                                            | string                                   | -      | -      |
| fromWGS84 | 经纬度转换自定义格式方法。回调参数是{lng,lat},返回值是自定义格式的字符串  | function({lng,lat})=>value:string        | -      | -      |
| toWGS84   | 自定义格式转成经纬度方法。回调蚕食是自定义格式的字符串，返回值是{lng,lat} | function(value)=>{lng:number,lat:number} | -      | -      |
