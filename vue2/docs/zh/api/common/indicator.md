# 指标

```vue
<sm-indicator title="人均收入" unit="元" indicatorColor="red" textColor="red" :num="12323412" fontSize="18">
</sm-indicator>
```

### Attributes

| 参数                | 说明                                                                                      | 类型                                            | 可选值                            | 默认值                                               |
| :------------------ | :---------------------------------------------------------------------------------------- | :---------------------------------------------- | :-------------------------------- | :--------------------------------------------------- |
| title               | 标题                                                                                      | string                                          | -                                 | '指标标题'                                           |
| unit                | 单位                                                                                      | string                                          | -                                 | '单位'                                               |
| num                 | 数据                                                                                      | string \| number                                | -                                 | 0                                                    |
| decimals            | 小数位数                                                                                  | number                                          | -                                 | -1 (计算结果的默认小数位数)                          |
| mode                | 排列方式                                                                                  | string                                          | 'vertical' \| 'horizontal'        | 'vertical'                                           |
| separator           | 千分符                                                                                    | string                                          | -                                 | ','（英文逗号）                                      |
| separatorBackground | 分隔符背景                                                                                | boolean                                         | -                                 | false                                                |
| showTitleUnit       | 是否显示标题和单位                                                                        | boolean                                         | -                                 | true                                                 |
| animated            | 数字动画                                                                                  | boolean                                         | -                                 | false                                                |
| duration            | 动画时长                                                                                  | string \| number                                | -                                 | 1000                                                 |
| fontWeight          | 字体粗细                                                                                  | string \| number                                | 'lighter' \| 'normal' \| 'bolder' | 'border'                                             |
| fontSize            | 数字字体大小                                                                              | string \| number                                | -                                 | -                                                    |
| textFontSize        | 标签和单位字体大小。默认用 fontSize 的 0.66 倍                                            | string \| number                                | -                                 | -                                                    |
| numSpacing          | 字体间距                                                                                  | number                                          | -                                 | 0                                                    |
| indicatorColor      | 指标值的字体颜色                                                                          | string                                          | -                                 | -                                                    |
| numBackground       | 背景样式                                                                                  | object                                          | -                                 | { color: 'rgba(0, 0, 0, 0)', image: '', padding: 0 } |
| thresholdsStyle     | 阈值样式                                                                                  | <a href="#thresholdsstyle">ThresholdsStyle </a> | -                                 | -                                                    |
| url                 | 服务地址                                                                                  | string                                          | -                                 | -                                                    |
| proxy               | 服务代理地址                                                                              | string                                          | -                                 | -                                                    |
| numField            | 指标值字段。指定[服务响应数据](/zh/api/service-response-data-requirements/index.md)中的字段 | string                                          | -                                 | -                                                    |
| titleField          | 标题字段。指定[服务响应数据](/zh/api/service-response-data-requirements/index.md)中的字段 | string                                          | -                                 | -                                                    |
| unitField           | 单位字段。指定[服务响应数据](/zh/api/service-response-data-requirements/index.md)中的字段 | string                                          | -                                 | -                                                    |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)和[定时刷新混入参数](/zh/api/mixin/mixin.md#timer)

### ThresholdsStyle

```json
// 阈值格式如下
[
  {
    "max": 50,
    "color": "#0CD54A"
  },
  {
    "min": 50,
    "max": 80,
    "color": "#F7682D"
  },
  {
    "min": 80,
    "color": "#DD2C2C"
  }
]
```

### Events

| name | 说明               | 回调参数                                                                         |
| :--- | :----------------- | :------------------------------------------------------------------------------- |
| indicatorNumChange | 指标数值变化时触发 | function(indicatorNum)

