# 三维拉伸

<sm-iframe src=""></sm-iframe>

```vue
<sm-web-map :map-options="mapOptions">
  <sm-fill-extrusion position="top-left"></sm-fill-extrusion>
</sm-web-map>

<script>
new Vue({
  el: '#main'
});
</script>
```

### Attributes

| 参数             | 说明                                                                            | 类型                                             | 可选值                                                       | 默认值                            |
| :--------------- | :------------------------------------------------------------------------------ | :----------------------------------------------- | :----------------------------------------------------------- | :-------------------------------- |
| position         | 显示位置，添加为地图的子组件（[slot](https://cn.vuejs.org/v2/api/#slot)）时生效 | string                                           | 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' | 'top-left'                        |
| iconClass        | 收缩按钮 Icon 类名                                                              | string                                           | -                                                            | 'sm-components-icon-layer-list' |
| headerName       | 标题名                                                                          | string                                           | -                                                            | '三维拉伸'                        |
| autoRotate       | 收缩按钮是否自动旋转                                                            | boolean                                          | -                                                            | false                             |
| collapsed        | 是否默认折叠（iconClass 参数存在时生效）                                        | boolean                                          | -                                                            | true                              |
| splitLine  | 标题与内容的分割线                                                              | boolean                                                                    | -                                                            | false                           |
