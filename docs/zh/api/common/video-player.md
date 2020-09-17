# 视频

```vue
<sm-video-player url="https://www.runoob.com/try/demo_source/mov_bbb.mp4"></sm-video-player>
```

### Attributes

| 参数    | 说明                                  | 类型   | 可选值 | 默认值 |
| :------ | :------------------------------------ | :----- | :----- | :----- |
| url     | 视频地址                              | string | -      | -      |
| options | 视频配置 <a href="options">配置项</a> | object | -      | -      |

### options

| 参数 | 说明 | 类型 | 可选值 | 默认值 |
| :--------- | :-------------------------------------- | :------ | :---------------------------------------------------------- | :----- |
| muted | 是否静音 | boolean | - | true |
| loop | 是否循环播放 | boolean | - | false |
| popupToPlay | 是否打开弹窗播放 | boolean | - | false |
| autoplay | 是否自动播放 | boolean | - | false |
| controlBar | 是否显示控制条 | boolean | - | true |
