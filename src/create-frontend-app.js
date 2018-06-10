const mapboxgl = require('mapbox-gl');
const request = require('request');
const Seq = require('seq');

const defaultCenter = [19.023632, 50.234461];
const defaultZoom = 11.5;
const minZoom = 10.0;
const maxZoom = 14.0;
const maxBounds = null;

const createFrontendApp = (mapContainer, mapStyle, mapboxAccessToken) => {
  console.log(mapContainer, mapStyle, mapboxAccessToken);
  mapboxgl.accessToken = mapboxAccessToken;
  let map = null;
  let isInitialized = false;
  let isMapLoaded = false;

  this.init = () => {
    map = new mapboxgl.Map({
      container: mapContainer,
      style: mapStyle,
      center: defaultCenter,
      zoom: defaultZoom,
      minZoom: minZoom,
      maxZoom: maxZoom,
      maxBounds: maxBounds
    });
    map.scrollZoom.disable();
    map.on('load', function () {
      isMapLoaded = true;
    });
  };

  return this;
};

module.exports = createFrontendApp;
