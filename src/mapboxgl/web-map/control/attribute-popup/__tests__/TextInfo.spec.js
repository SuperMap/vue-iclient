import { mount, config } from '@vue/test-utils';
import TextInfo from '../TextInfo.vue';
import ConvertUtil from '../util/ExpressionConverter';
import Delta from 'quill-delta';
import { Quill } from 'vue2-editor/dist/vue2-editor.core.js';

const mockSetContents = jest.fn();
const mockFontAttributor = { whitelist: [] };

const VueEditorStub = {
  name: 'VueEditor',
  render(h) {
    return h('div', { class: 'vue-editor-stub' });
  },
  props: ['editorOptions', 'disabled'],
  data() {
    return {
      quill: { setContents: mockSetContents }
    };
  }
};

jest.mock('vue2-editor/dist/vue2-editor.core.js', () => ({
  VueEditor: { name: 'VueEditor' },
  Quill: {
    import: jest.fn(),
    register: jest.fn()
  }
}));

jest.mock('quill-delta', () => {
  return jest.fn().mockImplementation(function Delta(ops) {
    this.ops = ops;
  });
});

jest.mock('../util/ExpressionConverter', () => ({
  __esModule: true,
  default: {
    getTextInfosString: jest.fn(ops => ops)
  }
}));

describe('TextInfo.vue', () => {
  let wrapper;

  beforeEach(() => {
    config.mapLoad = false;
    wrapper = null;
    mockSetContents.mockClear();
    Quill.import.mockReturnValue(mockFontAttributor);
    ConvertUtil.getTextInfosString.mockImplementation(ops => ops);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    config.mapLoad = true;
    if (wrapper) {
      wrapper.destroy();
    }
  });

  const mountTextInfo = (propsData = {}) => {
    return mount(TextInfo, {
      propsData,
      stubs: { VueEditor: VueEditorStub }
    });
  };

  it('renders VueEditor with readonly options', () => {
    wrapper = mountTextInfo();
    expect(wrapper.find('.vue-editor-stub').exists()).toBe(true);
    const editor = wrapper.find({ name: 'VueEditor' });
    expect(editor.props('editorOptions')).toEqual({
      isReadOnly: true,
      modules: { toolbar: false }
    });
  });

  it('uses default props', () => {
    wrapper = mountTextInfo();
    expect(wrapper.vm.title).toBe('');
    expect(wrapper.vm.infos).toEqual([]);
    expect(TextInfo.props.infos.default()).toEqual([]);
  });

  it('computes formattedValue from infos directly', () => {
    const infos = [{ insert: 'Hello World' }];
    wrapper = mountTextInfo({ infos });
    expect(wrapper.vm.formattedValue).toEqual(infos);
  });

  it('computes formattedValue via valueToContents when value has ops', () => {
    const ops = [{ insert: 'Hello {name}' }];
    const converted = [{ insert: 'Hello {name}' }];
    ConvertUtil.getTextInfosString.mockReturnValue(converted);

    wrapper = mountTextInfo();
    const result = wrapper.vm.valueToContents({ ops });
    expect(ConvertUtil.getTextInfosString).toHaveBeenCalledWith(ops);
    expect(result).toEqual(converted);
  });

  it('returns value as-is when value has no ops', () => {
    wrapper = mountTextInfo();
    const value = [{ insert: 'plain text' }];
    expect(wrapper.vm.valueToContents(value)).toEqual(value);
  });

  it('creates contentDelta from formattedValue', () => {
    const infos = [{ insert: 'Test content' }];
    wrapper = mountTextInfo({ infos });
    expect(Delta).toHaveBeenCalledWith(infos);
    expect(wrapper.vm.contentDelta.ops).toEqual(infos);
  });

  it('initializes quill on mount and sets contents', async () => {
    const infos = [{ insert: 'Initial content' }];
    wrapper = mountTextInfo({ infos });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(Quill.import).toHaveBeenCalledWith('attributors/style/font');
    expect(Quill.register).toHaveBeenCalledWith(mockFontAttributor, true);
    expect(mockFontAttributor.whitelist).toEqual([
      'Microsoft-YaHei',
      'SimSun',
      'SimHei',
      'KaiTi',
      'FangSong',
      'Arial',
      'Times-New-Roman',
      'sans-serif'
    ]);
    expect(wrapper.vm.quill).toBeTruthy();
    expect(mockSetContents).toHaveBeenCalled();
  });

  it('updates quill contents when contentDelta changes', async () => {
    wrapper = mountTextInfo({ infos: [{ insert: 'First' }] });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    mockSetContents.mockClear();

    await wrapper.setProps({ infos: [{ insert: 'Updated' }] });
    await wrapper.vm.$nextTick();

    expect(mockSetContents).toHaveBeenCalled();
  });

  it('does not call setContents in watcher when quill is null', async () => {
    wrapper = mountTextInfo({ infos: [{ insert: 'First' }] });
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    mockSetContents.mockClear();
    wrapper.vm.quill = null;

    await wrapper.setProps({ infos: [{ insert: 'Updated' }] });
    await wrapper.vm.$nextTick();

    expect(mockSetContents).not.toHaveBeenCalled();
  });

  it('clears quill on beforeDestroy', async () => {
    wrapper = mountTextInfo();
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.quill).toBeTruthy();

    wrapper.destroy();
    expect(wrapper.vm.quill).toBeNull();
  });

  it('handles missing editor ref in initQuill', () => {
    wrapper = mountTextInfo();
    wrapper.vm.$refs.editor = null;
    wrapper.vm.initQuill();
    expect(wrapper.vm.quill).toBeNull();
  });
});
