<template>
  <el-input :style="fontStyle" type="textarea" class="sm-text" v-model="title"></el-input>
</template>

<script>
import Widget from "./Widget";
export default {
  name: "SmText",
  extends: Widget,
  props: {
    fontStyle:{
      type:Object
    },
    title:{
      type:String
    }
  },
  methods: {}
};
</script>


