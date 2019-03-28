export default {
    props: {
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
                    return self.$el;
                },
                onRemove() {
                    return self.map;
                }
            };
        },
        addControl(map) {
            map.addControl(this.control(), this.position);
            this.$el.classList.add("mapboxgl-ctrl");
        },
        removeControl() {
            map.removeControl(this.control());
        },
    }
};
