<template>
  <iframe :src="src" scrolling="auto"></iframe>
</template>

<script>
import Theme from '../_mixin/theme';

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
