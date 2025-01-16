import { geti18n } from 'vue-iclient/src/common/_lang/index';

export default class AddressMatchParameter {
  constructor(options) {
    this.url = options.url;
    this.name = options.name || geti18n().t('commontypes.addressMatch');
    this.proxy = options.proxy;
  }
}
