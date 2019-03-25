<template>
  <el-input
    :style="[fontStyle, getBackgroundStyle, getTextColorStyle]"
    class="sm-text"
    v-model="content"
    type="textarea"
    autosize
  ></el-input>
</template>

<script>
import Widget from "./Widget";
import Theme from "../mixin/Theme";
export default {
  name: "SmText",
  extends: Widget,
  mixins: [Theme],
  data(){
    return {
      content:null
    }
  },
  mounted(){
    this.content = this.title;
  },
  props: {
    fontStyle: {
      type: Object
    },
    title: {
      type: String
    }
  }
};
</script>


