<template>
  <div class="sm-component-text" :style="[fontStyle, getBackgroundStyle, getTextColorStyle]">
    <span>{{ finalTitle }}</span>
  </div>
</template>

<script>
import Theme from '../_mixin/theme';
import Timer from '../_mixin/timer';
import RestService from '../../mapboxgl/_utils/RestService';

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
    }
  },
  data() {
    return {
      finalTitle: this.title
    };
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
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.restService = new RestService();
    this.restService.on('getdatasucceeded', this.fetchData);
  },
  beforeDestroy() {
    this.restService.off('getdatasucceeded', this.fetchData);
  },
  methods: {
    timing() {
      this.getData();
    },
    fetchData(data) {
      this.finalTitle = data.data;
    },
    getData() {
      this.restService && this.restService.getData(this.url);
    }
  }
};
</script>
