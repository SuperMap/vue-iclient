import GlobalEvent from 'vue-iclient-core/utils/global-event';
import themeFactory from 'vue-iclient-core/utils/style/theme/theme';

export default new GlobalEvent<Record<string, any>>(themeFactory[1]);
