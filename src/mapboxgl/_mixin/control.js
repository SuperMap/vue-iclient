import mapEvent from '../_types/map-event';
import globalEvent from '../../common/_utils/global-event';

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
    this.parentIsWebMapOrMap = this.$parent.$options.name && this.$parent.$options.name.toLowerCase() === 'smwebmap';
    this.filterDelayLoad = !['smwebmap', 'smminimap'].includes(this.$options.name && this.$options.name.toLowerCase());
    if (this.$el && this.parentIsWebMapOrMap) {
      if (this.filterDelayLoad) {
        this.isShow = false;
        this.$el.style && (this.$el.style.display = 'none');
      }
      if (mapEvent.$options.getMap(this.controlMap)) {
        this.mapLoaded(mapEvent.$options.getMap(this.controlMap));
      }
      mapEvent.$on('load-map', this.controlLoadMapSucceed);
      globalEvent.$on('delete-map', this.deleteMapSucceed);
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
      this.control && this.map.removeControl(this.control);
    },
    getControlMapName() {
      const selfParent = this.$parent;
      const parentTarget =
        selfParent &&
        selfParent.$options.name &&
        selfParent.$options.name.toLowerCase() === 'smwebmap' &&
        selfParent.target;
      return parentTarget || mapEvent.firstMapTarget;
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
    },
    deleteMapSucceed(target) {
      const targetName = this.getControlMapName();
      if (target === targetName) {
        this.map = null;
        this.destoryViewModal && this.destoryViewModal();
      }
    }
  },
  beforeDestroy() {
    this.remove();
    mapEvent.$off('load-map');
    globalEvent.$off('delete-map');
  }
};
