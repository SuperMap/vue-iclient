<template>
  <div class="sm-component-text" :style="[customStyle, getBackgroundStyle, getTextColorStyle]">
    <span v-if="href">
      <a :target="target" :href="href" class="sm-component-text__href" :style="[getTextColorStyle]">{{ finalTitle }}</a>
    </span>
    <span v-else>{{ finalTitle }}</span>
  </div>
</template>

<script>
import Theme from '../_mixin/theme';
import Timer from '../_mixin/timer';
import RestService from '../../common/_utils/RestService';

export default {
  name: 'SmText',
  mixins: [Theme, Timer],
  props: {
    fontStyle: {
      type: Object
    },
    title: {
      type: String
    },
    url: {
      type: String
    },
    href: {
      type: String,
      default: ''
    },
    target: {
      type: String,
      default: '_self'
    },
    field: {
      type: String
    }
  },
  data() {
    return {
      finalTitle: this.title
    };
  },
  computed: {
    customStyle() {
      let style = Object.assign({}, this.fontStyle);
      if (style.textAlign && !style.justifyContent) {
        const textAlign = style.textAlign;
        style.justifyContent = textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center';
        delete style.textAlign;
      }
      return style;
    }
  },
  watch: {
    title(val) {
      this.finalTitle = val;
    },
    url: {
      handler(val) {
        if (val) {
          this.getData();
        } else {
          this.finalTitle = this.title;
          this.features = null;
        }
      },
      immediate: true
    },
    field() {
      this.setTitle(this.features);
    }
  },
  mounted() {
    this.restService = new RestService();
    this.restService.on({ getdatasucceeded: this.fetchData });
  },
  beforeDestroy() {
    this.restService.remove('getdatasucceeded');
  },
  methods: {
    timing() {
      this.getData();
    },
    fetchData({ features }) {
      this.features = features;
      this.setTitle(features);
    },
    getData() {
      this.restService && this.restService.getData(this.url);
    },
    setTitle(features) {
      if (features && !!features.length) {
        const field = this.field;
        this.finalTitle = features[0].properties[field];
      }
    }
  }
};
</script>
