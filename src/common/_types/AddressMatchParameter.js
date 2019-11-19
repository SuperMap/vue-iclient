import { geti18n } from '../_lang';

export default class AddressMatchParameter {
  constructor(options) {
    this.url = options.url;
    this.name = options.name || geti18n().t('commontypes.addressMatch');
    this.proxy = options.proxy;
  }
}
