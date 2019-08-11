<template>
  <div class="sm-component-image" :style="[getBackgroundStyle]">
    <div v-if="src" class="sm-component-image__content" :style="[repeatStyle,imgUrl]"></div>
    <i v-else class="sm-components-icons-x-bmp sm-component-image__defaultImg"></i>
  </div>
</template>

<script>
import Theme from '../_mixin/theme';

export default {
  name: 'SmImage',
  mixins: [Theme],
  props: {
    src: {
      type: String
    },
    repeat: {
      type: String,
      default: 'center'
    }
  },
  data() {
    return {
      repeatOption: {
        center: {
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        },
        noRepeat: {
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat'
        },
        repeatX: {
          backgroundRepeat: 'repeat-x',
          backgroundSize: 'auto 100%'
        },
        repeatY: {
          backgroundRepeat: 'repeat-Y',
          backgroundSize: '100% auto'
        },
        repeatXY: {
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto'
        }
      }
    };
  },
  computed: {
    repeatStyle() {
      return this.repeatOption[this.repeat];
    },
    imgUrl() {
      return {
        backgroundImage: `url(${this.src})`
      };
    }
  }
};
</script>
