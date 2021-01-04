import { setTheme } from '../../src/common/_utils/style/theme/set-theme';

export default {
  beforeCreate() {
    setTheme('dark');
  }
};
