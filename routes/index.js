var express = require('express');
var router = express.Router();
var ipstack = require('ipstack');
var config = require('../config/config');

/* GET home page. */
router.get('/', function(req, res, next) {

  // Es busca el campanar mes proper al del client
  var campanarSeleccionat = '';

  // Geoip location
  /**
  { ip: '8.8.8.8',
  type: 'ipv4',
  continent_code: 'NA',
  continent_name: 'North America',
  country_code: 'US',
  country_name: 'United States',
  region_code: null,
  region_name: null,
  city: null,
  zip: null,
  latitude: 37.751,
  longitude: -97.822,
  location:
   { geoname_id: null,
     capital: 'Washington D.C.',
     languages: [ [Object] ],
     country_flag: 'http://assets.ipstack.com/flags/us.svg',
     country_flag_emoji: '🇺🇸',
     country_flag_emoji_unicode: 'U+1F1FA U+1F1F8',
     calling_code: '1',
     is_eu: false } }
   */
  ipstack(req.connection._remoteAddress, config.ipstack.api, function(err, response) {

    console.log(response);

    if (err) {
      campanarSeleccionat = 'El mes alt';
    } else {
      // TODO: reverse geolocation
      /*
      function getAddress (latitude, longitude) {
        $.ajax('https://maps.googleapis.com/maps/api/geocode/json?
        latlng=' + latitude + ',' + longitude + '&key=' +
        GOOGLE_MAP_KEY)
      .then(
            function success (response) {
              console.log('User\'s Address Data is ', response)
            },
            function fail (status) {
              console.log('Request failed.  Returned status of',
                  status)
            }
        )}
      getAddress(6.4531, 3.3958);*/


      campanarSeleccionat = 'El mes proper a la ubicació del client';
    }

    res.render('index', {
      title: 'Alçada de Campanars de Catalunya',
      clientLocation: JSON.stringify(response),
      campanars: JSON.stringify(CAMPANARS),  // S'ha de passar fent un stringify sinó no es recupera bé al template
      campanarSeleccionat: campanarSeleccionat
    });
  });
});


router.get('/api/campanars', function(req, res, next) {
  res.status(200).json(CAMPANARS);
});


module.exports = router;
