import { withKnobs, text, select, number, boolean, color } from '@storybook/addon-knobs';

export default { title: 'Chart/progress', decorators: [withKnobs] };

export const BasicProgress = () => ({
  props: {
    percent: {
      default: text('percent', '50')
    }
  },
  template: `<sm-progress style="width:600px; height:600px" v-bind="$props"></sm-progress>`
});
BasicProgress.story = {
  name: '进度条'
};

export const ColorProgress = () => ({
  props: {
    strokeColor: {
      default: color('strokeColor', 'red')
    },
    trailColor: {
      default: color('trailColor', 'yellow')
    }
  },
  data() {
    return {
      percent: 50
    };
  },
  template: `<sm-progress style="width:400px; height:400px" v-bind="$props" :percent="percent"></sm-progress>`
});
ColorProgress.story = {
  name: '进度条色彩'
};

export const ShowInfoProgress = () => ({
  props: {
    showInfo: {
      default: boolean('showInfo', true)
    }
  },
  data() {
    return {
      percent: 50
    };
  },
  template: `<sm-progress style="width:400px; height:400px;" v-bind="$props" :percent="percent"></sm-progress>`
});
ShowInfoProgress.story = {
  name: '显示进度条数值'
};

export const StausProgress = () => ({
  props: {
    status: {
      default: select('status', ['success', 'exception', 'normal', 'active'], 'success')
    }
  },
  data() {
    return {
      percent: 50
    };
  },
  template: `<sm-progress style="width:400px; height:400px" v-bind="$props" :percent="percent"></sm-progress>`
});
StausProgress.story = {
  name: '显示进度条的状态'
};

export const CircleProgress = () => ({
  props: {
    type: {
      default: select('type', ['line', 'circle', 'dashboard'], 'circle')
    }
  },
  data() {
    return {
      percent: 50
    };
  },
  template: `<sm-progress style="width:400px; height:400px" v-bind="$props" :percent="percent"></sm-progress>`
});
CircleProgress.story = {
  name: '进度环'
};

export const DashboardProgress = () => ({
  props: {
    type: {
      default: select('type', ['dashboard'], 'dashboard')
    },
    gapDegree: {
      default: number('gapDegree', 0, {
        range: true,
        min: 0,
        max: 360
      })
    },
    gapPosition: {
      default: select('gapPosition', ['top', 'bottom', 'left', 'right'], 'top')
    }
  },
  data() {
    return {
      percent: 50
    };
  },
  template: `<sm-progress style="width:400px; height:400px" v-bind="$props" :percent="percent"></sm-progress>`
});
DashboardProgress.story = {
  name: '仪表盘进度条'
};

export const BigProgress = () => ({
  props: {
    type: {
      default: select('type', ['line', 'circle'], 'circle')
    },
    strokeWidth: {
      default: number('strokeWidth', '24')
    }
  },
  data() {
    return {
      percent: 50
    };
  },
  template: `<sm-progress style="width:400px; height:400px" v-bind="$props" :percent="percent"></sm-progress>`
});
BigProgress.story = {
  name: '进度条宽度'
};
