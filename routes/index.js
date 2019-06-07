var express = require('express');
var router = express.Router();
var ipstack = require('ipstack');
var config = require('../config/config');
const cors = require('cors')

/* GET home page. */
router.get('/', function(req, res, next) {

  // Es busca el campanar mes proper al del client
  var campanarSeleccionat = '';
  var latitude = 0;
  var longitude = 0;

  try {
    // Mètode 1: Obtenim la geolocalització del headers de la petició de l'usuari
    // Les dades obtingudes són de l'estil:
    // {"country":"ES","region":"ct","city":"barcelona","cityLatLong":"41.385064,2.173404","userIP":"188.77.35.126"}
    var geolocRequestHeaders = {};
    const corsHandler = cors({origin: true});

    corsHandler(req, res, function () {
      geolocRequestHeaders = {
        country: req.headers["x-appengine-country"],
        region: req.headers["x-appengine-region"],
        city: req.headers["x-appengine-city"],
        cityLatLong: req.headers["x-appengine-citylatlong"],
        userIP: req.headers["x-appengine-user-ip"]
      };
    });

    // Mètode 2: A partir de la IP de l'usuari amb IPSTACK intentem obtenir les seves dades
    // Les dades obtingudes són de l'estil:
    // {"ip":"188.77.35.126","type":"ipv4","continent_code":"EU","continent_name":"Europe","country_code":"ES",
    // "country_name":"Spain","region_code":"CT","region_name":"Catalonia","city":"Seva","zip":"08553",
    // "latitude":41.8383,"longitude":2.2801,"location":{"geoname_id":3109023,"capital":"Madrid","languages":
    // [{"code":"es","name":"Spanish","native":"Español"},{"code":"eu","name":"Basque","native":"Euskara"},
    // {"code":"ca","name":"Catalan","native":"Català"},{"code":"gl","name":"Galician","native":"Galego"},
    // {"code":"oc","name":"Occitan","native":"Occitan"}],
    // "country_flag":"http://assets.ipstack.com/flags/es.svg","country_flag_emoji":"🇪🇸",
    // "country_flag_emoji_unicode":"U+1F1EA U+1F1F8","calling_code":"34","is_eu":true}}
    var geolocIpstack = {};
    ipstack(geolocRequestHeaders.userIP, config.ipstack.api, function (err, response) {
      if (err) {
        campanarSeleccionat = 'El mes alt';
      } else {
        geolocIpstack = response;
      }

      // Si geolocRequestHeaders.cityLatLong existeix i està plè intentem geolocalitar a partir d'aquest
      // Sinó intentem geolocalitzar a partir de geolocIpstack.latitude i geolocIpstack.longitude
      if (geolocRequestHeaders && geolocRequestHeaders.cityLatLong && geolocRequestHeaders.cityLatLong.includes(',')) {
        let coords = geolocRequestHeaders.cityLatLong.split(',');
        latitude = coords[0];
        longitude = coords[1];
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
        campanarSeleccionat = JSON.stringify(config);
        /*
        geocoding.location(config, function (err, data) {
          if (err) {
            campanarSeleccionat = 'El més alt. Error = ' + err;
          } else {
            campanarSeleccionat = data;
          }
        });
         */
      } else {
        campanarSeleccionat = 'El més alt';
      }

      res.render('index', {
        title: 'Alçada de Campanars de Catalunya',
        clientLocation: JSON.stringify(geolocIpstack),
        clientLocation2: JSON.stringify(geolocRequestHeaders),
        campanars: JSON.stringify(CAMPANARS),  // S'ha de passar fent un stringify sinó no es recupera bé al template
        campanarSeleccionat: campanarSeleccionat
      });
    });
  } catch (e) {
    campanarSeleccionat = 'El més alt. Exception = ' + e.message();

    res.render('index', {
      title: 'Alçada de Campanars de Catalunya',
      clientLocation: JSON.stringify(geolocIpstack),
      clientLocation2: JSON.stringify(geolocRequestHeaders),
      campanars: JSON.stringify(CAMPANARS),  // S'ha de passar fent un stringify sinó no es recupera bé al template
      campanarSeleccionat: campanarSeleccionat
    });
  }
});


router.get('/api/campanars', function(req, res, next) {
  res.status(200).json(CAMPANARS);
});


module.exports = router;
