'use strict';
const passport = require('passport');

const LocalStrategy = require('passport-local').Strategy; //ctor function

const User = require('./../../db_mappers/user_mapper').User;
const userMapper = require('./../../db_mappers/user_mapper');


/*
	NOTE FROM DOCUMENTATION:
		By default, LocalStrategy expects to find credentials in parameters 
		named username and password. 
		If your site prefers to name these fields differently, 
		options are available to change the defaults.
*/

/*
 queremos usar os nossos pŕoprios nomes pelo que devemos especificar num objecto
 "Options"
 */
module.exports = function() {

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================

    passport.use(
        new LocalStrategy(function(username, password, done) {
            //integração com a DB neste ponto seria o mais normal.
            //não era necessário criar este objecto, só para melhor compreensao.
            let userSent = new User(username, password);

            //pass this object when login goes wrong
            let badLoginOptions = {
                'message': 'Bad Login! Username or password was incorrect.'
            }

            userMapper.get(userSent._id, function(err, userResult) {
                if (err) {
                    return done(err);
                }

                //couchDB returns 'error' property
                if (!userResult || userResult.error) {
                    return done(null, false, badLoginOptions);
                }

                //if data match with data from DB...
                if (userSent.password === userResult.password) {
                    done(null, userResult);
                } else {
                    done(null, false, badLoginOptions);
                }
            });
        })
    );

    // =========================================================================
    // END LOCAL SIGNUP ========================================================
    // =========================================================================
}