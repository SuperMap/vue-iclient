<script lang="ts">
import Input from 'ant-design-vue/es/input/Input';
import inputProps from 'ant-design-vue/es/input/inputProps';
import Base from './BaseMixin.vue';

export const inputTypes = {
  ...inputProps
};

export default {
  name: 'SmInput',
  defaultComponent: Input,
  mixins: [Base],
  props: inputTypes
};
</script>
