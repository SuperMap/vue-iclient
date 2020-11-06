<script lang="ts">
import { SiderProps } from 'ant-design-vue/es/layout/Sider';
import Base from './BaseMixin.vue';

export const layoutSiderTypes = {
  ...SiderProps
};

export default {
  name: 'SmLayoutSider',
  __ANT_LAYOUT_SIDER: true,
  mixins: [Base],
  model: {
    prop: 'collapsed',
    event: 'collapse'
  },
  props: layoutSiderTypes,
  data() {
    return {
      suffix: 'layout-sider',
      subComponentName: 'Sider'
    };
  },
  computed: {
    layoutSiderListeners() {
      const vm = this;
      return Object.assign({}, this.$listeners, {
        'collapse': function() {
          vm.$emit('collapse', ...arguments);
        }
      });
    }
  }
};
</script>
