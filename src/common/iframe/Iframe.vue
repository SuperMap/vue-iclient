<template>
  <iframe :src="src" scrolling="auto" class="sm-component-iframe"></iframe>
</template>

<script>
import Theme from 'vue-iclient/src/common/_mixin/Theme';

export default {
  name: 'SmIframe',
  mixins: [Theme],
  props: {
    src: {
      type: String
    }
  }
};
</script>
