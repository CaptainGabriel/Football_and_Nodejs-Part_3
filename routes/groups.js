'use strict';

const express = require('express');

const groupMapper = require('./../db_mappers/group_mapper');
const utils = require('./../utils/utils');

let router = express.Router();
var bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({
    extended: false
}));
router.use(bodyParser.json());


//The controllers
const authController = require('../controllers/auth_controller');
const groupsController = require('../controllers/groups_controller');


//middleware auth verifier
router.use(authController.checkPermission);

//Root route
router.get('/', groupsController.rootHandler);

router.get('/new', groupsController.createGroupHandler);


/**
 * Piece of middleware that handles body parameter sent when
 * inserting/updating teams of a given group. This parameter
 * is a string in json format.
 */
router.use(function(req, res, next) {
    if (req.body.teams) {
        req.body.teams = JSON.parse(req.body.teams);
    }
    next();
});

router.post('/new', groupsController.handleDataGroupCreation);


router.param('group_name', function(req, res, next, param) {
    groupMapper.get(param, (err, group) => {
        if (err) {
            return next(err);
        }
        if (group) {
            req.group = group;
            req.group.teams = group.teams;
        }
        next();
    });
});


/**
 * Piece of middleware to handle que query parameters that specify what fixtures
 * to show while presenting the details of a certain team.
 */
router.use(function(req, res, next) {
    if (req.query !== '') {
        //expect parameters 'next' and 'last'
        if (req.query.next) {
            req.nextFixtures = req.query.next;
        }
        if (req.query.last) {
            req.lastFixtures = req.query.last;
        }
    }
    next();
});


router.get('/:group_name', groupsController.detailsOfGroup);

/**
 * What to export.
 */
module.exports = router;