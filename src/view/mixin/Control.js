import ControlIcon from '../components/ControlIcon.vue';
import Vue from 'vue';
export default {
    props: {
        iconClass: {
            type: String
        },
        position: {
            type: String,
            default: "top-left",
            validator(value) {
                return [
                    "top-left",
                    "top-right",
                    "bottom-left",
                    "bottom-right"
                ].includes(value);
            }
        },
    },
    methods: {
        control() {
            var self = this;
            return {
                onAdd() {
                    if (self.iconClass) {
                        let div = document.createElement('div');
                        self.$el.classList.add(`sm-control`)
                        self.$el.classList.add(`is-${self.position}`)
                        div.appendChild(self.$el);
                        div.appendChild(self.addIcon().$el)
                        div.classList.add('mapboxgl-ctrl');
                        div.classList.add('sm-control-container')
                        return div;
                    }else {return self.$el;}
                },
                onRemove() {
                    return self.map;
                }
            };
        },
        addControl(map) {
            map.addControl(this.control(), this.position);
            !this.iconClass && this.$el.classList.add("mapboxgl-ctrl");
        },
        removeControl() {
            map.removeControl(this.control());
        },
        addIcon() {
            
            let iconClz = Vue.extend(ControlIcon);
            let icon = new iconClz({
                propsData: {
                    position: this.position || (this.icon && this.icon.position),
                    iconClass: this.iconClass,
                    autoRotate: this.autoRotate,
                    collapsed: this.collapsed
                }
            });
            icon.$mount();
            return icon;
        }
    }
};
