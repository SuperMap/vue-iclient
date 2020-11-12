<script lang="ts">
import Modal from 'ant-design-vue/es/modal';
import Theme from '../_mixin/Theme';
import VueTypes from '../_utils/vue-types';
import buttonTypes from 'ant-design-vue/es/button/buttonTypes';
import AntdRender from '../_mixin/AntdRender';

var ButtonType = buttonTypes().type;

export const modalTypes = {
  prefixCls: VueTypes.string,
  visible: VueTypes.bool,
  confirmLoading: VueTypes.bool,
  title: VueTypes.any,
  closable: VueTypes.bool,
  closeIcon: VueTypes.any,
  afterClose: VueTypes.func,
  centered: VueTypes.bool,
  width: VueTypes.oneOfType([VueTypes.string, VueTypes.number]),
  footer: VueTypes.any,
  okText: VueTypes.any,
  okType: ButtonType,
  cancelText: VueTypes.any,
  icon: VueTypes.any,
  maskClosable: VueTypes.bool,
  forceRender: VueTypes.bool,
  okButtonProps: VueTypes.object,
  cancelButtonProps: VueTypes.object,
  destroyOnClose: VueTypes.bool,
  wrapClassName: VueTypes.string,
  maskTransitionName: VueTypes.string,
  transitionName: VueTypes.string,
  getContainer: VueTypes.func,
  zIndex: VueTypes.number,
  bodyStyle: VueTypes.object,
  maskStyle: VueTypes.object,
  mask: VueTypes.bool,
  keyboard: VueTypes.bool,
  wrapProps: VueTypes.object,
  focusTriggerAfterClose: VueTypes.bool
};

export default {
  name: 'SmModal',
  defaultComponent: Modal,
  mixins: [Theme, AntdRender],
  inheritAttrs: false,
  model: {
    prop: 'visible',
    event: 'change'
  },
  props: modalTypes,
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
