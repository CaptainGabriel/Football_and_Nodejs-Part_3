/**
 * This module represents/exports the functions that handle the
 * various endpoints related to the segment '/leagues'.
 */
"use strict";


//request module
const requestResource = require('../utils/request').sendRequest;
//When requesting all seasons/leagues, use this url.
const MAIN_URL_ENDPOINT = require('../utils/utils').mainUrlEndpoint;

/**
 * The expected status of matches already finished.
 */
const FINISHED_STATUS = "FINISHED";

/**
 * The expected status of upcoming matches.
 */
const UPCOMING_STATUS = "TIMED";


const logos = require('../utils/utils').logosDictionary;

/**
 * The handler function for the route '/leagues'.
 * It tries to find and display all the leagues for the current season.
 *
 * @param  Object req
 *         The request object
 * @param  Object res
 *         The response object
 */
let rootHandler = function(req, res, next) {
    requestResource(MAIN_URL_ENDPOINT, function(err, allLeagues) {
        if (err) {
            return next(new Error("/leagues - Não foi possivel obter as ligas."));
        }
        let predicate = utils.predicateByCaption;
        allLeagues = allLeagues.sort(predicate);
        res.render('league_layouts/league_list_layout.handlebars', {
            title: 'All Leagues',
            description: 'Leagues',
            soccerLeagues: allLeagues,
            user: req.user
        });

    });
};


/**
 * The handler function used to respond to the route '/leagues/:league/teams'
 * and if the given league was found the handler will responde with the teams
 * that belong to that league. It responds using the JSON format.
 */
function teamsForGivenLeague(req, res, next) {
    if (req.league) {
        let teamsUrl = req.league._links.teams.href;
        requestResource(teamsUrl, function(err, allTeamsObj) {
            if (err) {
                return next(new Error("Error trying to search for a set of teams."));
            }
            res.status(200).json(allTeamsObj.teams);
        });
    } else {
        next();
    }
}

/**
 * The handler function that responds with the fixtures for a given team
 * of a given league.
 */
function fixturesOfSpecificTeam(req, res, next) {
    let fixturesUrl = req.team._links.fixtures.href;

    requestResource(fixturesUrl, function(err, fixturesObj) {
        if (err) {
            return next(err);
        }

        let fixturesTypeHolder = [];
        async.each(fixturesObj.fixtures, (val, traverse) => {
            fixturesTypeHolder.push(new Fixture(val));
            traverse();
        }, (err) => {
            if(err){
                next(err);
            }
            let context = {
                last: function() {
                    let sliceIdx = parseNum(req.lastFixtures);
                    return (!sliceIdx) ? null : fixturesTypeHolder
                        .filter((val) => val.status === FINISHED_STATUS).slice(sliceIdx);
                }(),
                next: function() {
                    let sliceIdx = parseNum(req.nextFixtures);
                    return (!sliceIdx) ? null : fixturesTypeHolder
                        .filter((val) => val.status === UPCOMING_STATUS).slice(sliceIdx);
                }(),
            };
            res.json(context);
        });

    });
}

/**
 * Handler function to deal with the route "'/:shortname/teams/:team_name'";
 *
 */
function teamFromLeagueHandler(req, res, next) {
    if (!req.team) { //404
        return next();
    }
    let contextObj = {
        title: req.team.name,
        team: req.team,
        user: req.user
    };
    res.render("teams_layouts/team_details", contextObj);
}


/**
 * Constructor function that handles some nuances of the api related to fixtures.
 * e.g.: Some times the results of upcoming games are shown as '-1' some times
 * are shown as 'null'.
 */
function Fixture(initiation) {
    //basic context object initiation
    this.date = require('../utils/helpers').dateHandler(initiation.date);
    this.status = initiation.status;
    this.match_day = initiation.matchday;
    this.home_team_name = initiation.homeTeamName;
    this.away_team_name = initiation.awayTeamName;
    this.result = {};

    //api is inconsistence. Sometimes gives 'null', sometimes '-1'
    //In order to standardize the presentation of results, we take care of these
    //cases here.
    if (!initiation.result || (initiation.result.goalsHomeTeam === -1)) {
        this.result.goalsHomeTeam = 0;
    } else {
        this.result.goalsHomeTeam = initiation.result.goalsHomeTeam;
    }

    if (!initiation.result || (initiation.result.goalsAwayTeam === -1)) {
        this.result.goalsAwayTeam = 0;
    } else {
        this.result.goalsAwayTeam = initiation.result.goalsAwayTeam;
    }
}


/**
 * The handler for the route '/leagues/:shortname/fixtures'.
 * This handler will build an object that will map fixtures to their matchdays.
 *
 * It will look like this:
 * {
 *   1 : [...],
 *   2 : [...],
 *   ....
 * }
 * Each key is a "matchday" and contains all the games related to that day.
 * This was helpful to separate fixtures according to their matchday inside
 * the handlebars template.
 *
 * @param  req  The request object
 * @param  res  The response object
 */
function leagueFixturesHandler(req, res, next) {
    let fixturesUrl = req.league._links.fixtures.href;

    requestResource(fixturesUrl, function(err, allFixtures) {
        if (err) {
            return next(err);
        }
        //object given to the template to work with.
        let contextObj = {
            description: req.league.caption + " - Resultados",
            title: req.league.caption + " - Resultados",
            fixtures: {},
            user: req.user
        };

        async.each(allFixtures.fixtures, function(value, traverseDone) {
            let newFixture = new Fixture(value);

            if (contextObj.fixtures[newFixture.match_day] === undefined) {
                contextObj.fixtures[newFixture.match_day] = [];
                contextObj.fixtures[newFixture.match_day].push(newFixture);
            } else {
                contextObj.fixtures[newFixture.match_day].push(newFixture);
            }
            //tell iteration over this fixture is done
            traverseDone();
        }, (err) => {
            if (err) {
                next(err);
            } else {
                res.render('league_layouts/league_fixtures', contextObj);
            }
        });
    });
}

/**
 * The handler function that presents the league table for
 * a given league.
 */
function leaguetableHandler(req, res, next) {
    let leagueTableUrl = req.league._links.leagueTable.href;
    requestResource(leagueTableUrl, function(err, leagueTableObj) {
        if (err) {
            return (err.badStatus) ? next() : next(err);
        }

        let contextData = {
            title: req.league.caption + ' | League Table',
            description: "League table of " + req.league.caption,
            leagueTable: leagueTableObj,
            user: req.user
        };
        res.render('league_layouts/leaguetable.handlebars', contextData);
    });
}

/**
 * The handler of the route '/leagues/{shortname}'.
 * It presents two ways of navigating into more features related to
 * a certain league.
 *
 * @param  req  The request object
 * @param  res  The response object
 */
function featuresOfGivenLeague(req, res, next) {
    if (!req.league) {
        return next();
    }

    res.render('league_layouts/league_details', {
        title: req.league.caption,
        leagueLogo: logos[req.league.league], //shortname of the league
        league: req.league,
        user: req.user
    });

}

/*
 * What to export
 */
module.exports = {
    "rootHandler" : rootHandler,
    "teamsForGivenLeague" : teamsForGivenLeague,
    "featuresOfGivenLeague" : featuresOfGivenLeague,
    "leaguetableHandler": leaguetableHandler,
    "leagueFixturesHandler": leagueFixturesHandler,
    "teamFromLeagueHandler": teamFromLeagueHandler,
    "fixturesOfSpecificTeam": fixturesOfSpecificTeam
    
}