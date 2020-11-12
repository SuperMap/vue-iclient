<script lang="ts">
import TextArea from 'ant-design-vue/es/input/TextArea';
import inputProps from 'ant-design-vue/es/input/inputProps';
import Base from './BaseMixin.vue';

export const textAreaTypes = {
  ...inputProps
};

export default {
  name: 'SmTextarea',
  defaultComponent: TextArea,
  mixins: [Base],
  props: textAreaTypes
};
</script>
