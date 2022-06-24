# 水球

```vue
<sm-liquid-fill
  borderColor="blue"
  waveColor="red"
  :style="{ width: '10%', display: 'inline-block' }"
  :value="0.3"
  :waveCount="1"
  position="bottom-right"
></sm-liquid-fill>
```

### Attributes

| 参数             | 说明             | 类型               | 可选值 | 默认值    |
| :--------------- | :--------------- | :----------------- | :----- | :-------- |
| value            | 百分比           | number \| string   | -      | 0         |
| formatter        | 水球显示文本     | function \| string | -      | -         |
| waveCount        | 波浪数           | number             | -      | 1         |
| waveAnimation    | 是否开启波浪动画 | boolean            | -      | false     |
| fontSize         | 字体大小         | number \| string   | -      | 14        |
| insideLabelColor | 波内字体颜色     | string             | -      | '#fff'    |
| labelColor       | 波外字体颜色     | string             | -      | '#626c91' |
| backgroundColor  | 填充色           | string             | -      | -         |
| waveColor        | 波浪颜色         | string             | -      | '#42b8f9' |
| borderColor      | 边框颜色         | string             | -      | '#42b8f9' |

> 支持[主题混入参数](/zh/api/mixin/mixin.md#theme)和[第三方服务混入参数](/zh/api/mixin/mixin.md#thirdservice)和[定时刷新混入参数](/zh/api/mixin/mixin.md#timer)
