<template>
  <div ref="colorpicker" class="sm-component-colorpicker">
    <div class="sm-component-colorpicker__current" @click="togglePicker">
      <div class="current-color" :style="`background-color: ${colorValue}`"></div>
      <i v-if="colorValue && deleteIcon" class="sm-components-icon-close delete-icon" @click.stop="deleteColor" />
    </div>
    <chrome-picker v-show="displayPicker" :value="colors" @input="updateFromPicker" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop, Watch, Emit } from 'vue-property-decorator';
import { Chrome } from 'vue-color';

@Component({
  name: 'SmColorPicker',
  components: {
    'chrome-picker': Chrome
  },
  model: {
    prop: 'value',
    event: 'change'
  }
})
export default class ColorPicker extends Vue {
  colors: any = '';
  colorValue: string = '';
  displayPicker: boolean = false;

  @Prop({ default: '' }) value: string;
  @Prop({ default: true }) deleteIcon: boolean;

  @Watch('value')
  valueChanged() {
    if (this.value !== this.colorValue) {
      this.setColor(this.value);
    }
  }

  @Emit()
  change() {
    return this.colorValue;
  }

  created() {
    this.setColor(this.value);
    document.addEventListener('click', this.documentClick);
  }

  beforeDestroy() {
    document.removeEventListener('click', this.documentClick);
  }

  setColor(color: string = '') {
    this.updateColors(color);
    this.colorValue = color;
  }

  updateColors(color: any) {
    if (/^#.+/.test(color)) {
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
  }

  togglePicker() {
    this.displayPicker = !this.displayPicker;
  }

  updateFromPicker(color) {
    this.colors = color;
    if (color.rgba.a === 1) {
      this.colorValue = color.hex;
    } else {
      this.colorValue = `rgba(${color.rgba.r}, ${color.rgba.g}, ${color.rgba.b}, ${color.rgba.a})`;
    }
    this.change();
  }

  deleteColor() {
    this.colorValue = '';
    this.colors = '';
    this.change();
  }

  documentClick(e) {
    // @ts-ignore
    const el: Element = this.$refs.colorpicker;
    const { target } = e;
    if (this.displayPicker && el && el !== target && !el.contains(target)) {
      this.togglePicker();
    }
  }
}
</script>
