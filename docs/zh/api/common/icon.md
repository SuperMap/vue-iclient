# 图标

```vue
<sm-icon icon-class="marker-layer" style="color: rgb(63, 177, 227;"></sm-icon>
```

### Attributes

| 参数         | 说明                                                                                                                                              | 类型                  | 可选值                              | 默认值     |
| :----------- | :------------------------------------------------------------------------------------------------------------------------------------------------ | :-------------------- | :---------------------------------- | :--------- |
| iconClass    | class 类名                                                                                                                                        | string                | -                                   | -          |
| autoPrefix   | 是否开启类名前缀。默认用的组件库的 iconFont 前缀：sm-components-icons-，如果开启的话，iconClass 只需要传图标名                                    | boolean               | -                                   | true       |
| iconStyle    | 图标样式，例如 `fontSize` 和 `color`                                                                                                              | object                | -                                   | -          |
| type         | 图标类型。参照 [ant-design](https://vue.ant.design/components/icon-cn/)                                                                           | string                | -                                   | -          |
| theme        | 图标主题风格。参照 [ant-design](https://vue.ant.design/components/icon-cn/)                                                                       | string                | 'filled' \| 'outlined' \| 'twoTone' | 'outlined' |
| component    | 控制如何渲染图标，通常是一个渲染根标签为 `<svg>` 的 `Vue` 组件，会使 type 属性失效。参照 [ant-design](https://vue.ant.design/components/icon-cn/) | object                | -                                   | -          |
| twoToneColor | 仅适用双色图标。参照 [ant-design](https://vue.ant.design/components/icon-cn/)                                                                     | string (十六进制颜色) | -                                   | -          |

> 注意：Icon 组件中图标渲染的优先级为 iconClass > component > type, 传入 props 时，优先级高的直接生效，优先级低的则失效。
