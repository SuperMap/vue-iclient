import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import RestService from '../_utils/RestService';

@Component
export default class ThirdService extends Vue {
  features: any = null;
  restService: any = null;

  @Prop({ default: '' }) url: string;

  @Prop({ default: '' }) field: string;

  @Prop({ default: '' }) proxy: string;

  @Watch('url', { immediate: true })
  onUrlChange(newValue: string) {
    if(newValue) {
      this.getData();
    }
  }

  @Watch('field')
  onFieldChange(newValue: string) {
    if(this.url) {
      this.setValue(this.features);
    }
  }
  @Watch('proxy')
  onProxyChange(newValue: string) {
    this.restService && this.restService.setProxy(this.proxy);
    if (this.url) {
      this.getData();
    }
  }

  getData() {
    if (!this.restService) {
      this.restService = new RestService({ proxy: this.proxy });
      this.restService.on({ getdatasucceeded: this.fetchData });
    }
    this.restService.getData(this.url);
  }

  fetchData({ features }) {
    this.features = features;
    this.setValue(features);
  }

  setValue(features) {
    if (features && !!features.length) {
      const field = this.field;
      // @ts-ignore
      this.finalValue = features[0].properties[field];
    }
  }
}
