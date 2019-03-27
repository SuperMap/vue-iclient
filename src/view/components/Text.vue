<template>
  <div class="sm-text" :style="getBackgroundStyle">
    <el-input
      :style="[fontStyle, getTextColorStyle]"
      v-model="title"
      type="textarea"
      autosize
    ></el-input>
  </div>
</template>

<script>
import Widget from "./Widget";
import Theme from "../mixin/Theme";
export default {
  name: "SmText",
  extends: Widget,
  mixins: [Theme],
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


