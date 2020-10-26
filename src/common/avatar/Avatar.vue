<script lang="ts">
import { VNode } from 'vue';
import Avatar from 'ant-design-vue/es/avatar/Avatar';
import VueTypes from '../_types/vue-types';
import Theme from '../_mixin/theme';
import { objectWithoutProperties } from '../_utils/util';

export const avatarTypes = {
  icon: VueTypes.any,
  shape: VueTypes.oneOf(['circle', 'square']).def('circle'),
  size: VueTypes.oneOfType([VueTypes.number, VueTypes.string]),
  src: VueTypes.string,
  srcSet: VueTypes.string,
  alt: VueTypes.string,
  loadError: VueTypes.func,
  iconClass: VueTypes.string
};

export default {
  name: 'SmAvatar',
  mixins: [Theme],
  inheritAttrs: false,
  props: avatarTypes,
  computed: {
    avatarProps() {
      return objectWithoutProperties({ ...this.$props, ...this.$attrs, prefixCls: 'sm-component-avatar' });
    },
    avatarStyle() {
      const style = {
        '--normal-bg-color': this.avatarBackgroundData,
        '--normal-text-color': this.avatarTextColorData
      };
      return style;
    },
    avatarListeners() {
      return Object.assign({}, this.$listeners);
    }
  },
  render(h): VNode {
    const children = [];
    if ((!this.icon || !this.$slots['icon']) && this.iconClass) {
      children.push(h('i', {
        class: { [this.iconClass]: true },
        slot: 'icon'
      }));
    }
    return h(
      Avatar,
      {
        props: this.avatarProps,
        on: this.avatarListeners,
        scopedSlots: this.$scopedSlots,
        style: this.avatarStyle
      },
      [this.$slots['default'], children]
    );
  }
};
</script>
