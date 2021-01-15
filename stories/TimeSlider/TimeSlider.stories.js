import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default {
  title: `${toI18n('basicComponent.title')}/${toI18n('basicComponent.timeSlider.title')}`,
  id: 'BasicComponents/time-slider'
};

export const BasicTimeSlider = () => ({
  mixins: [theme],
  data() {
    return {
      data: [1599810915, 1599810920, 1599810925, 1599810930, 1599810935, 1599810940, 1599810945]
    };
  },
  template: `
  <SmTimeSlider :data="data"></SmTimeSlider>
  `
});
BasicTimeSlider.story = {
  name: toI18n('basicComponent.basic')
};

export const DurationTimeSlider = () => ({
  mixins: [theme],
  data() {
    return {
      duration: 6000
    };
  },
  template: `
  <SmTimeSlider :duration="duration"></SmTimeSlider>
  `
});
BasicTimeSlider.story = {
  name: toI18n('basicComponent.timeSlider.duration')
};

export const StyleTimeSlider = () => ({
  data() {
    return {
      timeSliderProps: {
        playInterval: 3000,
        autoPlay: false,
        loop: true,
        timeType: 'time',
        duration: 6000,
        lineStyle: { color: 'yellow', height: '5px', type: 'solid' },
        label: {
          show: true,
          color: 'green',
          interval: 'auto',
          fontSize: 12,
          fontWeight: 'normal',
          fontFamily: '微软雅黑',
          backgroundColor: 'transparent'
        },
        checkpointStyle: { color: 'blue', borderColor: 'blue' },
        themeStyle: {}
      }
    };
  },
  template: `<SmTimeSlider v-bind="timeSliderProps"></SmTimeSlider>`
});
StyleTimeSlider.story = {
  name: toI18n('basicComponent.timeSlider.style')
};
