import i18n from '../_lang';

export default class RestParameter {
  constructor(options) {
    this.url = options.url;
    this.type = options.type || 'rest';
    this.attributeFilter = options.attributeFilter || null;
    this.maxFeatures = options.maxFeatures || 20;
    this.name = options.name || i18n.t('commontypes.restData');
  }
}
