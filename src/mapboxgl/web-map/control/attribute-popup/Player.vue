<template>
  <div class="player">
    <ImagePreview
      v-if="type === 'IMAGE' && loadImg"
      :src="value"
      :previewMode="options.previewMode"
      width="100%"
      style="background: transparent"
      @error="handleImageLoad(false)"
      @load="handleImageLoad(true)"
    />
    <video
      v-if="type === 'VIDEO' && loadVideo"
      v-bind="options"
      :src="value"
      :style="{ objectFit: options.objectFit }"
      @error="handleVideoLoad(false)"
      @load="handleVideoLoad(true)"
    />
    <div v-if="!loadImg || !loadVideo" class="sm-player-loade-error" :title="$t('error.loadError')">
      <i class="sm-components-icon-jiazaishibai" v-if="!loadImg || !loadVideo"></i>
    </div>
  </div>
</template>

<script>
import ImagePreview from 'vue-iclient/src/common/image/Image.vue';

export default {
  name: 'SmPlayer',
  components: { ImagePreview },
  props: {
    type: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    },
    options: {
      type: Object,
      default() {
        return {
          autoplay: false,
          objectFit: 'fill',
          loop: false,
          muted: true,
          controls: true,
          previewMode: 'full'
        };
      }
    }
  },
  data() {
    return {
      loadVideo: true,
      loadImg: true
    };
  },
  watch: {
    value() {
      this.loadImg = true;
      this.loadVideo = true;
    }
  },
  methods: {
    handleImageLoad(status) {
      this.loadImg = status;
    },
    handleVideoLoad(status) {
      this.loadVideo = status;
    }
  }
};
</script>
