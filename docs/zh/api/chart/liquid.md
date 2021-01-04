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

| 参数             | 说明                                                                            | 类型             | 可选值 | 默认值    |
| :--------------- | :------------------------------------------------------------------------------ | :--------------- | :----- | :-------- |
| url              | 服务地址                                                                        | string           | -      | -         |
| proxy            | 服务代理                                                                        | string           | -      | -         |
| field            | 指定[服务响应数据](/zh/api/service-response-data-requirements/index.md)中的字段 | string           | -      | -         |
| startTiming      | 是否开启定时刷新                                                                | boolean          | -      | false     |
| frequency        | 请求间隔                                                                        | number \| string | -      | 3         |
| value            | 百分比                                                                          | number \| string | -      | 0         |
| waveCount        | 波浪数                                                                          | number           | -      | 1         |
| waveAnimation    | 是否开启波浪动画                                                                | boolean          | -      | false     |
| fontSize         | 字体大小                                                                        | number \| string | -      | 14        |
| insideLabelColor | 波内字体颜色                                                                    | string           | -      | '#fff'    |
| labelColor       | 波外字体颜色                                                                    | string           | -      | '#626c91' |
| backgroundColor  | 填充色                                                                          | string           | -      | -         |
| waveColor        | 波浪颜色                                                                        | string           | -      | '#42b8f9' |
| borderColor      | 边框颜色                                                                        | string           | -      | '#42b8f9' |
