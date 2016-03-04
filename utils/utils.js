"use strict";


/**
 * Utility function that replaces blanck spaces.
 */
function buildCodename(name) {
    return (name !== undefined) ? name.replace(/\s/g, "") : name;
}


/**
 * Provides a based-dictionary access in order to obtain the path to an image
 * that represent a certain league.
 * The key to be searched inside this object is the "caption" present in every league.
 */
module.exports.logosDictionary = {
    'BL1': '/images/leagues_logos/bundesliga_logo.jpg',
    'BL2': '/images/leagues_logos/bundesliga_logo.jpg',
    'BL3': '/images/leagues_logos/bundesliga_logo.jpg',
    'FL1': '/images/leagues_logos/ligue_1.gif',
    'FL2': '/images/leagues_logos/ligue_1.gif',
    'DED': '/images/leagues_logos/eredivisie.png',
    'PL': '/images/leagues_logos/premier_league.png',
    'PPL': '/images/leagues_logos/liga_tuga.jpg',
    'PD': '/images/leagues_logos/primera division.png',
    'SD': '/images/leagues_logos/segunda_division.jpg',
    'SA': '/images/leagues_logos/serie_a.png',
    'CL': '/images/leagues_logos/ucl_logo.jpg'
};

/**
 * When requesting all seasons/leagues, use this url.
 */
const MAIN_URL_ENDPOINT = "http://api.football-data.org/alpha/soccerseasons";


module.exports.buildCodename = function(name) {
    return buildCodename(name);
};

module.exports.mainUrlEndpoint = MAIN_URL_ENDPOINT;


/**
 * Compare function used to sort an array of leagues
 * by it's caption property.
 *
 * @param  Object league1
 *         League to compare
 * @param  Object league2
 *         League to compare
 * @return int
 *         0 if equal, -1 if league2 "bigger" than league1, 1 otherwhise.
 */
module.exports.predicateByCaption = function byCaption(league1, league2) {
    if (league1.caption < league2.caption)
        return -1;
    if (league1.caption > league2.caption)
        return 1;
    return 0;
}


/**
 * Various modules make requests to the DB expecting some answers. The problem
 * is when the DB sends an answer saying the resource does not exist.
 * This function tests that response. Use it right after getting an answer to
 * some http request made to the DB.
 *
 * couchDB response when item not found: { 'error' : .... }
 */
module.exports.hasCouchSentError = function(jsonResp) {
    //parse if string, else it expects object
    let response = (typeof jsonResp === 'string') ?
        JSON.parse(jsonResp) : jsonResp;
    return response.error !== undefined;
}