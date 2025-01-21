<template>
  <div
    class="sm-component-nav"
    :style="{
      backgroundImage: `url(${require('./assets/image/background_image.png')})`,
      backgroundSize: '100% 100%',
      ...navStyle
    }"
  >
    <template v-for="(item, index) in items">
      <div
        :key="index"
        class="sm-component-nav__board"
        :style="[
          isTitle(item) && { width: (item.style && item.style.width) || '30%', flex: 'none' },
          justifyContent(item)
        ]"
      >
        <sm-button
          :class="{ defaultTitleStyle: isTitle(item) }"
          :style="[defaultStyle(item), activeIndex === index && activeStyle(item)]"
          @click="emitEvent(item, index)"
        >
          <span v-if="!item.href">{{ item.title || item.text }}</span>
          <a v-else :target="item.target" :href="item.href">{{ item.text }}</a>
        </sm-button>
      </div>
    </template>
    <div v-if="title && items.length % 2 === 0" class="sm-component-nav__board"></div>
  </div>
</template>

<script lang="ts">
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import { Component, Prop, Mixins, Watch } from 'vue-property-decorator';
import SmButton from 'vue-iclient/src/common/button/Button.vue';

interface titleParams {
  title: string;
  href: string;
  target: string; // '_blank' | '_self' | '_parent' | '_top'
  position: string;
  style: Object;
  activeStyle: Object;
}

interface itemsParams {
  key: number;
  title: string;
}

@Component({
  name: 'SmNav',
  components: {
    SmButton
  }
})
export default class Nav extends Mixins(Theme) {
  activeIndex: number = 0;

  @Prop() navStyle: Object;
  @Prop() title: titleParams;
  @Prop() items: itemsParams[];
  @Prop() itemAlign: Function;
  @Prop() itemStyle: Function;
  @Prop() itemActiveStyle: Function;

  @Watch('title', { deep: true, immediate: true })
  titleChanged(val) {
    if (val) {
      switch (val.position) {
        case 'right':
          this.items.push(val);
          break;
        case 'center':
          this.items.splice(Math.ceil(this.items.length / 2), 0, val);
          break;
        default:
          this.items.unshift(val);
          break;
      }
    }
  }

  get isTitle() {
    return function (item) {
      return item && item.position;
    };
  }

  get defaultStyle() {
    return function (item) {
      if (this.isTitle(item)) {
        return { ...item.style, width: '100%' };
      } else {
        return this.itemStyle && this.itemStyle(item);
      }
    };
  }

  get activeStyle() {
    return function (item) {
      if (this.isTitle(item)) {
        return item.activeStyle;
      } else {
        let itemActiveStyle = this.itemActiveStyle && this.itemActiveStyle(item);
        return {
          backgroundImage: `url(${require('./assets/image/item_active.png')})`,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          ...itemActiveStyle
        };
      }
    };
  }

  get justifyContent() {
    return function (item) {
      let align;
      this.itemAlign && (align = this.itemAlign(item).align);
      let justifyContent = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
      return { justifyContent };
    };
  }

  emitEvent(item, index) {
    this.activeIndex = index;
    if (this.title) {
      if (this.title.position === 'left') {
        index -= 1;
      } else if (this.title.position === 'center') {
        index = index > Math.floor(this.items.length / 2) ? index - 1 : index;
      }
    }
    if (this.isTitle(item)) {
      this.$emit('click', item);
    } else {
      this.$emit('change', item, index);
    }
  }

  goTo(index) {
    this.activeIndex = index;
    this.emitEvent(this.items[index], index);
  }

  next() {
    this.activeIndex += 1;
    this.emitEvent(this.items[this.activeIndex], this.activeIndex);
  }

  prev() {
    this.activeIndex -= 1;
    this.emitEvent(this.items[this.activeIndex], this.activeIndex);
  }
}
</script>
