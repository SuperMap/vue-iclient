import { setDefaultIndicator } from 'ant-design-vue/es/spin/Spin';
import Spin from './Spin.vue';

type SpinInstanceType = typeof Spin;

interface SpinInstanceConstructor extends SpinInstanceType {
  setDefaultIndicator?: Function;
}

Spin['setDefaultIndicator'] = setDefaultIndicator;

const SpinInstance: SpinInstanceConstructor = Spin;
export default SpinInstance;
