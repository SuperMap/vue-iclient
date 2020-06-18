# 指标

```vue
<sm-indicator title="人均收入" unit="元" indicatorColor="red" textColor="red" :num="12323412" fontSize="18">
</sm-indicator>
```

### Attributes

| 参数                | 说明                                                                           | 类型             | 可选值                            | 默认值                                   |
| :------------------ | :----------------------------------------------------------------------------- | :--------------- | :-------------------------------- | :--------------------------------------- |
| url                 | 服务地址                                                                       | string           | -                                 | -                                        |
| field               | 指定[服务响应数据](/zh/api/service-response-data-requirements/index.md)中的字段 | string           | -                                 | -                                        |
| startTiming         | 是否开启定时刷新                                                               | boolean          | -                                 | false                                    |
| frequency           | 请求间隔                                                                       | number \| string | -                                 | 3                                        |
| showTitleUnit       | 是否显示标题和单位                                                             | boolean          | -                                 | true                                     |
| title               | 标题                                                                           | string           | -                                 | '指标标题'                               |
| unit                | 单位                                                                           | string           | -                                 | '单位'                                   |
| num                 | 数据                                                                           | string \| number | -                                 | 0                                        |
| decimals            | 小数位数                                                                       | number           | -                                 | -1 (计算结果的默认小数位数)              |
| mode                | 排列方式                                                                       | string           | 'vertical' \| 'horizontal'        | 'vertical'                               |
| separator           | 千分符                                                                         | string           | -                                 | ','（英文逗号）                          |
| separatorBackground | 分隔符背景                                                                     | boolean          | -                                 | false                                    |
| animated            | 数字动画                                                                       | boolean          | -                                 | false                                    |
| duration            | 动画时长                                                                       | string \| number | -                                 | 1000                                     |
| fontWeight          | 字体粗细                                                                       | string \| number | 'lighter' \| 'normal' \| 'bolder' | 'border'                                 |
| fontSize            | 字体大小                                                                       | string \| number | -                                 | -                                        |
| numSpacing          | 字体间距                                                                       | number           | -                                 | 0                                        |
| indicatorColor      | 数据颜色                                                                       | string           | -                                 | -                                        |
| numBackground       | 背景样式                                                                       | object           | -                                 | { color: 'rgba(0, 0, 0, 0)', image: '' } |
|                     |
