<template>
  <el-input :style="[fontStyle, getBackgroundStyle, getTextColorStyle]" type="textarea" class="sm-text" v-model="title"></el-input>
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


