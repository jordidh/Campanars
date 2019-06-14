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
    var userLocalityName = '';
    var towerSelected = JSON.stringify(CAMPANARS[INDEX_CAMPANAR_MES_ALT]);

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
      // Les dades que s'obtenen són com el següent exemple:
      // {"status":200,"headers":{"content-type":"application/json; charset=UTF-8","date":"Thu, 13 Jun 2019 06:14:10 GMT","expires":"Fri, 14 Jun 2019 06:14:10 GMT","cache-control":"public, max-age=86400","access-control-allow-origin":"*","server":"mafe","x-xss-protection":"0","x-frame-options":"SAMEORIGIN","server-timing":"gfet4t7; dur=197","alt-svc":"quic=\":443\"; ma=2592000; v=\"46,44,43,39\"","accept-ranges":"none","vary":"Accept-Language,Accept-Encoding","connection":"close"},"json":{"plus_code":{"compound_code":"G4W5+GC Sabadell, Spain","global_code":"8FH4G4W5+GC"},"results":[{"address_components":[{"long_name":"1","short_name":"1","types":["street_number"]},{"long_name":"Plaça del Doctor Robert","short_name":"Plaça del Dr. Robert","types":["route"]},{"long_name":"Sabadell","short_name":"Sabadell","types":["locality","political"]},{"long_name":"Barcelona","short_name":"Barcelona","types":["administrative_area_level_2","political"]},{"long_name":"Catalunya","short_name":"CT","types":["administrative_area_level_1","political"]},{"long_name":"Spain","short_name":"ES","types":["country","political"]},{"long_name":"08202","short_name":"08202","types":["postal_code"]}],"formatted_address":"Plaça del Dr. Robert, 1, 08202 Sabadell, Barcelona, Spain","geometry":{"location":{"lat":41.5462534,"lng":2.1085713},"location_type":"ROOFTOP","viewport":{"northeast":{"lat":41.54760238029149,"lng":2.109920280291502},"southwest":{"lat":41.54490441970849,"lng":2.107222319708498}}},"place_id":"ChIJd1ZddwGVpBIRUZmu8ZZzWHE","plus_code":{"compound_code":"G4W5+GC Sabadell, Spain","global_code":"8FH4G4W5+GC"},"types":["street_address"]},{"address_components":[{"long_name":"1","short_name":"1","types":["street_number"]},{"long_name":"Plaça del Doctor Robert","short_name":"Plaça del Dr. Robert","types":["route"]},{"long_name":"Sabadell","short_name":"Sabadell","types":["locality","political"]},{"long_name":"Barcelona","short_name":"Barcelona","types":["administrative_area_level_2","political"]},{"long_name":"Catalunya","short_name":"CT","types":["administrative_area_level_1","political"]},{"long_name":"Spain","short_name":"ES","types":["country","political"]},{"long_name":"08202","short_name":"08202","types":["postal_code"]}],"formatted_address":"Plaça del Dr. Robert, 1, 08202 Sabadell, Barcelona, Spain","geometry":{"location":{"lat":41.5460715,"lng":2.108623},"location_type":"RANGE_INTERPOLATED","viewport":{"northeast":{"lat":41.5474204802915,"lng":2.109971980291502},"southwest":{"lat":41.5447225197085,"lng":2.107274019708498}}},"place_id":"EjpQbGHDp2EgZGVsIERyLiBSb2JlcnQsIDEsIDA4MjAyIFNhYmFkZWxsLCBCYXJjZWxvbmEsIFNwYWluIhoSGAoUChIJgXtldwGVpBIRP1Dzcc5-M-sQAQ","types":["street_address"]},{"address_components":[{"long_name":"24-25","short_name":"24-25","types":["street_number"]},{"long_name":"Plaça de Sant Roc","short_name":"Plaça de Sant Roc","types":["route"]},{"long_name":"Sabadell","short_name":"Sabadell","types":["locality","political"]},{"long_name":"Barcelona","short_name":"Barcelona","types":["administrative_area_level_2","political"]},{"long_name":"Catalunya","short_name":"CT","types":["administrative_area_level_1","political"]},{"long_name":"Spain","short_name":"ES","types":["country","political"]},{"long_name":"08201","short_name":"08201","types":["postal_code"]}],"formatted_address":"Plaça de Sant Roc, 24-25, 08201 Sabadell, Barcelona, Spain","geometry":{"bounds":{"northeast":{"lat":41.5465076,"lng":2.10849},"southwest":{"lat":41.5460502,"lng":2.1083039}},"location":{"lat":41.5462779,"lng":2.1083925},"location_type":"GEOMETRIC_CENTER","viewport":{"northeast":{"lat":41.54762788029149,"lng":2.109745930291502},"southwest":{"lat":41.54492991970849,"lng":2.107047969708498}}},"place_id":"ChIJ9ztPeAGVpBIRQsqecJSSobk","types":["route"]},{"address_components":[{"long_name":"08202","short_name":"08202","types":["postal_code"]},{"long_name":"Sabadell","short_name":"Sabadell","types":["locality","political"]},{"long_name":"Barcelona","short_name":"Barcelona","types":["administrative_area_level_2","political"]},{"long_name":"Catalonia","short_name":"CT","types":["administrative_area_level_1","political"]},{"long_name":"Spain","short_name":"ES","types":["country","political"]}],"formatted_address":"08202 Sabadell, Barcelona, Spain","geometry":{"bounds":{"northeast":{"lat":41.56830540000001,"lng":2.150517},"southwest":{"lat":41.531502,"lng":2.1062689}},"location":{"lat":41.5565589,"lng":2.1302944},"location_type":"APPROXIMATE","viewport":{"northeast":{"lat":41.56830540000001,"lng":2.150517},"southwest":{"lat":41.531502,"lng":2.1062689}}},"place_id":"ChIJ18cbAAWVpBIRUMq1fOP6ABw","types":["postal_code"]},{"address_components":[{"long_name":"Sabadell","short_name":"Sabadell","types":["locality","political"]},{"long_name":"Barcelona","short_name":"Barcelona","types":["administrative_area_level_2","political"]},{"long_name":"Catalonia","short_name":"CT","types":["administrative_area_level_1","political"]},{"long_name":"Spain","short_name":"ES","types":["country","political"]}],"formatted_address":"Sabadell, Barcelona, Spain","geometry":{"bounds":{"northeast":{"lat":41.5769855,"lng":2.1278043},"southwest":{"lat":41.5223582,"lng":2.0773878}},"location":{"lat":41.5462745,"lng":2.1086131},"location_type":"APPROXIMATE","viewport":{"northeast":{"lat":41.5769855,"lng":2.1278043},"southwest":{"lat":41.5223582,"lng":2.0773878}}},"place_id":"ChIJdXYnAP2UpBIRQt8hWGHjkTY","types":["locality","political"]},{"address_components":[{"long_name":"Sabadell","short_name":"Sabadell","types":["administrative_area_level_4","political"]},{"long_name":"Barcelona","short_name":"Barcelona","types":["administrative_area_level_2","political"]},{"long_name":"Catalonia","short_name":"CT","types":["administrative_area_level_1","political"]},{"long_name":"Spain","short_name":"ES","types":["country","political"]}],"formatted_address":"Sabadell, Barcelona, Spain","geometry":{"bounds":{"northeast":{"lat":41.5905502,"lng":2.1501629},"southwest":{"lat":41.50671759999999,"lng":2.0468946}},"location":{"lat":41.5618613,"lng":2.0965999},"location_type":"APPROXIMATE","viewport":{"northeast":{"lat":41.5905502,"lng":2.1501629},"southwest":{"lat":41.50671759999999,"lng":2.0468946}}},"place_id":"ChIJr1Cts_uUpBIRkA2kIeD6AAQ","types":["administrative_area_level_4","political"]},{"address_components":[{"long_name":"Vallès Occidental","short_name":"Vallès Occidental","types":["administrative_area_level_3","political"]},{"long_name":"Barcelona","short_name":"Barcelona","types":["administrative_area_level_2","political"]},{"long_name":"Catalonia","short_name":"CT","types":["administrative_area_level_1","political"]},{"long_name":"Spain","short_name":"ES","types":["country","political"]}],"formatted_address":"Vallès Occidental, Barcelona, Spain","geometry":{"bounds":{"northeast":{"lat":41.7172243,"lng":2.2252151},"southwest":{"lat":41.4150323,"lng":1.8612334}},"location":{"lat":41.5434349,"lng":2.027319},"location_type":"APPROXIMATE","viewport":{"northeast":{"lat":41.7172243,"lng":2.2252151},"southwest":{"lat":41.4150323,"lng":1.8612334}}},"place_id":"ChIJ9fYtjT6TpBIR5K-qiSf1ijM","types":["administrative_area_level_3","political"]},{"address_components":[{"long_name":"Barcelona","short_name":"Barcelona","types":["administrative_area_level_2","political"]},{"long_name":"Catalonia","short_name":"CT","types":["administrative_area_level_1","political"]},{"long_name":"Spain","short_name":"ES","types":["country","political"]}],"formatted_address":"Barcelona, Spain","geometry":{"bounds":{"northeast":{"lat":42.32330109999999,"lng":2.7777843},"southwest":{"lat":41.1927452,"lng":1.3596215}},"location":{"lat":41.3850477,"lng":2.1733131},"location_type":"APPROXIMATE","viewport":{"northeast":{"lat":42.32330109999999,"lng":2.7777843},"southwest":{"lat":41.1927452,"lng":1.3596215}}},"place_id":"ChIJZb1_yQvmpBIRsMmjIeD6AAM","types":["administrative_area_level_2","political"]},{"address_components":[{"long_name":"Catalonia","short_name":"CT","types":["administrative_area_level_1","political"]},{"long_name":"Spain","short_name":"ES","types":["country","political"]}],"formatted_address":"Catalonia, Spain","geometry":{"bounds":{"northeast":{"lat":42.8614502,"lng":3.3325539},"southwest":{"lat":40.5230466,"lng":0.1591811}},"location":{"lat":41.5911589,"lng":1.5208624},"location_type":"APPROXIMATE","viewport":{"northeast":{"lat":42.8614502,"lng":3.3325539},"southwest":{"lat":40.5230466,"lng":0.1591811}}},"place_id":"ChIJ8_UwhdxbpBIRUMijIeD6AAE","types":["administrative_area_level_1","political"]},{"address_components":[{"long_name":"Spain","short_name":"ES","types":["country","political"]}],"formatted_address":"Spain","geometry":{"bounds":{"northeast":{"lat":43.8504,"lng":4.6362},"southwest":{"lat":27.4985,"lng":-18.2648001}},"location":{"lat":40.46366700000001,"lng":-3.74922},"location_type":"APPROXIMATE","viewport":{"northeast":{"lat":43.8504,"lng":4.6362},"southwest":{"lat":27.4985,"lng":-18.2648001}}},"place_id":"ChIJi7xhMnjjQgwR7KNoB5Qs7KY","types":["country","political"]}],"status":"OK"},"requestUrl":"https://maps.googleapis.com/maps/api/geocode/json?latlng=41.546274%2C2.108613&key=XXXX","query":{"latlng":"41.546274,2.108613","key":"XXXX"}}
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
      selectTower: function(doneSelectTower) {
        console.log('---> 4.selectTower');

        if (reverseGeoloc &&
            reverseGeoloc.json &&
            reverseGeoloc.json.results &&
            reverseGeoloc.json.results.length > 0) {
          for (let i = 0; i < reverseGeoloc.json.results.length; i++) {
            if (reverseGeoloc.json.results[i].address_components &&
                reverseGeoloc.json.results[i].address_components.length > 0) {
              for (let j = 0; j < reverseGeoloc.json.results[i].address_components.length; j++) {
                if (reverseGeoloc.json.results[i].address_components[j].types &&
                    reverseGeoloc.json.results[i].address_components[j].types.length > 0 &&
                    reverseGeoloc.json.results[i].address_components[j].types.length[0] === 'locality') {
                  userLocalityName = reverseGeoloc.json.results[i].address_components[j].types.length[0];

                  for(let k = 0; k < CAMPANARS.length; k++) {
                    if (CAMPANARS[k].poble.indexOf(userLocalityName) !== -1) {
                      towerSelected = JSON.stringify(CAMPANARS[k]);
                    }
                  }
                }
              }
            }
          }
        } else {
          // No s'han torbat dades
          towerSelected = JSON.stringify(CAMPANARS[INDEX_CAMPANAR_MES_ALT]);
        }
      }

    }, function (err, results) {
      if (err) {
        console.error('Error: ' + JSON.stringify(err.message));

        res.render('index', {
          title: 'Alçada de Campanars de Catalunya',
          error: JSON.stringify(err.message),
          campanars: JSON.stringify(CAMPANARS),  // S'ha de passar fent un stringify sinó no es recupera bé al template
          campanarSeleccionat: towerSelected
        });

      } else {
        console.log('OK');

        res.render('index', {
          title: 'Alçada de Campanars de Catalunya',
          geocodeFromRequestHeaders: JSON.stringify(geolocRequestHeaders),
          geocodeFromUsersIP: JSON.stringify(geolocIPStack),
          reverseGeocoding: JSON.stringify(reverseGeoloc),
          pobleUsuari: userLocalityName,
          campanars: JSON.stringify(CAMPANARS),  // S'ha de passar fent un stringify sinó no es recupera bé al template
          campanarSeleccionat: towerSelected
        });
      }
    });
  } catch (e) {

    console.error('Exception: ' + e.message);

    res.render('index', {
      title: 'Alçada de Campanars de Catalunya',
      error: JSON.stringify(e.message),
      campanars: JSON.stringify(CAMPANARS),  // S'ha de passar fent un stringify sinó no es recupera bé al template
      campanarSeleccionat: towerSelected
    });
  }
});


router.get('/api/campanars', function(req, res, next) {
  res.status(200).json(CAMPANARS);
});


module.exports = router;
