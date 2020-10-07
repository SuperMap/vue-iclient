<template>
  <h1>vue-iclient UXD 组件</h1>
  <div class="buttons">
    <sm-button type="primary" @click="handleClick">主按钮</sm-button>
    <sm-button type="default" @click="handleClick">次按钮</sm-button>
    <sm-button type="danger" @click="handleClick">危险按钮</sm-button>
    <sm-button @click="handleClick" disabled>禁用按钮</sm-button>
    <sm-button type="dashed" @click="handleClick">Dash按钮</sm-button>
    <sm-button type="link" @click="handleClick">文字按钮</sm-button>
  </div>
  <div class="switchs">
    <sm-switch v-model:checked="checked1" />
    <sm-switch checked-children="开" un-checked-children="关"  v-model:checked="checked2" />
    <sm-switch checked-children="1" un-checked-children="0" :checked="checked3" @change="handleSwitchChange" />
    <sm-switch v-model:checked="checked4">
      <template v-slot:checkedChildren><span>√</span></template>
      <template v-slot:unCheckedChildren><span>X</span></template>
    </sm-switch>
    <sm-switch v-model:checked="checked1" loading />
  </div>
  <div class="inputs">
    <sm-input v-model:value="input1" @change="handleInputChange" @pressEnter="handlePressEnter" />
  </div>
</template>

<script>
import SmButton from './components/button/Button.vue';
import SmSwitch from './components/switch/Switch';
import SmInput from './components/input/Input';
import Input from 'ant-design-vue/es/input/index';

export default {
  name: 'App',
  components: {
    SmButton,
    SmSwitch,
    SmInput,
    Input
  },
  data() {
    return {
      checked1: false,
      checked2: false,
      checked3: true,
      checked4: false,
      input1: '123'
    }
  },
  methods: {
    handleClick(e) {
      console.log(`sm-button-click to ${e}`);
    },
    handleSwitchChange(checked) {
      console.log(`sm-switch to ${checked}`);
      this.checked3 = checked;
    },
    handleInputChange(e) {
      console.log(`sm-input-change to ${this.input1}`);
    },
    handlePressEnter(e) {
      console.log(`sm-input-pressEnter to ${e}`);
    }
  }
}
</script>

<style lang="less">
  * > div {
    margin-bottom: 10px;
  }
</style>
