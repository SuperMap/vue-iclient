import i18n from '../../lang';
export default class RestMapParameter {
  constructor(options) {
    this.url = options.url;
    this.layerName = options.layerName;
    this.attributeFilter = options.attributeFilter || null;
    this.name = options.name || i18n.t('commontypes.restMap');
  }
}
