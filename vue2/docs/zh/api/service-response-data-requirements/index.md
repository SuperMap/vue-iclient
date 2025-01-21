# 服务响应数据的格式要求

在 MapDashboard 中<a href="#chart">图表组件</a>、<a href="#text">文本组件</a>、<a href="#text-list">文本列表组件</a>、<a href="#progress">进度条（环）组件</a>、<a href="#liquid-fill">水球组件</a>、<a href="#indicator">指标组件</a>支持对接自定义 REST 服务。响应数据格式要求如下：

1. 以上组件均支持 GeoJSON 格式

```json
1. GeoJSON Features 数组格式示例

{
  // ... ,
  "data": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {},
        "properties": {
          "A": "a",
          "B": "b"
        }
      }
    ]
  }
}

2. GeoJSON FeatureCollection 格式示例

{
  // ... ,
  "data": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {},
        "properties": {
          "A": "a",
          "B": "b"
        }
      }
    ]
  }
}
```

2. 以上组件也支持简单 JSON 格式

<p id="chart">图表组件</p>

```json
{
  "data": {
    "2017": 13020,
    "2018": 19051,
    "2019": 13692,
    "2020": 19196,
    "2021": 12072,
    "2022": 16930
  }
}
```

<p id="text">文本组件</p>

```json
{
  "data": "回款金额"
}
```

<p id="text-list">文本列表组件</p>

```json
{
  "data": [
    {
      "A1": "a1",
      "B1": "b1"
    },
    {
      "A2": "a2",
      "B2": "b2"
    }
  ]
}
```

<p id="progress">进度条（环）组件</p>

```json
{
  "data": 0.6
}
```

<p id="liquid-fill">水球组件</p>

```json
{
  "data": 0.4
}
```

<p id="indicator">指标组件</p>

```json
{
  "data": {
    "unit": "meter",
    "num": 200,
    "title": "桥梁长度"
  }
}
```
