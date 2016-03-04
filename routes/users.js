'use strict';
const express = require('express');
const router = express.Router();

const bodyParser = require("body-parser");

router.use(bodyParser.urlencoded({
    extended: false
}));
router.use(bodyParser.json());


//request module
const requestResource = require('../utils/request').requestWithOptions;


function Options(p, m) {
    this.protocol = 'http:';
    this.hostname = "127.0.0.1";
    this.port = 5984;
    this.method = m || 'GET';
    this.path = p || '/users';
}


/**
 * Handler that responds to the endpoint '/users/'.
 * It returns all the users registered inside the application
 * except the one logged in at the moment.
 */
function getAllUsers(req, res, next) {
    let options = new Options('/users/_all_docs');
    requestResource(options, null, function(err, data) {
        if (err) {
            return next(err);
        }

        let rows = data.rows;
        if (rows) {
            rows = rows.map((elem) => {
                return elem.id;
            });
            rows = rows.filter((elem) => {
                return elem !== req.user._id;
            });
            res.json(rows);
        } else {
            res.json({});
        }

    });
}
router.get('/', getAllUsers);


module.exports = router;