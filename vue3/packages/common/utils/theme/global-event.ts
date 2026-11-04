import type { AliasToken }  from './interface'
import GlobalEvent from '@supermapgis/iclient-components-core/core/utils/global-event';
import { themeTokenMapping } from './colors'

export default new GlobalEvent<AliasToken>(themeTokenMapping.light);
