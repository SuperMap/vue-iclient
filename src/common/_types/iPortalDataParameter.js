import { geti18n } from 'vue-iclient/src/common/_lang/index';

export default class iPortalDataParameter {
  constructor(options) {
    this.type = 'iPortal';
    this.url = options.url;
    this.attributeFilter = options.attributeFilter || null;
    this.maxFeatures = options.maxFeatures || 20;
    this.name = options.name || geti18n().t('commontypes.iportalData');
    this.withCredentials = options.withCredentials || false;
  }
}
