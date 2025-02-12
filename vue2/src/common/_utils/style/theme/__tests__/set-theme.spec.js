import { setTheme } from '../set-theme.ts';
import globalEvent from 'vue-iclient-core/utils/global-event';

describe('set-theme test', () => {
  beforeAll(() => {});

  it('setTheme null', done => {
    setTheme();
    const nextTheme = globalEvent.theme;
    expect(nextTheme.label).toBe('light');
    done();
  });

  it('setTheme string dark', done => {
    setTheme('dark');
    const nextTheme = globalEvent.theme;
    expect(nextTheme.label).toBe('dark');
    done();
  });

  it('setTheme string themeFactory[1]', done => {
    setTheme('darkssss');
    const nextTheme = globalEvent.theme;
    expect(nextTheme.label).toBe('light');
    done();
  });
  it('setTheme componentBackground', done => {
    setTheme({ componentBackground: 'red' });
    const nextTheme = globalEvent.theme;
    expect(nextTheme.componentBackground).toBe('red');
    done();
  });

  it('setTheme collapseCardBackground', done => {
    setTheme({ collapseCardBackground: 'yellow' });
    const nextTheme = globalEvent.theme;
    expect(nextTheme.collapseCardBackground).toBe('yellow');
    done();
  });

  afterAll(() => {});
});
