<script lang="ts">
import Search from 'ant-design-vue/es/input/Search';
import inputProps from 'ant-design-vue/es/input/inputProps';
import VueTypes from '../_utils/vue-types';
import Base from './BaseMixin.vue';

export const inputSearchTypes = {
  ...inputProps,
  enterButton: VueTypes.any
};

export default {
  name: 'SmInputSearch',
  defaultComponent: Search,
  mixins: [Base],
  props: inputSearchTypes
};
</script>
