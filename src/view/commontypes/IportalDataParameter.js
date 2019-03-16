export default class IportalDataParameter {
    constructor(options) {
        this.url = options.url;
        this.attributeFilter = options.attributeFilter || null;
        this.name =  options.name || 'Iportal Data';
    }
}