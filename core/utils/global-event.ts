import { Events } from 'vue-iclient-core/types/event/Events';

export default class GlobalEvent<T = Record<string, any>> extends Events {
  _theme: T;
  on: (data: Record<string, (...rest: any) => void>) => void;
  un: (data: Record<string, (...rest: any) => void>) => void;
  triggerEvent: (name: string, ...rest: any) => any;
  eventTypes: string[];
  
  constructor(theme?: T) {
    super();
    this.eventTypes = ['change-theme'];
    this._theme = theme;
  }

  get theme() {
    return this._theme;
  }

  changeTheme(themeStyle: T, triggerEvent = true) {
    this._theme = themeStyle;
    triggerEvent && this.triggerEvent('change-theme', { themeStyle });
  }
}
