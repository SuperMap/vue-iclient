import SymbolStyle from '../SymbolStyle';

describe('SymbolStyle test', () => {
  beforeAll(() => {});

  it('SymbolStyle', done => {
    const style = new SymbolStyle({ color: 'red' }, {});
    expect(style).not.toBeNull();
    expect(style.layout.visibility).toBe('visible');
    expect(Object.keys(style.paint).length).toBe(1);
    done();
  });
  it('SymbolStyle no paint no layout', done => {
    const style = new SymbolStyle();
    expect(style).not.toBeNull();
    expect(style.layout.visibility).toBe('visible');
    expect(Object.keys(style.paint).length).toBe(0);
    done();
  });

  afterAll(() => {});
});
