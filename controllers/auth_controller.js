/**
 * This module exports a function that acts as middleware
 * to various endpoints restraining the access to some resources
 * without authentication.
 */
"use strict";

/**
 * Piece of middleware that checks if the user is authenticated.
 */
function grantPermissionToAccessRoute(req, res, next) {
    return (req.isAuthenticated()) ? next() :
        res.redirect('/account/login');
}

module.exports = {
    "checkPermission": grantPermissionToAccessRoute
};