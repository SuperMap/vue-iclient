import { withKnobs, text, number, boolean, color } from '@storybook/addon-knobs';
import SmLiquidFill from '../../src/common/liquidfill/LiquidFill.vue';
import '../../src/common/liquidfill/style/liquidFill.scss';

export default { title: 'liquidfill', decorators: [withKnobs] };

export const Liquidfill = () => ({
  components: { SmLiquidFill },
  props: {
    value: {
      default: text('value', '0.5')
    }
  },
  template: `<sm-liquid-fill style="width:200px; height:200px" v-bind="$props"></sm-liquid-fill>`
});
Liquidfill.story = {
  name: '水球'
};

export const WaveLiquidfill = () => ({
  components: { SmLiquidFill },
  props: {
    waveCount: {
      default: number('waveCount', '2')
    },
    waveAnimation: {
      default: boolean('waveAnimation', true)
    }
  },
  data() {
    return {
      value: 0.5
    };
  },
  template: `<sm-liquid-fill style="width:200px; height:200px" v-bind="$props" :value="value"></sm-liquid-fill>`
});
WaveLiquidfill.story = {
  name: '水球波浪'
};

export const ColorfulLiquidfill = () => ({
  components: { SmLiquidFill },
  props: {
    waveColor: {
      default: color('waveColor', 'red')
    },
    borderColor: {
      default: color('borderColor', 'blue')
    },
    labelColor: {
      default: color('labelColor', '#626c91')
    },
    insideLabelColor: {
      default: color('insideLabelColor', '#fff')
    },
    backgroundColor: {
      default: color('backgroundColor', 'yellow')
    }
  },
  data() {
    return {
      value: 0.55
    };
  },
  template: `<sm-liquid-fill style="width:200px; height:200px" v-bind="$props" :value="value"></sm-liquid-fill>`
});
ColorfulLiquidfill.story = {
  name: '水球颜色'
};
