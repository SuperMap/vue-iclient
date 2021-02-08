# 文本

```vue
<sm-text
  title="文本框"
  textColor="red"
  :fontStyle="{ fontSize: '18px', lineHeight: '18px', fontWeight: '700', textAlign: 'center' }"
>
</sm-text>
```

### Attributes

| 参数        | 说明                                                                     | 类型             | 可选值                                         | 默认值   |
| :---------- | :----------------------------------------------------------------------- | :--------------- | :--------------------------------------------- | :------- |
| title       | 文本内容                                                                 | string           | -                                              | -        |
| href        | 超链接                                                                   | string           | -                                              | -        |
| target      | 跳转窗口                                                                 | string           | '\_blank' \| '\_self' \| '\_parent' \| '\_top' | '\_self' |
| fontStyle   | 字体样式                                                                 | object           | -                                              | -        |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)和[第三方服务混入参数](/zh/api/mixin/mixin.md#thirdservice)和[定时刷新混入参数](/zh/api/mixin/mixin.md#timer)
