import VueTestUtils from '@vue/test-utils';

VueTestUtils.config.mocks['$t'] = msg => msg;

window.getComputedStyle = () => {
  return {
    getPropertyValue: (colorVariable) => {
      switch (colorVariable) {
        case '--component-background':
          return 'rgb(255, 255, 255)';
          break;
        case '--alpha65':
          return 'rgba(0, 0, 0, 0.65)';
          break;
        case '--alpha0':
          return '#F4F4F4';
          break;
        case '--container-basic':
          return '#414141';
          break;
        case '--container-shadow-modal':
          return '#535353';
          break;
        default:
          return '';
          break;
      }
    }
  }
};