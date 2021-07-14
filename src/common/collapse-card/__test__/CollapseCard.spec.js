import {
  mount
} from '@vue/test-utils';
import SmCollapseCard from '../CollapseCard.vue';

describe('CollapseCard.vue', () => {
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
    wrapper = mount(SmCollapseCard);
    expect(wrapper.find('.sm-component-collapse-card').exists()).toBe(true);
    expect(wrapper.find('.sm-component-collapse-card__content').element.style.background).toBe('transparent');
    expect(wrapper.find('.sm-component-collapse-card__body').element.style.background).toBe('transparent');
  })

  it('has icon in CollapseCard', async () => {
    wrapper = mount(SmCollapseCard, {
      propsData: {
        iconClass: 'sm-component-test',
        iconPosition: 'top'
      }
    });
    expect(wrapper.find('.sm-component-collapse-card__icon').exists()).toBe(true);
    await wrapper.find('.sm-component-collapse-card__icon').trigger('click');
    expect(wrapper.vm.isShow).toBe(false);
  })
})