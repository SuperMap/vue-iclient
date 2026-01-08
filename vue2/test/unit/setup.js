import Vue from 'vue';
import 'isomorphic-fetch';

Vue.config.productionTip = false;

jest.mock('axios', () => require('./mocks/axios'));
jest.mock('xlsx', () => require('./mocks/xlsx').xlsx);
jest.mock('three', () => require('./mocks/three').THREE);
jest.mock('video.js', () => require('./mocks/video'));
jest.mock('videojs-flvjs-es6', () => require('./mocks/video-flvjs-es6'));
jest.mock('videojs-flash', () => require('./mocks/videojs-flash'));
jest.mock('@i18n/_lang', () => require('./mocks/i18n'));
jest.mock('@libs/mapbox-gl-draw/mapbox-gl-draw.js', () => require('./mocks/mapboxgl_draw').MapboxDraw);
jest.mock('mapbox-gl', () => require('./mocks/mapboxgl').mapboxgl);
jest.mock('@libs/deckgl/deck.gl.min', () => require());
jest.mock('@supermapgis/iclient-mapbxogl', () => require('./mocks/mapboxgl_iclient'));
jest.mock('leaflet', () => require('./mocks/leaflet'));
jest.mock('@supermapgis/iclient-leaflet', () => require('./mocks/leaflet_iclient'));
jest.mock('@supermapgis/iclient-common/mapping/WebMapV2Base', () => require('./mocks/iclient-common-webmapv2base'));
