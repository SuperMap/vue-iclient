<template>
  <div class="sm-component-iframe">
    <iframe :src="src" scrolling="auto"></iframe>
  </div>
</template>

<script>
import Vue from 'vue';
export default {
  name: 'SmIframe',
  props: {
    src: {
      type: String
    }
  }
};
</script>

<style lang="scss" scoped>
.sm-component-iframe {
  text-align: center;
  padding-top: 20px;
  & > iframe {
    width: 100%;
    height: 50vh;
    border: none;
    box-shadow: 0 0px 5px rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }
}
</style>
