 var mapboxgl = (window.mapboxgl = window.mapboxgl || {});
  var compares  = (mapboxgl.Compare = jest.fn());
  compares.prototype.remove = () => {
    // console.log('ok')
    jest.fn()
  };
  
  module.exports = mapboxgl;