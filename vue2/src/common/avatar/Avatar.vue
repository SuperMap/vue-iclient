<script lang="ts">
import { VNode } from 'vue';
import Avatar from 'ant-design-vue/es/avatar/Avatar';
import VueTypes from 'vue-iclient/src/common/_utils/vue-types';
import Theme from 'vue-iclient/src/common/_mixin/Theme';
import AntdRender from 'vue-iclient/src/common/_mixin/AntdRender';

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
  defaultComponent: Avatar,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: avatarTypes,
  methods: {
    renderChildren(): VNode[] {
      const h = this.$createElement;
      const children = [];
      if ((!this.icon || !this.$slots.icon) && this.iconClass) {
        children.push(
          h('i', {
            class: { [this.iconClass]: true },
            slot: 'icon'
          })
        );
      }
      return [this.$slots.default, children];
    }
  }
};
</script>
