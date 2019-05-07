export default {
  props: {
    position: {
      type: String,
      default: 'top-left',
      validator(value) {
        return ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(value);
      }
    }
  },
  watch: {
    position() {
      this.removeControl(this.map);
      this.addControl(this.map);
    }
  },
  mounted() {
    this.parentIsWebMapOrMap = ['smwebmap', 'smmap'].includes(
      this.$parent.$options.name && this.$parent.$options.name.toLowerCase()
    );
    this.filterDelayLoad = !['smwebmap', 'smmap', 'smminimap'].includes(
      this.$options.name && this.$options.name.toLowerCase()
    );
    this.$el && this.filterDelayLoad && this.parentIsWebMapOrMap && (this.isShow = false);
    this.$el && this.filterDelayLoad && this.parentIsWebMapOrMap && this.$el.style && (this.$el.style.display = 'none');
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
      this.map = map;
      map.addControl(this.control(), this.position);
      this.$el.classList.add('mapboxgl-ctrl');
    },
    removeControl(map) {
      map.removeControl(this.control());
    }
  }
};
