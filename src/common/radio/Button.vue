<script lang="ts">
import RadioButton from 'ant-design-vue/es/radio/RadioButton';
import { radioTypes } from './Radio.vue';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

export const radioButtonTypes = {
  ...radioTypes
};

export default {
  name: 'SmRadioButton',
  defaultComponent: RadioButton,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  props: radioButtonTypes
};
</script>
