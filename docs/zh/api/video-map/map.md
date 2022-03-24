# 视频地图组件

```vue
<sm-video-map
  src="https://www.runoob.com/try/demo_source/mov_bbb.mp4"
  video-width="1920"
  video-height="1080"
></sm-video-map>
```

### Attributes

| 参数            | 说明                                               | 类型    | 可选值 | 默认值 |
| :-------------- | :------------------------------------------------- | :------ | :----- | :----- |
| container       | 地图容器 ID                                        | string  | -      | -      |
| src             | 视频地址                                           | string  | -      | map    |
| autoplay        | 是否自动播放址                                     | boolean | -      | false  |
| loop            | 是否循环播放                                       | boolean | -      | false  |
| videoParameters | 视频配准参数 <a href="#videoParameters">配置项</a> | Object  | -      | -      |
| play            | 控制视频的播放与暂停                               | boolean | -      | false  |
| videoWidth      | 视频宽度                                           | number  | -      | -      |
| videoHeight     | 视频高度                                           | number  | -      | -      |

## 加载视频地图

```vue
<template>
  <sm-video-map :address="address" video-width="1920" video-height="1080"></sm-video-map>
</template>
<script>
export default {
  data() {
    return {
      address: 'https://www.runoob.com/try/demo_source/mov_bbb.mp4',
      videoParameters: {
        cx: 959,
        cy: 500,
        fx: 1520.152911079442,
        fy: 1575.1348617395925,
        pitch: -24.96093939608592,
        roll: -8.415413323689824,
        yaw: -7.289473927703427,
        x: 13355976.039998194,
        y: 3570816.8299734485,
        z: 60
      }
    };
  }
};
</script>
```

### videoParameters

| 参数  | 说明               | 类型   | 可选值 | 默认值 |
| :---- | :----------------- | :----- | :----- | :----- |
| pitch | 俯仰角             | number | -      | -      |
| roll  | 侧偏角             | number | -      | -      |
| yaw   | 偏航角             | number | -      | -      |
| cx    | 相机中心的水平坐标 | number | -      | -      |
| cy    | 相机中心的垂直坐标 | number | -      | -      |
| fx    | 相机水平焦距       | number | -      | -      |
| fy    | 相机垂直焦距       | number | -      | -      |
| x     | 视频 x 坐标        | number | -      | -      |
| y     | 视频 y 坐标        | number | -      | -      |
| z     | 视频 z 坐标        | number | -      | -      |

### Events

| name       | 说明                   | 回调参数       |
| :--------- | :--------------------- | :------------- |
| load       | 视频地图加载完成时触发 | function()     |
| timeupdate | 视频每帧播放时触发     | function(time) |
