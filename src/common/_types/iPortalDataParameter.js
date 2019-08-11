import { geti18n } from '../_lang';

export default class iPortalDataParameter {
  constructor(options) {
    this.url = options.url;
    this.attributeFilter = options.attributeFilter || null;
    this.maxFeatures = options.maxFeatures || 20;
    this.name = options.name || geti18n().t('commontypes.iportalData');
    this.withCredentials = options.withCredentials || false;
  }
}
