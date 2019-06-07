var express = require('express');
var router = express.Router();
var ipstack = require('ipstack');
var config = require('../config/config');
const cors = require('cors')

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

  var latitude = 0;
  var longitude = 0;

  // Mètode 1: Obtenim la geolocalització del headers de la petició de l'usuari
  var geolocRequestHeaders = {};
  const corsHandler = cors({ origin: true });

  corsHandler(req, res, function() {
    geolocRequestHeaders = {
      country: req.headers["x-appengine-country"],
      region: req.headers["x-appengine-region"],
      city: req.headers["x-appengine-city"],
      cityLatLong: req.headers["x-appengine-citylatlong"],
      userIP: req.headers["x-appengine-user-ip"]
    };
  });

  // Mètode 2: A partir de la IP de l'usuari amb IPSTACK intentem obtenir les seves dades
  var geolocIpstack = {};
  ipstack(geolocRequestHeaders.userIP, config.ipstack.api, function(err, response) {
    if (err) {
      campanarSeleccionat = 'El mes alt';
    } else {
      geolocIpstack = response;
    }

    // Si geolocRequestHeaders.cityLatLong existeix i està plè intentem geolocalitar a partir d'aquest
    // Sinó intentem geolocalitzar a partir de geolocIpstack.latitude i geolocIpstack.longitude
    if (geolocRequestHeaders && geolocRequestHeaders.cityLatLong) {
      latitude = geolocRequestHeaders.cityLatLong;
      longitude = geolocRequestHeaders.cityLatLong;
    } else if (geolocIpstack && geolocIpstack.latitude && geolocIpstack.longitude) {
      latitude = geolocIpstack.latitude;
      longitude = geolocIpstack.longitude;
    }

    if (latitude !== 0 && longitude !== 0) {
      var geocoding = new require('reverse-geocoding');
      var config = {
        'latitude': latitude,
        'longitude': longitude
      };
      geocoding.location(config, function (err, data){
        if(err){
          campanarSeleccionat = 'El més alt ' + err;
        }else{
          campanarSeleccionat = data;
        }
      });

    } else {
      campanarSeleccionat = 'El més alt';
    }


    res.render('index', {
      title: 'Alçada de Campanars de Catalunya',
      clientLocation: JSON.stringify(response),
      clientLocation2: JSON.stringify(geolocRequestHeaders),
      campanars: JSON.stringify(CAMPANARS),  // S'ha de passar fent un stringify sinó no es recupera bé al template
      campanarSeleccionat: campanarSeleccionat
    });
  });
});


router.get('/api/campanars', function(req, res, next) {
  res.status(200).json(CAMPANARS);
});


module.exports = router;
