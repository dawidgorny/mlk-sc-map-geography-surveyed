const mapboxgl = require('mapbox-gl');
const request = require('request');
const Seq = require('seq');
const R = require('ramda');
const map = R.map;

const defaultCenter = [19.023632, 50.234461];
const defaultZoom = 8.0;
const minZoom = null;
const maxZoom = null;
const maxBounds = null;

const baseUrl = location.origin + location.pathname;

const createFrontendApp = (mapContainer, mapStyle, mapboxAccessToken) => {
  mapboxgl.accessToken = mapboxAccessToken;
  let mapInstance = null;
  let isInitialized = false;
  let isMapLoaded = false;

  const _loadAssets = (onReadyCallback) => {
    const loadGeojson = (url, callback) => {
      request(url, (err, res, body) => {
        if (!err && res.statusCode === 200) {
          callback(err, JSON.parse(body));
        } else {
          callback(err);
        }
      });
    };
    let seq = Seq();

    seq = seq.par('geography_surveyed', function () {
      loadGeojson(baseUrl + 'geography_surveyed.geojson', this);
    });

    seq = seq.seq(function () {
      const assets = map((value) => {
        return value.length === 1 ? value[0] : value;
      }, this.args);
      onReadyCallback(assets);
    });
  };

  const _init = (assets) => {
    if (assets['geography_surveyed']) {
      mapInstance.addSource('geography_surveyed', {
        type: 'geojson',
        data: assets['geography_surveyed'],
        cluster: true,
        clusterMaxZoom: 20, // Max zoom to cluster points on
        clusterRadius: 35 // Radius of each cluster when clustering points (defaults to 50)
      });

      mapInstance.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'geography_surveyed',
        filter: ['has', 'point_count'],
        paint: {
          // Use step expressions (https://www.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#FF4133',
            1,
            '#FF4133',
            10,
            '#FF4133',
            100,
            '#FF4133',
            1000,
            '#FF4133'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            1,
            1,
            10,
            100,
            20,
            1000,
            30
          ]
        }
      });

      mapInstance.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'geography_surveyed',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        },
        'paint': {
          'text-color': '#fff'
        }
      });

      mapInstance.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'geography_surveyed',
        filter: ['!has', 'point_count'],
        paint: {
          'circle-color': '#FF4133',
          'circle-radius': 4,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff'
        }
      });
    }
  };

  this.init = () => {
    mapInstance = new mapboxgl.Map({
      container: mapContainer,
      style: mapStyle,
      center: defaultCenter,
      zoom: defaultZoom,
      minZoom: minZoom,
      maxZoom: maxZoom,
      maxBounds: maxBounds
    });
    mapInstance.scrollZoom.disable();
    const nav = new mapboxgl.NavigationControl({
      showCompass: false,
      showZoom: true
    });
    mapInstance.addControl(nav, 'top-right');
    mapInstance.on('load', () => {
      isMapLoaded = true;
      _loadAssets((assets) => {
        _init(assets);
      });
    });
  };

  return this;
};

module.exports = createFrontendApp;
