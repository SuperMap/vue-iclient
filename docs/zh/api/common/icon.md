---
pageClass: icon
---

# 图标

```vue
<sm-icon icon-class="marker-layer" style="color: rgb(63, 177, 227;"></sm-icon>
```

### Attributes

::: tip
与 [ant-design](https://www.antdv.com/components/icon/#API) 配置相同, 新增配置如下：
:::

| 参数       | 说明                                                                                                          | 类型    | 可选值 | 默认值 |
| :--------- | :------------------------------------------------------------------------------------------------------------ | :------ | :----- | :----- |
| iconClass  | class 类名                                                                                                    | string  | -      | -      |
| autoPrefix | 是否开启类名前缀。默认用的组件库的 iconFont 前缀：sm-components-icon-，如果开启的话，iconClass 只需要传图标名 | boolean | -      | true   |
| iconStyle  | 图标样式，例如 `fontSize` 和 `color`                                                                          | object  | -      | -      |

> 注意：Icon 组件中图标渲染的优先级为 iconClass > component > type, 传入 props 时，优先级高的直接生效，优先级低的则失效。
