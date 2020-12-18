<template>
  <div class="sm-component-image" :style="[getBackgroundStyle, getTextColorStyle]">
    <a
      :class="['sm-component-image__link', realHref ? '': 'sm-component-image__noLink']"
      :href="realHref"
      :target="target"
    >
      <div v-if="src" class="sm-component-image__content" :style="[repeatStyle,imgUrl]"></div>
      <i v-else class="sm-components-icon-tupian sm-component-image__defaultImg"></i>
    </a>
  </div>
</template>

<script>
import Theme from '../_mixin/Theme';
import { parseUrl } from '../_utils/util';

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
    },
    href: {
      type: String,
      default: ''
    },
    target: {
      type: String,
      default: '_self'
    }
  },
  data() {
    return {
      repeatOption: {
        center: {
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'contain'
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
    },
    realHref() {
      let href = this.href.replace(/ /g, '');
      if (href && !parseUrl(href)) {
        return `http://${href}`;
      }
      return href;
    }
  }
};
</script>
