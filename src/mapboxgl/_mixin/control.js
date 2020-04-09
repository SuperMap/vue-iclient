import mapEvent from '../_types/map-event';

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
      if (this.$el && this.parentIsWebMapOrMap) {
        this.remove(this.map);
        this.addTo(this.map);
      }
    }
  },
  created() {
    const parentName = this.$parent.$options.name;
    this.parentIsWebMapOrMap = parentName && ['smwebmap', 'smncpmap'].includes(this.$parent.$options.name.toLowerCase());
  },
  mounted() {
    this.filterDelayLoad = !['smwebmap', 'smminimap', 'smncpmap'].includes(this.$options.name && this.$options.name.toLowerCase());
    if (this.$el && this.parentIsWebMapOrMap) {
      if (this.filterDelayLoad) {
        this.isShow = false;
        this.$el.style && (this.$el.style.display = 'none');
      }
      const targetName = this.getControlMapName();
      if (mapEvent.$options.getMap(targetName)) {
        this.mapLoaded(mapEvent.$options.getMap(targetName));
      }
      mapEvent.$on('load-map', this.controlLoadMapSucceed);
    }
  },
  methods: {
    initControl() {
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
    addTo() {
      this.control = this.initControl();
      this.map.addControl(this.control, this.position);
      this.$el.classList.add('mapboxgl-ctrl');
    },
    remove() {
      this.control && this.map && this.map.removeControl(this.control);
    },
    getControlMapName() {
      const selfParent = this.$parent;
      const parentTarget =
        selfParent &&
        selfParent.$options.name &&
        selfParent.$options.name.toLowerCase() === 'smwebmap' &&
        selfParent.target;
      return this.mapTarget || parentTarget || Object.keys(mapEvent.$options.getAllMaps())[0];
    },
    controlLoadMapSucceed(map, target) {
      const targetName = this.getControlMapName();
      if (target === targetName) {
        this.mapLoaded(map);
      }
    },
    mapLoaded(map) {
      this.map = map;
      this.addTo();
      if (this.filterDelayLoad) {
        this.isShow = true;
        this.$el.style && (this.$el.style.display = 'block');
      }
    }
  },
  beforeDestroy() {
    this.remove();
    mapEvent.$off('load-map', this.controlLoadMapSucceed);
  }
};
