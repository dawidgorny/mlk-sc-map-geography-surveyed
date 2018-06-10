'use strict'

const createApp = require('dg-utils/frontend/create-app');
const createFrontendApp = require('./src/create-frontend-app');

(function (exports) {
  exports.create = function (mapContainer, mapStyle, mapboxAccessToken) {
    const frontend = createFrontendApp(mapContainer, mapStyle, mapboxAccessToken);
    const app = createApp(frontend);
  };

  if (window) {
    window.geographySurveyMap = exports;
  }
})(typeof exports === 'undefined' ? this['geographySurveyMap'] = {} : exports);
