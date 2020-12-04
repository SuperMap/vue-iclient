<template>
  <div id="app">
    <!-- <div style="border: 1px solid red; width: 600px; height: 500px; margin-left: 60px; float: left">
      <sm-compare>
        <sm-web-map server-url="https://iserver.supermap.io/iserver/services/map-world/rest/maps/World" slot="beforeMap"></sm-web-map>
        <sm-web-map server-url="https://iserver.supermap.io/iserver/services/map-world/rest/maps/World" slot="afterMap"></sm-web-map>
      </sm-compare>
    </div> -->

    <div style="border: 1px solid red; width: 600px; height: 500px; margin-left: 60px; float: left;">
      <sm-web-map server-url="https://iserver.supermap.io/iserver/services/map-world/rest/maps/World">
        <sm-measure position="top-right"></sm-measure>
        <sm-zoom position="top-left"></sm-zoom>
        <sm-mini-map position="bottom-right"></sm-mini-map>
        <sm-open-file position="top-right"></sm-open-file>
        <sm-layer-manager position="top-right"></sm-layer-manager>
      </sm-web-map>
    </div>

  <div style="border: 1px solid red; width: 600px; height: 500px; margin-left: 60px; float: left;">
    <sm-directory-tree :treeData="treeData"> </sm-directory-tree>
  </div>

    <div class="changeTheme">
      <sm-button @click="changeStyle">深色主题</sm-button>
      <sm-button @click="changeStyle1">浅色主题</sm-button>
      <sm-button @click="changeStyle3">暖灰色主题</sm-button>
      <sm-button @click="changeStyle2">透明主题</sm-button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import smcomponents from '../../src/mapboxgl';
import data from './data/data.js';

var host = 'http://support.supermap.com.cn:8090';
export default Vue.extend({
  name: 'App',
  mixins: [data], // demo data
  data() {
    return {
      treeData: [
        {
          title: 'parent 1',
          key: '0-0',
          children: [
            {
              title: 'parent 1-0',
              key: '0-0-0',
              children: [
                { title: 'leaf', key: '0-0-0-0' },
                { title: 'leaf', key: '0-0-0-1' },
              ],
            },
            {
              title: 'parent 1-1',
              key: '0-0-1',
              children: [{ title: 'leafleaf', key: '0-0-1-1' }],
            },
          ],
        },
      ],
    };
  },
  methods: {
    onSelect(selectedKeys, info) {
      console.log('selected', selectedKeys, info);
    },
    onCheck(checkedKeys, info) {
      console.log('onCheck', checkedKeys, info);
    },
  },
});
</script>

<style lang="scss">
body {
  margin: 0;
  // overflow: hidden;
  background: #fff;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
}
#app {
  margin: 0 auto;
  width: 100%;
  height: 100%;
}
#app > div {
  margin-bottom: 10px;
}
.changeTheme {
  position: absolute;
  left: 50%;
  transform: translate(-100px);
  bottom: 20px;
}
.buttons > button {
  margin-right: 5px;
}
.inputs > input {
  width: 8%;
}
.sm-text {
  &::before {
    content: '\e64a';
  }
}
</style>
