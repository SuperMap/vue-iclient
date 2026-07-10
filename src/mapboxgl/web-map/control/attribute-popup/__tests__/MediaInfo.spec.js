import { mount, config } from '@vue/test-utils';
import MediaInfo from '../MediaInfo.vue';

const PlayerStub = {
  name: 'SmPlayer',
  template: '<div class="player-stub">{{ type }}-{{ value }}</div>',
  props: ['type', 'value', 'options', 'title']
};

describe('MediaInfo.vue', () => {
  let wrapper;

  beforeEach(() => {
    config.mapLoad = false;
    wrapper = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    config.mapLoad = true;
    if (wrapper) {
      wrapper.destroy();
    }
  });

  const mountMediaInfo = (infos = []) => {
    return mount(MediaInfo, {
      propsData: { infos },
      stubs: { SmPlayer: PlayerStub }
    });
  };

  it('renders with default empty infos', () => {
    wrapper = mount(MediaInfo);
    expect(wrapper.vm.infos).toEqual([]);
    expect(wrapper.vm.currentInfo).toEqual({});
  });

  it('renders single media with SmPlayer', () => {
    wrapper = mountMediaInfo([
      { type: 'IMAGE', value: 'http://example.com/img.png', title: 'Photo', options: {} }
    ]);
    expect(wrapper.find('.player-stub').exists()).toBe(true);
    expect(wrapper.find('.player-stub').text()).toContain('IMAGE');
    expect(wrapper.find('.sm-component-slideshow').exists()).toBe(false);
  });

  it('renders slideshow when multiple media items exist', () => {
    wrapper = mountMediaInfo([
      { type: 'IMAGE', value: 'img1.png', title: 'Photo 1', options: {} },
      { type: 'VIDEO', value: 'video.mp4', title: 'Video 1', options: {} }
    ]);
    expect(wrapper.find('.sm-component-slideshow').exists()).toBe(true);
    expect(wrapper.findAll('.player-stub').length).toBe(2);
    expect(wrapper.find('.pagination').text()).toBe('1 / 2');
  });

  it('computes currentInfo and currentIndex', () => {
    wrapper = mountMediaInfo([
      { type: 'IMAGE', value: 'img1.png', title: 'First', titleStyle: { color: 'red' } },
      { type: 'IMAGE', value: 'img2.png', title: 'Second' }
    ]);
    expect(wrapper.vm.currentInfo.title).toBe('First');
    expect(wrapper.vm.currentIndex).toBe(1);
    wrapper.vm.sliderIndex = 1;
    expect(wrapper.vm.currentInfo.title).toBe('Second');
    expect(wrapper.vm.currentIndex).toBe(2);
  });

  it('resets sliderIndex when infos change', async () => {
    wrapper = mountMediaInfo([
      { type: 'IMAGE', value: 'img1.png', title: 'First' },
      { type: 'IMAGE', value: 'img2.png', title: 'Second' }
    ]);
    wrapper.vm.sliderIndex = 1;
    await wrapper.setProps({
      infos: [{ type: 'IMAGE', value: 'new.png', title: 'New' }]
    });
    expect(wrapper.vm.sliderIndex).toBe(0);
  });

  it('displays current title with style', () => {
    wrapper = mountMediaInfo([
      { type: 'IMAGE', value: 'img.png', title: 'My Title', titleStyle: { fontWeight: 'bold' } }
    ]);
    const title = wrapper.find('.title');
    expect(title.text()).toBe('My Title');
    expect(title.attributes('style')).toContain('font-weight: bold');
  });

  it('returns empty currentInfo when infos is empty', () => {
    wrapper = mountMediaInfo([]);
    expect(wrapper.vm.currentInfo).toEqual({});
    expect(wrapper.vm.currentIndex).toBe(1);
  });
});
