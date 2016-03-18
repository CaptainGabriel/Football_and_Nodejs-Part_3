'use strict';

const express = require('express');
let router = express.Router();
const async = require('async');

const utils = require('../utils/utils');
const buildCodename = utils.buildCodename;

//request module
const requestResource = require('../utils/request').sendRequest;
//When requesting all seasons/leagues, use this url.
const MAIN_URL_ENDPOINT = require('../utils/utils').mainUrlEndpoint;

const leagueController = require('../controllers/league_controller');


router.get('/', leagueController.rootHandler);


/**
 * Middleware function that handles the variable paramenter in the route
 * '/leagues/:shortname'.
 * It tries to find the correct league according to the parameter and
 * modifies the request object in order to make it accessible
 * from the route handler.
 *
 * The route handler must verify if the property 'league' inside the request
 * object is available and not undefined. If its not, the league was not found
 * or does not exist.
 *
 * e.g: in '/leagues/BL1', param = 'BL1'
 * therefore req.league will be the league object.
 */
router.param('shortname', function(req, res, next, param) {
    requestResource(MAIN_URL_ENDPOINT, function(err, allLeagues) {
        if (err) {
            return next(err);
        }
        async.each(allLeagues, (season, traverseDone) => {
            if (season.league === param) {
                req.league = season;
                next();
            } else {
                traverseDone();
            }
        }, (err) => {
            if (err) {
                next(err);
            } else {
                next(); //assures the process continues even if the league was not found
            }
        });
    });
});


router.get('/:shortname/teams', leagueController.teamsForGivenLeague);

router.get('/:shortname', leagueController.featuresOfGivenLeague);

router.get('/:shortname/leaguetable', leagueController.leaguetableHandler);


/**
 * The next route might receive some query parameters. Those will limit or not
 * the response given by the controller. In order to respond accordingly this
 * middleware will deal with the verification and assign of those parameters
 * if they exist.
 */
router.use(function(req, res, next) {
    if (req.query !== '') {
        if (req.query.next) {
            req.nextFixtures = req.query.next;
        }
        if (req.query.last) {
            req.lastFixtures = req.query.last;
        }
    }
    console.log(req.query);
    next();
});

router.get('/:shortname/fixtures', leagueController.leagueFixturesHandler);

/**
 * Middleware function that helpers dealing with the second variable parameter
 * located in the route "/leagues/:shortname/teams/:team_name".
 */
router.param('team_name', function(req, res, next, param) {
    if (req.league) {
        let teamsLink = req.league._links.teams.href;
        requestResource(teamsLink, function(err, teamsObj) {
            if (err) {
                next(err);
            } else {
                /*
                 * Traverse each team and search for the correct code/fullname.
                 * The correct one is inserted in the request object as a new property.
                 */
                async.each(teamsObj.teams, function(oneSingleTeam, searchDone) {
                        if (oneSingleTeam.code !== null) {
                            if (oneSingleTeam.code === param) {
                                req.team = oneSingleTeam;
                            } else {
                                let codename = buildCodename(oneSingleTeam.name);
                                if (codename === param) {
                                    req.team = oneSingleTeam;
                                }
                            }
                        } else {
                            let codename = buildCodename(oneSingleTeam.name);
                            if (codename === param) {
                                req.team = oneSingleTeam;
                            }
                        }
                        searchDone();
                    },
                    function(err) {
                        if (err) {
                            next(err);
                        } else {
                            next();
                        }
                    }
                );
            }
        });
    } else {
        next();
    }
});


router.get('/:shortname/teams/:team_name', leagueController.teamFromLeagueHandler);


/**
 *
 */
function parseNum(str) {
    if (!str) {
        return undefined;
    }
    let num = parseInt(str);
    return (parseInt(str) > 0) ? num * -1 : num;
}


router.get('/:shortname/fixtures/:team_name', leagueController.fixturesOfSpecificTeam);


/*
 To be used during production.
 */
module.exports = router;

/*
 require only during test development.
 */
module.exports.test = {
    root: rootHandler,
    shortnameVar: featuresOfGivenLeague,
    fixtures: leagueFixturesHandler,
    leaguetable: leaguetableHandler
};