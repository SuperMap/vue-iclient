# 鹰眼

<sm-iframe src="http://iclient.supermap.io/examples/mapboxgl/components_minimap_vue.html"></sm-iframe>

```vue
<sm-web-map server-url="http://support.supermap.com.cn:8092/" map-id="1649097980">
  <sm-mini-map position="top-left"></sm-mini-map>
</sm-web-map>
```

### Attributes

| 参数       | 说明                                                                            | 类型    | 可选值                                                       | 默认值                       |
| :--------- | :------------------------------------------------------------------------------ | :------ | :----------------------------------------------------------- | :--------------------------- |
| position   | 显示位置，添加为地图的子组件（[slot](https://cn.vuejs.org/v2/api/#slot)）时生效 | string  | 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' | 'bottom-right'               |
| iconClass  | 收缩按钮 Icon 类名                                                              | string  | -                                                            | 'sm-components-icons-return' |
| headerName | 标题名                                                                          | string  | -                                                            | '鹰眼图'                     |
| autoRotate | 收缩按钮是否自动旋转                                                            | boolean | -                                                            | false                        |
| collapsed  | 是否默认折叠（iconClass 参数存在时生效）                                        | boolean | -                                                            | true                         |
