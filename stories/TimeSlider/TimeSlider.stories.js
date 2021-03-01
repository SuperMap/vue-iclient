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
  methods: {
    changed(e) {
      console.log(e);
    },
    playChanged(e) {
      console.log('play state', e);
    }
  },
  template: `
  <SmTimeSlider :data="data" style="width:100%" @timeplayerchanged="changed" @timeplayerplaychanged="playChanged"></SmTimeSlider>
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
  <SmTimeSlider :duration="duration" style="width:100%"></SmTimeSlider>
  `
});
DurationTimeSlider.story = {
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
        lineStyle: { color: '#CB7C3F', height: '6px', type: 'solid' },
        label: {
          show: true,
          color: '#91A4C4',
          interval: 'auto',
          fontSize: 12,
          fontWeight: 'normal',
          fontFamily: '微软雅黑',
          backgroundColor: 'transparent'
        },
        checkpointStyle: { color: '#CB7C3F', background: '#5A9B9C' },
        themeStyle: { color: '#A44A5D' }
      }
    };
  },
  template: `<SmTimeSlider v-bind="timeSliderProps" style="width:100%"></SmTimeSlider>`
});
StyleTimeSlider.story = {
  name: toI18n('basicComponent.timeSlider.style')
};
