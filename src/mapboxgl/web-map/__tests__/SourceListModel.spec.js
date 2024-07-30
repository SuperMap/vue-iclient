import SourceList from '../SourceListModel';

describe('SourceList', () => {
  it('excludeSourceNames', done => {
    const layers = [
      {
        id: 'CHINA_DARK',
        type: 'raster',
        source: 'CHINA_DARK',
        minzoom: 0,
        maxzoom: 12
      },
      {
        id: 'tracklayer-1-line',
        type: 'line',
        source: 'tracklayer-1-line',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#065726',
          'line-width': 5,
          'line-opacity': 0.8
        }
      },
      {
        id: 'tdt-search-line',
        type: 'line',
        source: 'tdt-search-line',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#065726',
          'line-width': 5,
          'line-opacity': 0.8
        }
      },
      {
        id: 'tdt-route-line',
        type: 'line',
        source: 'tdt-route-line',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#065726',
          'line-width': 5,
          'line-opacity': 0.8
        }
      },
      {
        id: 'smmeasure',
        type: 'line',
        source: 'smmeasure',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#065726',
          'line-width': 5,
          'line-opacity': 0.8
        }
      },

      {
        id: 'mapbox-gl-draw',
        type: 'line',
        source: 'mapbox-gl-draw',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#065726',
          'line-width': 5,
          'line-opacity': 0.8
        }
      },
      {
        id: 'mapbox-gl-draw-line',
        type: 'line',
        source: 'mapbox-gl-draw',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#065726',
          'line-width': 5,
          'line-opacity': 0.8
        }
      }
    ];
    const map = {
      getStyle() {
        return {
          layers
        };
      },
      getSource() {
        return {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        };
      },
      getLayer(id) {
        return layers.find(layer => layer.id === id);
      },
      overlayLayersManager: {}
    };
    const sourceList = new SourceList({ map });
    const appreciableLayers = sourceList.getLayers();
    expect(appreciableLayers.length).toBe(1);
    done();
  });
});

