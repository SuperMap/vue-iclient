<script lang="ts">
import { VNode, CreateElement } from 'vue';
import Icon from 'ant-design-vue/es/icon';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';
import VueTypes from '../_utils/vue-types';
import { objectWithoutProperties } from '../_utils/util';

export const iconTypes = {
  tabIndex: VueTypes.number,
  type: VueTypes.string.def('info'),
  component: VueTypes.any,
  viewBox: VueTypes.any,
  spin: VueTypes.bool.def(false),
  rotate: VueTypes.number,
  theme: VueTypes.oneOf(['filled', 'outlined', 'twoTone']).def('outlined'),
  twoToneColor: VueTypes.string,
  role: VueTypes.string,
  iconStyle: VueTypes.object,
  iconClass: VueTypes.string,
  autoPrefix: VueTypes.bool.def(true)
};

export default {
  name: 'SmIcon',
  defaultComponent: Icon,
  mixins: [Theme, AntdRender],
  props: iconTypes,
  computed: {
    customIconClass() {
      return this.autoPrefix ? 'sm-components-icon-' + this.iconClass : this.iconClass;
    },
    iconProps() {
      return objectWithoutProperties(this.componentProps, ['iconStyle', 'iconClass', 'autoPrefix']);
    }
  },
  render(h: CreateElement): VNode {
    let iconChildren;
    if (this.iconClass) {
      iconChildren = h('i', {
        class: this.customIconClass
      });
    } else {
      const Component = this.getComponentInstance();
      iconChildren = h(
        Component,
        {
          props: this.iconProps,
          attrs: this.$attrs,
          on: this.componentListeners,
          scopedSlots: this.$scopedSlots
        },
        this.renderChildren()
      );
    }
    return h(
      'div',
      {
        class: 'sm-component-icon',
        style: this.iconStyle
      },
      [iconChildren]
    );
  }
};
</script>
