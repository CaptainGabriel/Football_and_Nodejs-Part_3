/**
 * This module represents/exports the functions that handle the
 * various endpoints related to the segment '/account'.
 */
"use strict";

/**
 * The ctor function of the User model.
 */
const User = require('./../db_mappers/user_mapper').User;

/**
 * The module that interacts withthe "users" document.
 */
const userMapper = require('./../db_mappers/user_mapper');

/**
 * Controller for the route '/account/signup'.
 * It renders the form that the user can fullfill
 * in order to create a new account.
 *
 */
function signUp(req, res) {
    res.render('forms/form_signup.handlebars');
}

/**
 * The controller that handles the data sent from the form
 * in order to create a new user account.
 * It checks to see if some user already exists with the same info
 * and if not, the new account is created. Existant accounts are ignored.
 */
function handleSignUpForm(req, res, next) {
    let user = new User(req.body.username, req.body.password);
    user.email = req.body.email;
    userMapper.get(user._id, function(err, userJson) {
        if (err) {
            return next(err);
        }

        if (userJson) {
            //already present in the DB
            res.status(409).redirect('/account/signup');
        } else {
            userMapper.insert(user, (err, result) => {
                if (err) {
                    return next(err);
                }
                console.log(`User created with the id: ${result.id}`);
                res.redirect(303, '/account/login');
            });
        }
    });
}

/**
 * The controller that renders the form that the
 * user can fulfill in order to login into our application.
 */
function renderLoginForm(req, res) {
    res.render('forms/form_login.handlebars', {
        message: req.flash('message'),
        badLogin: req.flash('badLogin')
    });
}

/**
 * It performs the logout of the current session.
 */
function logOut(req, res) {
    req.logout();
    res.redirect(303,'/');
}

module.exports = {
    "signUp": signUp,
    "handleSignUpForm": handleSignUpForm,
    "renderLoginForm": renderLoginForm,
    "logOut": logOut
};