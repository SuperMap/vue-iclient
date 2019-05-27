import i18n from '../_lang';

export default class iPortalDataParameter {
  constructor(options) {
    this.url = options.url;
    this.attributeFilter = options.attributeFilter || null;
    this.name = options.name || i18n.t('commontypes.iportalData');
  }
}
