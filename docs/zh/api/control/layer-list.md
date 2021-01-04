# 图层列表

<sm-iframe src="https://iclient.supermap.io/examples/component/components_layerList_vue.html"></sm-iframe>

```vue
<sm-web-map server-url="https://iportal.supermap.io/iportal/" map-id="801571284">
  <sm-layer-list position="top-left"></sm-layer-list>
</sm-web-map>
```

### Attributes

| 参数       | 说明                                                                            | 类型    | 可选值                                                       | 默认值                            |
| :--------- | :------------------------------------------------------------------------------ | :------ | :----------------------------------------------------------- | :-------------------------------- |
| position   | 显示位置，添加为地图的子组件（[slot](https://cn.vuejs.org/v2/api/#slot)）时生效 | string  | 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' | 'top-left'                        |
| iconClass  | 收缩按钮 Icon 类名                                                              | string  | -                                                            | 'sm-components-icon-layer-list' |
| headerName | 标题名                                                                          | string  | -                                                            | '图层'                            |
| autoRotate | 收缩按钮是否自动旋转                                                            | boolean | -                                                            | false                             |
| collapsed  | 是否默认折叠（iconClass 参数存在时生效）                                        | boolean | -                                                            | true                              |
