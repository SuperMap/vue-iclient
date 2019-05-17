import mapEvent from '../commontypes/mapEvent';

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
      this.remove(this.map);
      this.addTo(this.map);
    }
  },
  mounted() {
    this.parentIsWebMapOrMap = ['smwebmap', 'smmap'].includes(
      this.$parent.$options.name && this.$parent.$options.name.toLowerCase()
    );
    this.filterDelayLoad = !['smwebmap', 'smmap', 'smminimap'].includes(
      this.$options.name && this.$options.name.toLowerCase()
    );
    if (this.$el && this.parentIsWebMapOrMap) {
      if (this.filterDelayLoad) {
        this.isShow = false;
        this.$el.style && (this.$el.style.display = 'none');
      }
      const targetName = this.$parent.target || mapEvent.firstMapTarget;
      mapEvent.$on(`initMap-${targetName}`, map => {
        this.addTo(map);
        if (this.filterDelayLoad) {
          this.isShow = true;
          this.$el.style && (this.$el.style.display = 'block');
        }
        // if (this.$options.name.toLowerCase() === 'smchart') {
        //   this.viewModel.resize();
        // }
      });
    }
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
    addTo(map) {
      this.map = map;
      map.addControl(this.control(), this.position);
      this.$el.classList.add('mapboxgl-ctrl');
    },
    remove(map) {
      map.removeControl(this.control());
    }
  }
};
