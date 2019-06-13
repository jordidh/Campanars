var express = require('express');
var router = express.Router();
var ipstack = require('ipstack');
var config = require('../config/config');
var async = require('async');
const cors = require('cors');
const googleMapsClient = require('@google/maps').createClient({
  key: config.google.maps_api
});

const INDEX_CAMPANAR_MES_ALT = 451;

/* GET home page. */
router.get('/', function(req, res, next) {

  // Es busca el campanar mes proper al del client
  var campanarSeleccionat = '';
  var latitude = 0;
  var longitude = 0;

  try {

    var geolocRequestHeaders = {};
    var geolocIPStack = {};
    var reverseGeoloc = {};

    async.series({
      // Obtenció de les coordenades Mètode 1: Obtenim la geolocalització del headers de la petició de l'usuari
      // Les dades obtingudes són de l'estil:
      // {"country":"ES","region":"ct","city":"barcelona","cityLatLong":"41.385064,2.173404","userIP":"188.77.35.126"}
      geocodeFromRequestHeaders: function(doneGeocodingFromRequestHeaders) {

        console.log('---> 1.geocodeFromRequestHeaders');

        const corsHandler = cors({origin: true});

        corsHandler(req, res, function () {
          geolocRequestHeaders = {
            country: req.headers["x-appengine-country"],
            region: req.headers["x-appengine-region"],
            city: req.headers["x-appengine-city"],
            cityLatLong: req.headers["x-appengine-citylatlong"],
            userIP: req.headers["x-appengine-user-ip"]
          };

          doneGeocodingFromRequestHeaders(null, geolocRequestHeaders);
        });
      },

      // Obtenció de les coordenades Mètode 2: A partir de la IP de l'usuari amb IPSTACK intentem obtenir les seves dades
      // Les dades obtingudes són de l'estil:
      // {"ip":"188.77.35.126","type":"ipv4","continent_code":"EU","continent_name":"Europe","country_code":"ES",
      // "country_name":"Spain","region_code":"CT","region_name":"Catalonia","city":"Seva","zip":"08553",
      // "latitude":41.8383,"longitude":2.2801,"location":{"geoname_id":3109023,"capital":"Madrid","languages":
      // [{"code":"es","name":"Spanish","native":"Español"},{"code":"eu","name":"Basque","native":"Euskara"},
      // {"code":"ca","name":"Catalan","native":"Català"},{"code":"gl","name":"Galician","native":"Galego"},
      // {"code":"oc","name":"Occitan","native":"Occitan"}],
      // "country_flag":"http://assets.ipstack.com/flags/es.svg","country_flag_emoji":"🇪🇸",
      // "country_flag_emoji_unicode":"U+1F1EA U+1F1F8","calling_code":"34","is_eu":true}}
      geocodeFromUsersIP: function(doneGeocodingFromUserIP) {

        console.log('---> 2.geocodeFromUsersIP');

        var geolocIpstack = {};
        ipstack(geolocRequestHeaders.userIP, config.ipstack.api, function (err, response) {
          if (err) {
            doneGeocodingFromUserIP(err);
          } else {
            geolocIPStack = response;
            doneGeocodingFromUserIP(null, response);
          }
        });
      },

      // A partir de les coordenades mirem a quina població corresponen
      reverseGeocoding: function(doneReverseGeocoding) {

        console.log('---> 3.reverseGeocoding');

        // Get the most accurate latlang
        // Si geolocRequestHeaders.cityLatLong existeix i està plè intentem geolocalitar a partir d'aquest
        // Sinó intentem geolocalitzar a partir de geolocIpstack.latitude i geolocIpstack.longitude
        var latitude = 0;
        var longitude = 0;

        if (geolocRequestHeaders && geolocRequestHeaders.cityLatLong && geolocRequestHeaders.cityLatLong.includes(',')) {
          let coords = geolocRequestHeaders.cityLatLong.split(',');
          latitude = coords[0];
          longitude = coords[1];
        } else if (geolocIPStack && geolocIPStack.latitude && geolocIPStack.longitude) {
          latitude = geolocIPStack.latitude;
          longitude = geolocIPStack.longitude;
        }

        if (latitude === 0 && longitude === 0) {
          doneReverseGeocoding(new Error("No s'ha pogut determinar la latitud i la longitud de l'usuari"));
        } else {
          // Geocode an address/latlng
          googleMapsClient.reverseGeocode({
            //address: '1600 Amphitheatre Parkway, Mountain View, CA'
            latlng: [latitude,longitude]
          }, function(err, response) {
            if (err) {
              doneReverseGeocoding(err);
            } else {
              reverseGeoloc = response;
              doneReverseGeocoding(null, response);
            }
          });
        }
      },

      // Buscar entre la llista de campanars quin correspòn la població
      // sinó mostrar el més alt

    }, function (err, results) {
      if (err) {
        console.error('Error: ' + JSON.stringify(err.message));

        res.render('index', {
          title: 'Alçada de Campanars de Catalunya',
          error: JSON.stringify(err.message),
          campanars: JSON.stringify(CAMPANARS),  // S'ha de passar fent un stringify sinó no es recupera bé al template
          campanarSeleccionat: JSON.stringify(CAMPANARS[INDEX_CAMPANAR_MES_ALT])
        });

      } else {
        // Process the results
        //results.geocodeFromRequestHeaders
        //results.geocodeFromUsersIP
        //results.reverseGeocoding

        console.log('OK');

        res.render('index', {
          title: 'Alçada de Campanars de Catalunya',
          geocodeFromRequestHeaders: JSON.stringify(geolocRequestHeaders),
          geocodeFromUsersIP: JSON.stringify(geolocIPStack),
          reverseGeocoding: JSON.stringify(reverseGeoloc),
          campanars: JSON.stringify(CAMPANARS),  // S'ha de passar fent un stringify sinó no es recupera bé al template
          campanarSeleccionat: JSON.stringify(CAMPANARS[INDEX_CAMPANAR_MES_ALT])
        });
      }
    });
  } catch (e) {

    console.error('Exception: ' + e.message);

    res.render('index', {
      title: 'Alçada de Campanars de Catalunya',
      error: JSON.stringify(e.message),
      campanars: JSON.stringify(CAMPANARS),  // S'ha de passar fent un stringify sinó no es recupera bé al template
      campanarSeleccionat: JSON.stringify(CAMPANARS[INDEX_CAMPANAR_MES_ALT])
    });
  }
});


router.get('/api/campanars', function(req, res, next) {
  res.status(200).json(CAMPANARS);
});


module.exports = router;
