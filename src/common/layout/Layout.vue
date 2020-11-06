<script lang="ts">
import { BasicProps } from 'ant-design-vue/es/layout/layout';
import Base from './BaseMixin.vue';

export const layoutTypes = {
  ...BasicProps
};

export default {
  name: 'SmLayout',
  mixins: [Base],
  props: layoutTypes
};
</script>
