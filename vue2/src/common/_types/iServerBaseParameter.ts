type proxyFn = (url?: string) => string;

export interface iServerOptions {
  type?: string;
  url?: string;
  attributeFilter?: string;
  name?: string;
  maxFeatures?: number;
  proxy?: proxyFn | string;
  layerName?: string;
  dataName?: string;
  queryMode?: 'SQL' | 'KEYWORD';
}

export default class iServerBaseParameter {
  type: string;
  url: string;
  attributeFilter: string;
  maxFeatures: number;
  proxy: proxyFn | string;
  queryMode: iServerOptions['queryMode'];

  constructor(options: iServerOptions) {
    this.type = 'iServer';
    this.url = options.url;
    this.attributeFilter = options.attributeFilter || null;
    this.maxFeatures = options.maxFeatures || 20;
    this.proxy = options.proxy;
    this.queryMode = options.queryMode || 'SQL';
  }
}
