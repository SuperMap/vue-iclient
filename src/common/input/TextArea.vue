<script lang="ts">
import TextArea from 'ant-design-vue/es/input/TextArea';
import inputProps from 'ant-design-vue/es/input/inputProps';
import VueTypes from 'vue-iclient/src/common/_utils/vue-types';
import Base from './BaseMixin.vue';

export const textAreaTypes = {
  ...inputProps,
  error: VueTypes.bool.def(false)
};

export default {
  name: 'SmTextarea',
  defaultComponent: TextArea,
  mixins: [Base],
  props: textAreaTypes,
  computed: {
    componentClass() {
      return {
        'sm-component-input-error': this.error === true
      };
    }
  }
};
</script>
