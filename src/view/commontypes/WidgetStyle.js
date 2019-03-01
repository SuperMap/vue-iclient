export class WidgetStyle {
    constructor(options) {
        options = options || {};
        this.position = options.position || null;
        this.width = options.width || null;
        this.height = options.height || null;
    }
}