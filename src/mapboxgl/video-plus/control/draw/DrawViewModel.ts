import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
import MapboxDraw from 'vue-iclient/static/libs/mapbox-gl-draw/mapbox-gl-draw';
import { coordEach } from '@turf/meta';

export const MAP_DRAW_EVENTS = [
  'draw.create',
  'draw.delete',
  'draw.combine',
  'draw.uncombine',
  'draw.update',
  'draw.selectionchange',
  'draw.modechange',
  'draw.actionable'
];
export default class DrawViewModel extends mapboxgl.Evented {
  draw: Object;
  options: any;
  position: string;
  videoPlus: any = null;
  constructor(props) {
    super();
    const { position, controls, modes } = props;
    this.position = position;
    let formatControls = {};
    controls.forEach((control) => {
      formatControls[control] = true;
    });
    this.options = {
      controls: formatControls,
      displayControlsDefault: false
    };
    if (modes) {
      this.options.modes = modes;
    }
  }

  setVideoPlus({ videoPlus }) {
    this.videoPlus = videoPlus;
    this.map = videoPlus.map;
    this.init();
  }

  init() {
    this.draw = new MapboxDraw(this.options);
    this.add(this.position);
  }

  add(position) {
    this.map.addControl(this.draw, position);
    MAP_DRAW_EVENTS.forEach((eventName) => {
      this.map.on(eventName, (e) => {
        if (e && ['draw.create', 'draw.update'].includes(e.type)) {
          coordEach(e.features[0], (coord) => {
            let spatialPoint = this.videoPlus.transformLatLngToPoint(coord);
            coord[0] = spatialPoint[0];
            coord[1] = spatialPoint[1];
          });
        }
        this.fire(eventName, { e });
      });
    });
  }

  removed() {
    this.map.removeControl(this.draw);
  }
}
