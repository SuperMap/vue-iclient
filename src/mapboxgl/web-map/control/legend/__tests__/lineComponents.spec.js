import { mount } from '@vue/test-utils';
import StyleRenderer from '../subs/StyleRenderer.vue';

// 真实 canvas 在给 width/height 赋值时会重置整个 2D 上下文状态（globalAlpha、lineWidth、strokeStyle 等），
// mock 必须还原这一行为，否则「画布尺寸重设后不透明度丢失」的问题在单测里看不出来。
function createMockCanvas() {
  const strokes = [];
  const ctx = {
    globalAlpha: 1,
    lineWidth: 1,
    strokeStyle: '#000',
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    setLineDash: jest.fn(),
    clearRect: jest.fn(),
    stroke: jest.fn(() => {
      strokes.push({
        globalAlpha: ctx.globalAlpha,
        lineWidth: ctx.lineWidth,
        strokeStyle: ctx.strokeStyle
      });
    })
  };
  const resetContextState = () => {
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000';
  };
  const canvas = { style: {}, getContext: jest.fn(() => ctx) };
  let width = 0;
  let height = 0;
  Object.defineProperty(canvas, 'width', {
    get: () => width,
    set: value => {
      width = value;
      resetContextState();
    }
  });
  Object.defineProperty(canvas, 'height', {
    get: () => height,
    set: value => {
      height = value;
      resetContextState();
    }
  });
  return { canvas, ctx, strokes };
}

function mountStyleRenderer(style) {
  const { canvas, ctx, strokes } = createMockCanvas();
  document.getElementById = jest.fn(() => canvas);
  const wrapper = mount(StyleRenderer, {
    propsData: { styleData: { style } }
  });
  return { wrapper, ctx, strokes };
}

describe('legend line components', () => {
  describe('StyleRenderer.drawDashedLine', () => {
    it('按 style.opacity 设置描边不透明度', () => {
      const { wrapper, strokes } = mountStyleRenderer({
        type: 'style',
        shape: 'line',
        width: 100,
        height: 8,
        lineWidth: 2,
        color: '#FF0000',
        opacity: 0.4
      });

      expect(strokes).toHaveLength(1);
      expect(strokes[0].globalAlpha).toBe(0.4);
      expect(strokes[0].strokeStyle).toBe('#FF0000');

      wrapper.destroy();
    });

    it('未设置 opacity 时按不透明绘制', () => {
      const { wrapper, strokes } = mountStyleRenderer({
        type: 'style',
        shape: 'line',
        width: 100,
        height: 8,
        lineWidth: 2,
        color: '#FF0000'
      });

      expect(strokes[0].globalAlpha).toBe(1);

      wrapper.destroy();
    });

    it('opacity 为 0 时绘制为完全透明，而不是回退成 1', () => {
      const { wrapper, strokes } = mountStyleRenderer({
        type: 'style',
        shape: 'line',
        width: 100,
        height: 8,
        lineWidth: 2,
        color: '#FF0000',
        opacity: 0
      });

      expect(strokes[0].globalAlpha).toBe(0);

      wrapper.destroy();
    });
  });

  describe('StyleRenderer.drawMultiLine', () => {
    it('多线符号逐层使用各自的 line-opacity', () => {
      const { wrapper, strokes } = mountStyleRenderer({
        type: 'style',
        shape: 'line',
        width: 100,
        height: 8,
        opacity: 1,
        lineStyles: [
          { lineWidth: 4, lineOffset: 0, color: '#FF0000', lineDash: [], opacity: 0.6 },
          { lineWidth: 2, lineOffset: 0, color: '#00FF00', lineDash: [], opacity: 0.2 }
        ]
      });

      expect(strokes).toHaveLength(2);
      expect(strokes.map(item => item.globalAlpha)).toEqual([0.6, 0.2]);
      expect(strokes.map(item => item.strokeStyle)).toEqual(['#FF0000', '#00FF00']);

      wrapper.destroy();
    });

    it('某层缺少 opacity 时回退到图例整体不透明度', () => {
      const { wrapper, strokes } = mountStyleRenderer({
        type: 'style',
        shape: 'line',
        width: 100,
        height: 8,
        opacity: 0.5,
        lineStyles: [
          { lineWidth: 4, lineOffset: 0, color: '#FF0000', lineDash: [], opacity: 0.3 },
          { lineWidth: 2, lineOffset: 0, color: '#00FF00', lineDash: [] }
        ]
      });

      expect(strokes.map(item => item.globalAlpha)).toEqual([0.3, 0.5]);

      wrapper.destroy();
    });
  });
});
