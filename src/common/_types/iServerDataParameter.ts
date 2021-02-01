import { geti18n } from '../_lang';
import iServerBaseParameter, { iServerOptions } from './iServerBaseParameter';

export default class iServerDataParameter extends iServerBaseParameter {
  dataName: string;
  name: string;

  constructor(options: iServerOptions) {
    super(options);
    this.dataName = options.dataName;
    this.name = options.name || geti18n().t('commontypes.restData');
  }
}
