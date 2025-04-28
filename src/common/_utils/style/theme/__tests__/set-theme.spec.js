import { setTheme } from '../set-theme.ts';
import globalEvent from 'vue-iclient/src/common/_utils/global-event';

describe('set-theme test', () => {
  beforeAll(() => {});

  it('setTheme null', done => {
    setTheme();
    const nextTheme = globalEvent.$options.theme;
    expect(nextTheme.label).toBe('light');
    done();
  });

  it('setTheme string dark', done => {
    setTheme('dark');
    const nextTheme = globalEvent.$options.theme;
    expect(nextTheme.label).toBe('dark');
    done();
  });

  it('setTheme string themeFactory[1]', done => {
    setTheme('darkssss');
    const nextTheme = globalEvent.$options.theme;
    expect(nextTheme.label).toBe('light');
    done();
  });
  it('setTheme componentBackground', done => {
    setTheme({ componentBackground: 'red' });
    const nextTheme = globalEvent.$options.theme;
    expect(nextTheme.componentBackground).toBe('red');
    done();
  });

  it('setTheme collapseCardBackground', done => {
    setTheme({ collapseCardBackground: 'yellow' });
    const nextTheme = globalEvent.$options.theme;
    expect(nextTheme.collapseCardBackground).toBe('yellow');
    done();
  });
  it('setTheme ignoreElements', done => {
    setTheme({ componentBackground: 'red', textColor: '' }, { ignoreElements: ['textColor']});
    const nextTheme = globalEvent.$options.theme;
    expect(nextTheme.componentBackground).toBe('red');
    expect(nextTheme.textColor).not.toBe('');
    done();
  });

  afterAll(() => {});
});
