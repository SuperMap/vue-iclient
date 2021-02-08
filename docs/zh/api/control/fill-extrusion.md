# 三维拉伸

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

| 参数       | 说明                       | 类型   | 可选值 | 默认值                          |
| :--------- | :------------------------- | :----- | :----- | :------------------------------ |
| iconClass  | 收缩按钮的 Font class 类名 | string | -      | 'sm-components-icon-fill-extension' |
| headerName | 标题名                     | string | -      | '三维拉伸'                      |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)和[卡片混入参数](/zh/api/mixin/mixin.md#collapsedcard)和 [Control 混入参数](/zh/api/mixin/mixin.md#control)
