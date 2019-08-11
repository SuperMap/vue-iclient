import { geti18n } from '../_lang';

export default class RestDataParameter {
  constructor(options) {
    this.url = options.url;
    this.dataName = options.dataName;
    this.attributeFilter = options.attributeFilter || null;
    this.maxFeatures = options.maxFeatures || 20;
    this.name = options.name || geti18n().t('commontypes.restData');
  }
}
