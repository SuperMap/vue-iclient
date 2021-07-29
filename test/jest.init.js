import VueTestUtils from '@vue/test-utils';

VueTestUtils.config.mocks['$t'] = msg => msg;

window.getComputedStyle = () => {
  return {
    getPropertyValue: (colorVariable) => {
      switch (colorVariable) {
        case '--background':
          return 'rgb(255, 255, 255)';
          break;
        case '--text-color':
          return 'rgba(0, 0, 0, 0.65)';
          break;
        case '--collapse-card-header-bg':
          return '#F4F4F4';
          break;
        case '--collapse-card-background':
          return '#414141';
          break;
        case '--message-background':
          return '#535353';
          break;
        default:
          return '';
          break;
      }
    }
  }
};