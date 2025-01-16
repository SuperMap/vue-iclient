var mapboxgl = (window.mapboxgl = window.mapboxgl || {});
var compares = (mapboxgl.Compare = jest.fn());
compares.prototype.remove = () => {
  // console.log('ok')
  jest.fn();
};
compares.prototype._bounds = {
  x: 100,
  y: 0,
  width: 800,
  height: 805.4545288085938,
  top: 0,
  right: 900,
  bottom: 805.4545288085938,
  left: 100
};
compares.prototype._mapB = {
  getContainer() {
    return {
      getBoundingClientRect() {
        return {
          x: 300,
          y: 0,
          width: 800,
          height: 805.4545288085938,
          top: 0,
          right: 900,
          bottom: 805.4545288085938,
          left: 100
        }
      }
    };
  }
};

module.exports = mapboxgl;
