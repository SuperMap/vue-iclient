import themeFactory from 'vue-iclient-core/utils/style/theme/theme';
import { Events } from 'vue-iclient-core/types/event/Events';

export class GlobalEvent extends Events {
  _theme: any = themeFactory[1];
  eventTypes: string[];

  constructor() {
    super();
    this.eventTypes = ['change-theme'];
  }

  get theme() {
    return this._theme;
  }

  set theme(acceptTheme: any) {
    this._theme = acceptTheme;
  }

  changeTheme(themeStyle: Record<string, string>) {
    this.triggerEvent('change-theme', { themeStyle });
  }
}

export default new GlobalEvent();
