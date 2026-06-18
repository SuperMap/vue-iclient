import { getDefaultLayerStyle } from '../index';
import LineStyle from '../LineStyle';
import CircleStyle from '../CircleStyle';
import FillStyle from '../FillStyle';

describe('getDefaultLayerStyle', () => {
  it('returns default style with default color', () => {
    const style = getDefaultLayerStyle();

    expect(style.line).toBeInstanceOf(LineStyle);
    expect(style.circle).toBeInstanceOf(CircleStyle);
    expect(style.fill).toBeInstanceOf(FillStyle);
    expect(style.strokeLine).toBeInstanceOf(LineStyle);

    expect(style.line.paint['line-color']).toEqual('#409eff');

    expect(style.circle.paint['circle-color']).toEqual('#409eff');

    expect(style.fill.paint['fill-color']).toEqual('#409eff');

    expect(style.strokeLine.paint['line-color']).toEqual('#409eff');
  });

  it('returns style with custom highlight color', () => {
    const customColor = '#ff0000';
    const style = getDefaultLayerStyle(customColor);

    expect(style.line.paint['line-color']).toBe(customColor);
    expect(style.circle.paint['circle-color']).toBe(customColor);
    expect(style.circle.paint['circle-stroke-color']).toBe(customColor);
    expect(style.fill.paint['fill-color']).toBe(customColor);
    expect(style.fill.paint['fill-outline-color']).toBe(customColor);
    expect(style.strokeLine.paint['line-color']).toBe(customColor);
  });

  it('returns four style objects', () => {
    const style = getDefaultLayerStyle();
    const keys = Object.keys(style);

    expect(keys).toHaveLength(4);
    expect(keys).toContain('line');
    expect(keys).toContain('circle');
    expect(keys).toContain('fill');
    expect(keys).toContain('strokeLine');
  });
});
