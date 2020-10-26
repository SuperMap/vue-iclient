<script lang="ts">
import { VNode } from 'vue';
import Search from 'ant-design-vue/es/input/Search';
import inputProps from 'ant-design-vue/es/input/inputProps';
import VueTypes from '../_types/vue-types';
import Base from './BaseMixin.vue';

export const inputSearchTypes = {
  ...inputProps,
  enterButton: VueTypes.any
};

export default {
  name: 'SmInputSearch',
  mixins: [Base],
  model: {
    prop: 'value',
    event: 'change.value'
  },
  props: inputSearchTypes,
  watch: {
    enterButton() {
      this.replaceButtonClass();
    }
  },
  mounted(): void {
    this.replaceButtonClass();
  },
  methods: {
    replaceButtonClass(): void {
      if ((this.enterButton !== void 0 || this.$slots.enterButton) && this.$el) {
        const addonButton = this.$el.querySelector('.ant-btn.sm-component-input-search-button');
        if (!addonButton) {
          return;
        }
        const classReplacer = addonButton.className.replace(/ant-/gi, 'sm-component-');
        addonButton.setAttribute('class', classReplacer);
      }
    }
  },
  render(h): VNode {
    return h(Search, {
      props: {
        ...this.inputProps,
        prefixCls: 'sm-component-input-search',
        inputPrefixCls: 'sm-component-input'
      },
      on: this.inputListeners,
      scopedSlots: this.$scopedSlots,
      style: this.inputStyle
    });
  }
};
</script>
