import { withKnobs, text, number, boolean, color } from '@storybook/addon-knobs';
import { toI18n } from '../../.storybook/lang';

export default { title: 'Chart/liquidfill', decorators: [withKnobs] };

export const Liquidfill = () => ({
  props: {
    value: {
      default: text('value', '0.5')
    }
  },
  template: `<sm-liquid-fill style="width:200px; height:200px" v-bind="$props"></sm-liquid-fill>`
});
Liquidfill.story = {
  name: toI18n('basicComponent.basic')
};

export const WaveLiquidfill = () => ({
  props: {
    waveCount: {
      default: number('waveCount', 2)
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
  name: toI18n('chartComponent.liquidfill.type')
};

export const ColorfulLiquidfill = () => ({
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
  name: toI18n('chartComponent.liquidfill.color')
};
