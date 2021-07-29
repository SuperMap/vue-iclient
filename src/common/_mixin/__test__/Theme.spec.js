import {
  mount
} from '@vue/test-utils';
import SmButton from '../../button';
import SmLiquidFill from '../../liquid-fill';
import Theme from '../Theme'
import {
  setTheme
} from '../../_utils/style/theme/set-theme'

describe('Theme.ts', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = null;
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.destroy();
    }
  })

  it('render default correctly', () => {
    wrapper = mount({
      template: `<sm-button>按钮</sm-button>`,
      components: {
        SmButton
      }
    })
    expect(wrapper.text()).toBe('按 钮');
    expect(wrapper.vm.$children[0].getBackgroundStyle.background).toBe('rgb(255, 255, 255)');
    expect(wrapper.vm.$children[0].getTextColorStyle.color).toBe('rgba(0, 0, 0, 0.65)');
    expect(wrapper.vm.$children[0].collapseCardHeaderBgStyle.background).toBe('#F4F4F4');
    expect(wrapper.vm.$children[0].collapseCardBackgroundStyle.background).toBe('#414141');
    expect(wrapper.vm.$children[0].tablePopupBgStyle.background).toBe('#535353');
  })
})