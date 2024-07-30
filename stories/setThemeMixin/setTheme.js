import { setTheme } from '@supermapgis/vue-iclient-mapboxgl/lib/_utils/style/theme/set-theme';

export default {
  beforeCreate() {
    setTheme('dark');
  }
};
