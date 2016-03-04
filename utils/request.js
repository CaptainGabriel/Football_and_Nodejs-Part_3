"use strict";

//Nodejs modules.
const url = require('url');
const http = require('http');

/**
 * Simple validation over the json response returned
 * by the DB itself. i.e. When making an update.
 */
const checkResponse = require('../utils/utils').hasCouchSentError;

/**
 * API key used to access the webapi more often than usual.
 * @type {String}
 */
const apiKey = 'YOUR_API_KEY_GOES_HERE';
const optionsHeaders = {
    'X-Auth-Token': apiKey
};

/**
 * Used when performing requests to the api. It makes
 * use of our api key.
 */
function OptionsApi(url) {
    this.protocol = url.protocol || 'http:';
    this.hostname = url.hostname;
    this.port = url.port || 80;
    this.method = url.method || 'GET';
    this.path = url.pathname || '/';
    this.headers = optionsHeaders;
}

/**
 * A more generic approach for when performing requests.
 * Headers need to be set afterwards.
 */
function Options(p, m) {
    this.protocol = 'http:';
    this.hostname = process.env.COUCHIP || "127.0.0.1";
    this.port = process.env.COUCHPORT || 5984;
    this.method = m || 'GET';
    this.path = p || '/groups';
}
module.exports.Options = function(path, method) {
    return new Options(path, method);
};


/**
 * This function has the purpose of generify the code
 * in order to request any endpoint given as parameter.
 */
function requestEndpoint(endpointUri, callback) {

    const mainApiUrl = url.parse(endpointUri);
    const options = new OptionsApi(mainApiUrl);

    let req = http.request(options, (res) => {
        if (res.statusCode >= 500 && res.statusCode <= 505) {
            return callback(new Error('Server Error'));
        }
        if (res.statusCode !== 200) {
            return callback({
                badStatus: res.statusCode
            });
        }

        res.setEncoding('utf8');
        let chunks = [];

        res.on("data", (chunk) => chunks.push(chunk));
        res.on('error', callback);
        res.on("end", () => {
            let parsedjson;
            try {
                parsedjson = JSON.parse(chunks.join(" "));
            } catch (error) {
                return callback(error);
            }
            if (parsedjson) {
                callback(null, parsedjson);
            }
        });
    });
    req.on('error', callback);
    req.end();
}
module.exports.requestEndpoint = requestEndpoint;




//Created to be used in tests
//

module.exports.databaseOptions = function(path, method) {
    return new Options(path, method);
};

module.exports.requestWithOptions = function(options, objData, callback) {
    let req = http.request(options, (res) => {
        res.setEncoding('utf8');
        let chunks = [];

        res.on("data", (chunk) => chunks.push(chunk));
        res.on('error', callback);
        res.on("end", () => {
            let parsedjson;
            try {
                parsedjson = JSON.parse(chunks.join(" "));
            } catch (error) {
                return callback(error);
            }
            if (parsedjson) {
                callback(null, parsedjson);
            }
        });
    });
    if (objData) {
        req.setHeader("Content-Type", "application/json");
        req.write(JSON.stringify(objData));
    }
    req.on('error', callback);
    req.end();
};


/**
 * Performs an http request. If the third param is not null,
 * it will be sent in the request as data.
 *
 * callback's descriptor: (Error, obj) => void
 *
 */
module.exports.sendRequest = function(opts, callback, toWrite) {
    console.log(opts)
    const request = http.request(opts, (resp) => {
        let result = '';
        resp.on('error', callback);
        resp.on('data', (data => result += data));
        resp.on('end', () => {
            if (checkResponse(result)) {
                return callback(null, null);
            }
            let parsedjson;
            try {
                parsedjson = JSON.parse(result);
            } catch (error) {
                return callback(error);
            }
            if (parsedjson) {
                return callback(null, parsedjson);
            }
        });
    });
    if (toWrite) {
        request.write(JSON.stringify(toWrite));
    }
    request.on('error', callback);
    request.end();
};