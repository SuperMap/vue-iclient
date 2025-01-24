<template>
  <div class="sm-component-image" :style="[getBackgroundStyle, getTextColorStyle]">
    <a :class="['sm-component-image__link']" :href="realHref" @click="handleLinkClick" :target="target">
      <div v-if="src" @click="startPreview" class="sm-component-image__content" :style="[repeatStyle, imgUrl]">
        <!-- 用img标签确保没有给定宽高时，能使用src图片的宽高 -->
        <img :src="src" style="visibility: hidden; max-width: 100%; max-height: 100%" />
      </div>
      <i v-else class="sm-components-icon-tupian sm-component-image__defaultImg"></i>
    </a>
    <sm-modal
      v-model="previewVisible"
      :zIndex="1009"
      centered
      width="50%"
      :dialogClass="fullScreenStyle.dialogClass"
      :dialogStyle="fullScreenStyle.dialogStyle"
      :bodyStyle="fullScreenStyle.bodyStyle"
      :footer="null"
    >
      <img :src="src" @click="endPreview" :style="{ 'object-fit': 'contain', width: '100%', height: '100%' }" />
    </sm-modal>
  </div>
</template>

<script>
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import { parseUrl } from 'vue-iclient-core/utils/util';
import SmModal from 'vue-iclient/src/common/modal/Modal.vue';
import Message from 'vue-iclient/src/common/message/index.js';

export default {
  name: 'SmImage',
  components: { SmModal },
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
    previewMode: {
      type: String,
      default: 'none'
    },
    target: {
      type: String,
      default: '_self'
    }
  },
  data() {
    return {
      previewVisible: false,
      repeatOption: {
        center: {
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'contain'
        },
        left: {
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'left center',
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
    fullScreenStyle() {
      return this.previewMode === 'full'
        ? {
          dialogStyle: {
            backgroundColor: 'transparent',
            height: '100%'
          },
          dialogClass: 'sm-component-image__full',
          bodyStyle: {
            padding: 0,
            width: '100%',
            height: '100%'
          }
        }
        : {
          dialogClass: 'sm-component-image__preview',
          bodyStyle: {
            padding: 0
          }
        };
    },
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
  },
  methods: {
    handleLinkClick(e) {
      if (!this.href) {
        e.preventDefault();
      }
    },
    startPreview() {
      if (this.previewMode === 'none') {
        return;
      }
      Message.info(this.previewMode === 'popup' ? this.$t('info.pressEscToExit') : this.$t('info.pressEscOrClickToExit'), 3);
      this.previewVisible = true;
    },
    endPreview() {
      this.previewVisible = false;
    }
  }
};
</script>
