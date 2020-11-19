import { withKnobs, text, select, boolean, number, object, array, color } from '@storybook/addon-knobs';

export default { title: 'Basic/indicator', decorators: [withKnobs] };

export const BasicIndicator = () => ({
  props: {
    title: {
      default: text('title', '建筑高度')
    },
    unit: {
      default: text('unit', '米')
    },
    num: {
      default: text('num', '1588')
    }
  },
  template: '<sm-indicator v-bind="$props"></sm-indicator>'
});
BasicIndicator.story = {
  name: '指标'
};

export const SmallIndicator = () => ({
  props: {
    fontSize: {
      default: text('fontSize', '14px')
    }
  },
  data() {
    return {
      num: 1588,
      middleStyle: { fontSize: '18px' },
      largeStyle: { fontSize: '24px' }
    };
  },
  template:
    '<div style="width: 300px; height:200px; display: flex; flex-direction:column; justify-content:space-between;"><sm-indicator v-bind="$props" :num="num"></sm-indicator><sm-indicator v-bind="$props" :fontSize="middleStyle.fontSize" :num="num"></sm-indicator><sm-indicator v-bind="$props" :fontSize="largeStyle.fontSize" :num="num"></sm-indicator></div>'
});
SmallIndicator.story = {
  name: '不同大小的指标'
};

export const StyleIndicator = () => ({
  props: {
    fontWeight: {
      default: select('fontWeight', ['border', 'normal', 'lighter'], 'border')
    },
    textFontSize: {
      default: text('textFontSize', '14px')
    },
    textColor: {
      default: color('textColor', 'green')
    },
    indicatorColor: {
      default: color('indicatorColor', 'red')
    }
  },
  data() {
    return {
      num: 1588
    };
  },
  template: '<sm-indicator v-bind="$props" :num="num"></sm-indicator>'
});
StyleIndicator.story = {
  name: '指标样式'
};

export const SeparatorIndicator = () => ({
  props: {
    separator: {
      default: text('separator', '-')
    },
    separatorBackground: {
      default: boolean('separatorBackground', false)
    }
  },
  data() {
    return {
      num: 1588,
      title: '建筑高度',
      unit: '米'
    };
  },
  template: '<sm-indicator v-bind="$props" :num="num" :title="title" :unit="unit"></sm-indicator>'
});
SeparatorIndicator.story = {
  name: '指标分隔符'
};

export const AnimatedIndicator = () => ({
  props: {
    animated: {
      default: boolean('animated', true)
    }
  },
  data() {
    return {
      num: 1588,
      title: '建筑高度',
      unit: '米'
    };
  },
  template: '<sm-indicator v-bind="$props" :num="num" :title="title" :unit="unit"></sm-indicator>'
});
AnimatedIndicator.story = {
  name: '指标数字动画'
};

export const ModeIndicator = () => ({
  props: {
    mode: {
      default: select('animated', ['vertical', 'horizontal', 'vertical'])
    }
  },
  data() {
    return {
      num: 1588,
      title: '建筑高度',
      unit: '米'
    };
  },
  template: '<sm-indicator v-bind="$props" :num="num" :title="title" :unit="unit"></sm-indicator>'
});
ModeIndicator.story = {
  name: '指标排列'
};

export const NumIndicator = () => ({
  props: {
    numSpacing: {
      default: number('numSpacing', 1)
    },
    numBackground: {
      default: object('numBackground', {
        color: 'rgba(0, 0, 0, 0)',
        image: 'https://iclient.supermap.io/img/whatsNewLandUse.png',
        padding: 0
      })
    }
  },
  data() {
    return {
      num: 1588,
      title: '建筑高度',
      unit: '米'
    };
  },
  template: '<sm-indicator v-bind="$props" :num="num" :title="title" :unit="unit"></sm-indicator>'
});
NumIndicator.story = {
  name: '指标数字样式'
};

export const ShowTitleUnitIndicator = () => ({
  props: {
    showTitleUnit: {
      default: boolean('showTitleUnit', false)
    }
  },
  data() {
    return {
      num: 1588,
      title: '建筑高度',
      unit: '米'
    };
  },
  template: '<sm-indicator v-bind="$props" :num="num" :title="title" :unit="unit"></sm-indicator>'
});
ShowTitleUnitIndicator.story = {
  name: '指标展示标题和单位'
};

export const ThresholdsStyleIndicator = () => ({
  props: {
    thresholdsStyle: {
      default: array('thresholdsStyle', [
        {
          max: 50,
          color: '#0CD54A'
        },
        {
          min: 50,
          max: 80,
          color: '#F7682D'
        },
        {
          min: 80,
          color: '#DD2C2C'
        }
      ])
    }
  },
  data() {
    return {
      num: 40,
      num1: 60,
      num2: 100,
      title: '建筑高度',
      unit: '米'
    };
  },
  template:
    '<div style="width: 300px; height:200px; display: flex; flex-direction:column; justify-content:space-between;"><sm-indicator v-bind="$props" :num="num"></sm-indicator><sm-indicator v-bind="$props" :num="num1"></sm-indicator><sm-indicator v-bind="$props" :num="num2"></sm-indicator></div>'
});
ThresholdsStyleIndicator.story = {
  name: '指标阈值'
};
