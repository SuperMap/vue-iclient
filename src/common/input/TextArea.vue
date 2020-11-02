<script lang="ts">
import { VNode } from 'vue';
import TextArea from 'ant-design-vue/es/input/TextArea';
import inputProps from 'ant-design-vue/es/input/inputProps';
import Base from './BaseMixin.vue';

export const textAreaTypes = {
  ...inputProps
};

export default {
  name: 'SmTextarea',
  mixins: [Base],
  model: {
    prop: 'value',
    event: 'change.value'
  },
  props: textAreaTypes,
  render(h): VNode {
    return h(TextArea, {
      props: {
        ...this.inputProps,
        prefixCls: 'sm-component-input'
      },
      on: this.inputListeners,
      scopedSlots: this.$scopedSlots
    });
  }
};
</script>
