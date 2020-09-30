<template>
  <h1>UXD 组件</h1>
  <div class="buttons">
    <sm-button type="primary" @click="handleClick">主按钮</sm-button>
    <sm-button type="default" @click="handleClick">次按钮</sm-button>
    <sm-button type="danger" @click="handleClick">危险按钮</sm-button>
    <sm-button @click="handleClick" disabled>禁用按钮</sm-button>
    <sm-button type="dashed" @click="handleClick">Dash按钮</sm-button>
    <sm-button type="link" @click="handleClick">文字按钮</sm-button>
  </div>
  <div class="switchs">
    <sm-switch checked @change="onChange" />
    <sm-switch checked-children="开" un-checked-children="关" checked />
    <sm-switch checked-children="1" un-checked-children="0" :checked="false" />
    <!-- <sm-switch :checked="false">
      <template v-slot:checkedChildren><span>√</span></template>
      <template v-slot:unCheckedChildren><span>X</span></template>
    </sm-switch> -->
  </div>
</template>

<script>
import SmButton from './components/button/Button.vue';
import SmSwitch from './components/switch/Switch.vue';

export default {
  name: 'App',
  components: {
    SmButton,
    SmSwitch
  },
  methods: {
    handleClick(event) {
      console.log(event);
    },
    onChange(checked) {
      console.log(`a-switch to ${checked}`);
    }
  }
}
</script>

<style lang="less">
  .sm-btn {
    margin-bottom: 10px;
  }
</style>
