<template>
  <div class="sm-component-text" :style="[fontStyle, getBackgroundStyle, getTextColorStyle]">
    <span>{{ title }}</span>
  </div>
</template>

<script>
import Theme from '../_mixin/theme';

export default {
  name: 'SmText',
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
