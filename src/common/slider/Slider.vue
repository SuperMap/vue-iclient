<script lang="ts">
import Slider, { SliderProps } from 'ant-design-vue/es/slider/index';
import Theme from '../_mixin/Theme';
import AntdRender from '../_mixin/AntdRender';

export const sliderTypes = {
  ...SliderProps()
};

export default {
  name: 'SmSlider',
  defaultComponent: Slider,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  model: {
    prop: 'value',
    event: 'change'
  },
  props: sliderTypes,
  computed: {
    extralListeners() {
      const vm = this;
      return {
        'change': function (value) {
          vm.$emit('change', value);
        }
      };
    }
  }
};
</script>
