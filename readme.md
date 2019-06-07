Converteix dades en EXCEL a JSON
1. Verifica que l'excel té les següents columnes: id, poble, advocació, comarca, alçada
1. Verifica que la columna "alçada" té format numèric
1. Exporta l'excel a csv, amb separador "," i " per delimitar texts
1. Verifica que la primera fila del csv són els noms de les columnes
1. Substitueix el ',' per '.' en la columna de l'alçada. Assegurar que el ",00" està canviat a ".00"
1. Copia tot el csv a la web http://www.convertcsv.com/csv-to-json.htm
1. Prém el botó "CSV to JSON"
1. Copia el resultat i posa'l al fitxer /data/campanars.js, després de "global.CAMPANARS ="

Actualitza les dades de geolocalització:
$ cd node_modules/geoip-lite && npm run-script updatedb

