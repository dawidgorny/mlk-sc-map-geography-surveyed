const path = require('path');
const fs = require('fs');
const turf = require('turf');
const readline = require('readline');

const inputFilepath = path.join(__dirname, '../mat/geography_surveyed.csv');
const outputFilepath = path.join(__dirname, '../www/geography_surveyed.geojson');

const features = [];

const rl = readline.createInterface({
  input: fs.createReadStream(inputFilepath),
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  if (line.length > 0 && line.indexOf('x_lng;y_lat;address_city') < 0) {
    let parts = line.split(';')
    let xlng = parseFloat(parts[0].replace(',', '.'));
    let ylat = parseFloat(parts[1].replace(',', '.'));
    let addressCity = parts[2];
    // let feature = turf.point([xlng, ylat], { 'address_city': addressCity });
    let feature = turf.point([xlng, ylat]);
    features.push(feature);
  }
}).on('close', () => {
  let geojson = turf.featureCollection(features);
  fs.writeFile(outputFilepath, JSON.stringify(geojson), () => {
    process.exit(0);
  });
});
