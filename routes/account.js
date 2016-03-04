'use strict';
const express = require('express');
const router = express.Router();

const bodyParser = require("body-parser");

router.use(bodyParser.urlencoded({
    extended: false
}));
router.use(bodyParser.json());


const flash = require('connect-flash');
router.use(flash());

const accountController = require('./../controllers/account_controller');

const passport = require('passport');

/**
 * Render the Sign Up form.
 */
router.get('/signup', accountController.signUp);

/**
 * It check if the data belongs to another user already in the database,
 * if not a new user is inserted.
 */
router.post('/signup', accountController.handleSignUpForm);

/**
 * Render the login form.
 */
router.get('/login', accountController.renderLoginForm);

/**
 * Delegates the logout action to the passport method 'logout'.
 */
router.get('/logout', accountController.logOut);


/**
 * Ao receber os dados via POST (formulario),
 * delegamos a responsabilidade de fazer a autenticação para
 * o módulo Passport.js.
 *
 * A estratégia, neste caso 'local', vai tratar de autenticar os dados.
 * Irá executar o código dentro da estratégia local. Lá, é suposto
 * procurar pelo "user" fornecido dentro da DB e comparar
 * com os dados recebidos.
 *
 * Segue o padrão "Custom Callbacks" presente na documentação do Passport.js
 * para fazer uso do 'req' e 'res' por closure.
 * Isto serviu principalmente para aproveitar informação do objecto 'info'.
 * Outras maneira eram igualmente possiveis.
 */
router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, loginSes, info) {
        if (err) {
            return next(err);
        }

        if ((info && info.badLogin) || !loginSes) {
            //set the message & flag from 'done' callback
            req.flash('message', info.message);
            req.flash('badLogin', true);
            return res.redirect('/account/login');
        }

        req.logIn(loginSes, function(err) {
            if (err) {
                return next(err);
            }
            res.redirect('/profile');
        });

    })(req, res, next);
});


/**
 * What to export
 */
module.exports = router;