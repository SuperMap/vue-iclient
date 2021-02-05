# 坐标转换

<sm-iframe src="https://iclient.supermap.io/examples/component/components_coordinate_conversion_vue.html"></sm-iframe>

```vue
<sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="801571284">
  <sm-coordinate-conversion></sm-coordinate-conversion>
</sm-web-map>
```

### Attributes

| 参数       | 说明                                                                                                                                           | 类型    | 可选值                                                       | 默认值                      |
| :--------- | :--------------------------------------------------------------------------------------------------------------------------------------------- | :------ | :----------------------------------------------------------- | :-------------------------- |
| position   | 显示位置，添加为地图的子组件（[slot](https://cn.vuejs.org/v2/api/#slot)）时生效）                                                              | string  | 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' | 'bottom-right'              |
| iconClass  | 收缩按钮 Icon 类名                                                                                                                             | string  | -                                                            | 'sm-components-icon-change' |
| headerName | 标题名                                                                                                                                         | string  | -                                                            |                             |
| autoRotate | 收缩按钮是否自动旋转                                                                                                                           | boolean | -                                                            | false                       |
| showLocation | 是否开启定位至                                                                                                                                 | boolean | -                                                            | true                        |
| formats    | 自定义转换方法，key 值是 title,包含 format, toWGS84 属性 ,format 将经纬度坐标转换成对应格式；toWGS84 将对应坐标转换成经纬度，返回值为{lng,lat} | Object  | -                                                            | {}                          |
