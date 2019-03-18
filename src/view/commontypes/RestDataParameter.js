export default class RestDataParameter {
    constructor(options) {
        this.url = options.url;
        this.dataName = options.dataName;
        this.attributeFilter = options.attributeFilter || null;
        this.name = options.name || 'Rest 数据服务';
    }
}