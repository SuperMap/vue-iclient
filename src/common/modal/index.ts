import AntdModal from 'ant-design-vue/es/modal';
import Modal from './Modal.vue';

type ModalInstanceType = typeof Modal;

interface ModalInstanceConstructor extends ModalInstanceType {
  info?: Function;
  success?: Function;
  error?: Function;
  warning?: Function;
  warn?: Function;
  confirm?: Function;
  destroyAll?: Function;
}

const defaultPrefixCls = 'sm-component-modal';
const btnDefaultPrefixCls = 'sm-component-btn';
['info', 'success', 'error', 'warn', 'warning', 'confirm'].forEach((item: string) => {
  const typeCallback = AntdModal[item];
  Modal[item] = function(config: any) {
    const { props: okButtonProps = {} } = config.okButtonProps || {};
    const { props: cancelButtonProps = {} } = config.cancelButtonProps || {};
    return typeCallback({
      ...config,
      prefixCls: config.prefixCls || defaultPrefixCls,
      okButtonProps: {
        ...config.okButtonProps,
        props: {
          ...okButtonProps,
          prefixCls: okButtonProps.prefixCls || btnDefaultPrefixCls
        }
      },
      cancelButtonProps: {
        ...config.cancelButtonProps,
        props: {
          ...cancelButtonProps,
          prefixCls: cancelButtonProps.prefixCls || btnDefaultPrefixCls
        }
      }
    });
  };
});

Modal['destroyAll'] = function() {
  return AntdModal['destroyAll']();
};
const ModalInstance: ModalInstanceConstructor = Modal;
export default ModalInstance;
