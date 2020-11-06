<script lang="ts">
import { BasicProps } from 'ant-design-vue/es/layout/layout';
import Base from './BaseMixin.vue';

export const layoutContentTypes = {
  ...BasicProps
};

export default {
  name: 'SmLayoutContent',
  mixins: [Base],
  props: layoutContentTypes,
  data() {
    return {
      suffix: 'layout-content',
      tagNameData: 'main',
      subComponentName: 'Content'
    };
  }
};
</script>
