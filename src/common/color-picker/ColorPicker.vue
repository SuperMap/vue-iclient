<template>
  <div ref="colorpicker" class="sm-component-colorpicker">
    <div class="sm-component-colorpicker__current" @click="togglePicker">
      <div class="current-color" :style="`background-color: ${colorValue}`"></div>
      <i v-if="colorValue && deleteIcon" class="sm-components-icon-close delete-icon" @click.stop="deleteColor" />
    </div>
    <chrome-picker v-show="displayPicker" :value="colors" @input="updateFromPicker" />
  </div>
</template>

<script>
import { Chrome } from 'vue-color';

export default {
  name: 'SmColorPicker',
  components: {
    'chrome-picker': Chrome
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    deleteIcon: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      colors: '',
      colorValue: '',
      displayPicker: false
    };
  },
  watch: {
    value() {
      if (this.value !== this.colorValue) {
        this.setColor(this.value);
      }
    }
  },
  created() {
    this.setColor(this.value);
    document.addEventListener('click', this.documentClick);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.documentClick);
  },
  methods: {
    setColor(color = '') {
      this.updateColors(color);
      this.colorValue = color;
    },
    updateColors(color) {
      if (/^#.+/.test(color) === '#') {
        this.colors = {
          hex: color
        };
      } else if (/^rgba.+/.test(color)) {
        const rgba = color.replace(/^rgba?\(|\s+|\)$/g, '').split(',');
        const hex = `#${((1 << 24) + (parseInt(rgba[0]) << 16) + (parseInt(rgba[1]) << 8) + parseInt(rgba[2]))
          .toString(16)
          .slice(1)}`;
        this.colors = {
          hex,
          a: rgba[3]
        };
      }
    },
    togglePicker() {
      this.displayPicker = !this.displayPicker;
    },
    updateFromPicker(color) {
      this.colors = color;
      if (color.rgba.a === 1) {
        this.colorValue = color.hex;
      } else {
        this.colorValue = `rgba(${color.rgba.r}, ${color.rgba.g}, ${color.rgba.b}, ${color.rgba.a})`;
      }
      this.handleColorChanged();
    },
    deleteColor() {
      this.colorValue = '';
      this.colors = '';
      this.handleColorChanged();
    },
    handleColorChanged() {
      this.$emit('change', this.colorValue);
    },
    documentClick(e) {
      const el = this.$refs.colorpicker;
      const { target } = e;
      if (this.displayPicker && el && el !== target && !el.contains(target)) {
        this.togglePicker();
      }
    }
  }
};
</script>
