import Vue from 'vue';

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    viewModelProps?: Array<string>;
    loaded?: Function;
    removed?: Function;
    theme?: object;
    defaultComponent?: object;
    deleteMap?: Function;
    deleteWebMap?: Function;
    setMap?: Function;
    setWebMap?: Function;
    getMap?: Function;
  }
}
