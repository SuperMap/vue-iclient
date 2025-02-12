import { mount, shallowMount } from '@vue/test-utils';
import SmButton from '../../button';
import globalEvent from 'vue-iclient-core/utils/global-event';
import Theme from '../Theme';

describe('Theme.ts', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  });

  it('render default correctly', () => {
    wrapper = mount({
      template: `<sm-button>按钮</sm-button>`,
      components: {
        SmButton
      }
    });
    expect(wrapper.text()).toBe('按钮');
    expect(wrapper.vm.$children[0].getBackgroundStyle.background).toBe('#fff');
    expect(wrapper.vm.$children[0].getTextColorStyle.color).toBe('rgba(0, 0, 0, 0.65)');
    expect(wrapper.vm.$children[0].collapseCardHeaderBgStyle.background).toBe('#F4F4F4');
    expect(wrapper.vm.$children[0].collapseCardBackgroundStyle.background).toBe('#414141');
    expect(wrapper.vm.$children[0].tablePopupBgStyle.background).toBe('#535353');
  });

  const themeStyle = {
    background: '#000',
    textColor: '#fff',
    colorGroup: ['#f2f2f2', '#759aa0', '#e69d87', '#8dc1a9', '#ea7e53']
  };
  const propsData = {
    background: '#fff',
    colorGroup: ['#ea7e53', '#8dc1a9', '#e69d87', '#759aa0', '#f2f2f2']
  };
  it('change theme', () => {
    wrapper = shallowMount(Theme, {
      propsData
    });
    expect(wrapper.vm.backgroundData).toBe(propsData.background);
    expect(wrapper.vm.textColorsData).not.toBeUndefined();
    expect(wrapper.vm.collapseCardHeaderBgData).toBe(wrapper.vm.background);
    globalEvent.changeTheme(themeStyle);
    expect(wrapper.vm.backgroundData).toBe(themeStyle.background);
    expect(wrapper.vm.collapseCardHeaderBgData).not.toBe(wrapper.vm.background);
  });
  it('change theme without backgound', () => {
    wrapper = shallowMount(Theme, {
      propsData
    });
    const themeStyleWithoutBackground = { ...themeStyle };
    delete themeStyleWithoutBackground.background;
    const currentBackgroundData = wrapper.vm.backgroundData;
    expect(currentBackgroundData).toBe(propsData.background);
    expect(wrapper.vm.collapseCardHeaderBgData).toBe(wrapper.vm.background);
    globalEvent.changeTheme(themeStyleWithoutBackground);
    expect(wrapper.vm.collapseCardHeaderBgData).toBe(wrapper.vm.background);
  });
});
