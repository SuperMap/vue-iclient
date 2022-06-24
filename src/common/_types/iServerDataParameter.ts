import { geti18n } from 'vue-iclient/src/common/_lang/index';
import iServerBaseParameter, { iServerOptions } from 'vue-iclient/src/common/_types/iServerBaseParameter';

export default class iServerDataParameter extends iServerBaseParameter {
  dataName: string;
  name: string;

  constructor(options: iServerOptions) {
    super(options);
    this.dataName = options.dataName;
    this.name = options.name || geti18n().t('commontypes.restData');
  }
}
