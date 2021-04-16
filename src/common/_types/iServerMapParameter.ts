import { geti18n } from 'vue-iclient/src/common/_lang/index';
import iServerBaseParameter, { iServerOptions } from 'vue-iclient/src/common/_types/iServerBaseParameter';

export default class iServerMapParameter extends iServerBaseParameter {
  layerName: string;
  name: string;

  constructor(options: iServerOptions) {
    super(options);
    this.layerName = options.layerName;
    this.name = options.name || geti18n().t('commontypes.restMap');
  }
}
