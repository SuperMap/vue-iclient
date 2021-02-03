<script lang="ts">
import Search from 'ant-design-vue/es/input/Search';
import inputProps from 'ant-design-vue/es/input/inputProps';
import VueTypes from '../_utils/vue-types';
import Base from './BaseMixin.vue';

export const inputSearchTypes = {
  ...inputProps,
  enterButton: VueTypes.any,
  size: VueTypes.oneOf(['small', 'large', 'default', 'middle'])
};

export default {
  name: 'SmInputSearch',
  defaultComponent: Search,
  mixins: [Base],
  props: inputSearchTypes,
  computed: {
    extralProps() {
      return {
        size: this.size === 'middle' ? undefined : this.size
      };
    },
    componentClass() {
      return {
        'sm-component-input-group-wrapper-md': this.size === 'middle',
        'sm-component-input-search-md': this.size === 'middle'
      };
    }
  },
  mounted() {
    if (this.size === 'middle') {
      const inputDom = this.$el.querySelector('.sm-component-input');
      inputDom && inputDom.classList && inputDom.classList.add('sm-component-input-md');
      const btnDom = this.$el.querySelector('.sm-component-input-group-addon .sm-component-btn');
      btnDom && btnDom.classList && btnDom.classList.add('sm-component-btn-md');
    }
  }
};
</script>
