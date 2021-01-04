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
| url         | 服务地址                                                                 | string           | -                                              | -        |
| proxy       | 服务代理                                                                        | string           | -                                                | -        |
| field       | 指定[服务响应数据](/zh/api/service-response-data-requirements/index.md)中的字段 | string           | -                                              | -        |
| startTiming | 是否开启定时刷新                                                         | boolean          | -                                              | false    |
| frequency   | 请求间隔                                                                 | number \| string | -                                              | 3        |
| href        | 超链接                                                                   | string           | -                                              | -        |
| target      | 跳转窗口                                                                 | string           | '\_blank' \| '\_self' \| '\_parent' \| '\_top' | '\_self' |
| fontStyle   | 字体样式                                                                 | object           | -                                              | -        |
