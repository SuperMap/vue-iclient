<script lang="ts">
import { BasicProps } from 'ant-design-vue/es/layout/layout';
import Base from './BaseMixin.vue';

export const layoutFooterTypes = {
  ...BasicProps
};

export default {
  name: 'SmLayoutFooter',
  mixins: [Base],
  props: layoutFooterTypes,
  data() {
    return {
      suffix: 'layout-footer',
      tagNameData: 'footer',
      subComponentName: 'Footer'
    };
  }
};
</script>
