import { toI18n } from '../../.storybook/lang';
import theme from '../setThemeMixin/setTheme';

export default { title: 'Basic Components/indicator' };

export const BasicIndicator = () => ({
  mixins: [theme],
  template: `
  <sm-indicator title="建筑高度" unit="米" num="1588"></sm-indicator>
  `
});
BasicIndicator.story = {
  name: toI18n('basicComponent.basic')
};

export const SmallIndicator = () => ({
  data() {
    return {
      num: 1588
    };
  },
  template: `
  <div style="width: 300px; height:200px; display: flex; flex-direction:column; justify-content:space-between;">
    <sm-indicator fontSize="14px" :num="num"></sm-indicator>
    <sm-indicator fontSize="18px" :num="num"></sm-indicator>
    <sm-indicator fontSize="24px" :num="num"></sm-indicator>
  </div>
  `
});
SmallIndicator.story = {
  name: toI18n('basicComponent.indicator.size')
};

export const StyleIndicator = () => ({
  template: `
  <sm-indicator fontWeight="border" textFontSize="14px" textColor="green" indicatorColor="red" :num="1588"></sm-indicator>
  `
});
StyleIndicator.story = {
  name: toI18n('basicComponent.indicator.style')
};

export const SeparatorIndicator = () => ({
  data() {
    return {
      num: 1588,
      title: '建筑高度',
      unit: '米'
    };
  },
  template: `
  <sm-indicator 
  :num="num" 
  :title="title"
  separator="-"
  :separatorBackground="false"
  :unit="unit">
  </sm-indicator>
  `
});
SeparatorIndicator.story = {
  name: toI18n('basicComponent.indicator.separator')
};

export const AnimatedIndicator = () => ({
  data() {
    return {
      num: 1588,
      title: '建筑高度',
      unit: '米'
    };
  },
  template: `
  <sm-indicator 
  :animated="true" 
  :num="num" 
  :title="title" 
  :unit="unit">
  </sm-indicator>
  `
});
AnimatedIndicator.story = {
  name: toI18n('basicComponent.indicator.animated')
};

export const ModeIndicator = () => ({
  data() {
    return {
      num: 1588,
      title: '建筑高度',
      unit: '米'
    };
  },
  template: `
  <sm-indicator mode="vertical" :num="num" :title="title" :unit="unit">
  </sm-indicator>
  `
});
ModeIndicator.story = {
  name: toI18n('basicComponent.indicator.mode')
};

export const NumIndicator = () => ({
  data() {
    return {
      numBackground: {
        color: 'rgba(0, 0, 0, 0)',
        image: 'https://iclient.supermap.io/img/whatsNewLandUse.png',
        padding: 0
      },
      num: 1588,
      title: '建筑高度',
      unit: '米'
    };
  },
  template: `
  <sm-indicator 
  :numSpacing="1" 
  :num="num" 
  :title="title" 
  :unit="unit"
  :numBackground="numBackground"
  ></sm-indicator>
  `
});
NumIndicator.story = {
  name: toI18n('basicComponent.indicator.numberStyle')
};

export const ShowTitleUnitIndicator = () => ({
  data() {
    return {
      num: 1588,
      title: '建筑高度',
      unit: '米'
    };
  },
  template: `
  <sm-indicator :showTitleUnit="false" :num="num" :title="title" :unit="unit"></sm-indicator>
  `
});
ShowTitleUnitIndicator.story = {
  name: toI18n('basicComponent.indicator.showTitleUnit')
};

export const ThresholdsStyleIndicator = () => ({
  data() {
    return {
      num: 40,
      num1: 60,
      num2: 100,
      title: '建筑高度',
      unit: '米',
      thresholdsStyle: [{
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
      ]
    };
  },
  template: `
  <div style="width: 300px; height:200px; display: flex; flex-direction:column; justify-content:space-between;">
    <sm-indicator :thresholdsStyle="thresholdsStyle" :num="num"></sm-indicator>
    <sm-indicator :thresholdsStyle="thresholdsStyle" :num="num1"></sm-indicator>
    <sm-indicator :thresholdsStyle="thresholdsStyle" :num="num2"></sm-indicator>
  </div>
  `
});
ThresholdsStyleIndicator.story = {
  name: toI18n('basicComponent.indicator.thresholdsStyle')
};
