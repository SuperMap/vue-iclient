import { geti18n } from '../_lang';
import iServerBaseParameter, { iServerOptions } from './iServerBaseParameter';

export default class iServerMapParameter extends iServerBaseParameter {
  layerName: string;
  name: string;

  constructor(options: iServerOptions) {
    super(options);
    this.layerName = options.layerName;
    this.name = options.name || geti18n().t('commontypes.restMap');
  }
}
