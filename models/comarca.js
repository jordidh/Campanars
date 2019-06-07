/*
 * JDH 31/05/2019
 */


exports.findAll = function(campanars, done) {
    comarques = [];

    for (let i = 0; i < campanars.length; i++) {

        if (comarques.includes(campanars[i].comarca)) {
            // Do nothing
        } else {
            comarques.push(campanars[i].comarca);
        }
    }

    done (null, comarques.sort());
};
