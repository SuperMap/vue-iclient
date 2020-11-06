<script lang="ts">
import { BasicProps } from 'ant-design-vue/es/layout/layout';
import Base from './BaseMixin.vue';

export const layoutHederTypes = {
  ...BasicProps
};

export default {
  name: 'SmLayoutHeader',
  mixins: [Base],
  props: layoutHederTypes,
  data() {
    return {
      suffix: 'layout-header',
      tagNameData: 'header',
      subComponentName: 'Header'
    };
  }
};
</script>
