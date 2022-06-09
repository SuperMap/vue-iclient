import mapboxgl from 'vue-iclient/static/libs/mapboxgl/mapbox-gl-enhance';
import MapboxDraw from 'vue-iclient/static/libs/mapbox-gl-draw/mapbox-gl-draw';

export const EVENTS = [
  'draw.create',
  'draw.delete'
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
    this.init();
  }

  init() {
    this.draw = new MapboxDraw(this.options);
    this.videoPlus.addControl(this.draw, this.position);
    // EVENTS.forEach(eventName => {
    //   this.videoPlus.on(eventName, this._bindDrawEvent);
    // });
  }

  _bindDrawEvent(e) {
    this.fire(e.type, e);
  }

  removed() {
    this.map && this.videoPlus.removeControl(this.draw);
  }
}
