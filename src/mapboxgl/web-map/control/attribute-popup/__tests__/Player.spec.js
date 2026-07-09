import { mount, config } from '@vue/test-utils';
import Player from '../Player.vue';

const ImagePreviewStub = {
  name: 'ImagePreview',
  template: '<div class="image-preview-stub" @click="$emit(\'load\')" />',
  props: ['src', 'previewMode', 'width']
};

describe('Player.vue', () => {
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

  const mountPlayer = (propsData = {}) => {
    return mount(Player, {
      propsData,
      stubs: { ImagePreview: ImagePreviewStub }
    });
  };

  it('renders image player when type is IMAGE', () => {
    wrapper = mountPlayer({
      type: 'IMAGE',
      value: 'http://example.com/image.png'
    });
    expect(wrapper.find('.image-preview-stub').exists()).toBe(true);
    expect(wrapper.find('video').exists()).toBe(false);
  });

  it('renders video player when type is VIDEO', () => {
    wrapper = mountPlayer({
      type: 'VIDEO',
      value: 'http://example.com/video.mp4',
      options: { controls: true, objectFit: 'cover' }
    });
    const video = wrapper.find('video');
    expect(video.exists()).toBe(true);
    expect(video.attributes('src')).toBe('http://example.com/video.mp4');
  });

  it('shows error icon when image load fails', async () => {
    wrapper = mountPlayer({
      type: 'IMAGE',
      value: 'http://example.com/bad.png'
    });
    wrapper.vm.handleImageLoad(false);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.sm-player-loade-error').exists()).toBe(true);
    expect(wrapper.find('.sm-components-icon-jiazaishibai').exists()).toBe(true);
  });

  it('shows error icon when video load fails', async () => {
    wrapper = mountPlayer({
      type: 'VIDEO',
      value: 'http://example.com/bad.mp4'
    });
    wrapper.vm.handleVideoLoad(false);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.sm-player-loade-error').exists()).toBe(true);
  });

  it('resets load state when value changes', async () => {
    wrapper = mountPlayer({
      type: 'IMAGE',
      value: 'http://example.com/image1.png'
    });
    wrapper.vm.handleImageLoad(false);
    await wrapper.setProps({ value: 'http://example.com/image2.png' });
    expect(wrapper.vm.loadImg).toBe(true);
    expect(wrapper.vm.loadVideo).toBe(true);
  });

  it('uses default options', () => {
    wrapper = mountPlayer({ type: 'VIDEO', value: 'http://example.com/video.mp4' });
    expect(wrapper.vm.options).toEqual({
      autoplay: false,
      objectFit: 'fill',
      loop: false,
      muted: true,
      controls: true,
      previewMode: 'full'
    });
  });

  it('hides error when image loads successfully', async () => {
    wrapper = mountPlayer({
      type: 'IMAGE',
      value: 'http://example.com/image.png'
    });
    wrapper.vm.handleImageLoad(false);
    await wrapper.vm.$nextTick();
    wrapper.vm.handleImageLoad(true);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.sm-player-loade-error').exists()).toBe(false);
  });
});
