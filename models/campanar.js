/*
 * JDH 31/05/2019
 */


exports.findAllByComarca = function(campanars, comarca, done) {
    campanarsDeLaComarca = [];

    for (let i = 0; i < campanars.length; i++) {
        if (campanars[i].comarca === comarca) {
            campanarsDeLaComarca.push(campanars[i]);
        }
    }

    done (null, campanarsDeLaComarca);
};

exports.findAllByPoble = function(campanars, poble, done) {
    campanarsDelPoble = [];

    for (let i = 0; i < campanars.length; i++) {
        if (campanars[i].poble === poble) {
            campanarsDeLaComarca.push(campanars[i]);
        }
    }

    done (null, campanarsDelPoble);
};

exports.findHigher = function(campanars, done) {
    let campanarMesAlt = null;

    for (let i = 0; i < campanars.length; i++) {
        if (campanarMesAlt === null) {
            campanarMesAlt = campanars[i];
        }

        if (parseFloat(campanars[i].alçada) > parseFloat(campanarMesAlt.alçada)) {
            campanarMesAlt = campanars[i];
        }
    }

    done (null, campanarMesAlt);
};

exports.findLower = function(campanars, done) {
    let campanarMesBaix = null;

    for (let i = 0; i < campanars.length; i++) {
        if (campanarMesBaix === null) {
            campanarMesBaix = campanars[i];
        }

        if (parseFloat(campanars[i].alçada) < parseFloat(campanarMesBaix.alçada)) {
            campanarMesBaix = campanars[i];
        }
    }

    done (null, campanarMesBaix);
};