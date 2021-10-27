import Vue from 'vue';
import 'isomorphic-fetch';

Vue.config.productionTip = false;

jest.mock('axios', () => require('./mocks/axios'));
jest.mock('three', () => require('./mocks/three').THREE);
jest.mock('@i18n/_lang', () => require('./mocks/i18n'));
jest.mock('@libs/mapbox-gl-draw/mapbox-gl-draw.js', () => require('./mocks/mapboxgl_draw'));
jest.mock('@libs/mapboxgl/mapbox-gl-enhance.js', () => require('./mocks/mapboxgl').mapboxgl);
jest.mock('@libs/deckgl/deck.gl.min', () => require());
jest.mock('@libs/iclient-mapboxgl/iclient-mapboxgl.min.js', () => require('./mocks/mapboxgl_iclient'));
jest.mock('@leaflet/leaflet-wrapper', () => require('./mocks/leaflet'));
jest.mock('@libs/iclient-leaflet/iclient-leaflet.min', () => require('./mocks/leaflet_iclient'));
