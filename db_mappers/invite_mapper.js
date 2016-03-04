"use strict";

const http = require('http');
const async = require('async');
const checkResponse = require('../utils/utils').hasCouchSentError;
const sendRequest = require('../utils/request').sendRequest;

// http request options
const Options = require('../utils/request').Options;

// invite model
const Invite = require('./models/invite_model').Invite;

/*
 * callback's descriptor: (Error, id) => void
 */
function insert(invite, callback) {
    const opt = new Options('/invites', 'POST');
    opt.headers = {
        'Content-Type': 'application/json'
    };
    const request = http.request(opt, resp => {
        let result = '';
        resp.on('error', callback);
        resp.on('data', data => result += data);
        resp.on('end', () => callback(null, JSON.parse(result).id));
    });
    request.write(JSON.stringify(invite));
    request.on('error', callback);
    request.end();
}

/*
 * callback's descriptor: (Error, Invite) => void
 */
function get(id, callback) {
    const opt = new Options('/invites/' + id);
    opt.headers = {
        'Content-Type': 'application/json'
    };
    const request = http.request(opt, resp => {
        let result = '';
        resp.on('error', callback);
        resp.on('data', data => result += data);
        resp.on('end', () => {
            if (checkResponse(result)) {
                return callback(null, null);
            }
            const parsedRes = JSON.parse(result);
            callback(null, new Invite(parsedRes));
        });
    });
    request.on('error', callback);
    request.end();
}

/*
 * callback's descriptor: (Error, Invite[]) => void
 */
function getAll(callback) {
    const opt = new Options('/invites/_all_docs');
    let operations = [];
    const request = http.request(opt, resp => {
        let result = '';
        resp.on('error', callback);
        resp.on('data', data => result += data);
        resp.on('end', () => {
            result = JSON.parse(result);
            for (let val of result.rows) {
                operations.push((finish) => exports.get(val.id, finish));
            }
            async.parallel(operations, callback);
        });
    });
    request.on('error', callback);
    request.end();
}

/*
 * callback's descriptor: (Error) => void
 */
function deleteById(id, callback) {
    get(id, (err, invite) => {
        if (err) {}
        const opt = new Options(
            '/invites/' + id + '?rev=' + invite._rev,
            'DELETE');
        opt.headers = {
            'Content-Type': 'application/json'
        };
        const request = http.request(opt, resp => {
            resp.on('error', callback);
            resp.on('data', () => {});
            resp.on('end', () => callback(null));
        });
        request.on('error', callback);
        request.end();
    });
}

function update(invite, callback) {
    get(invite._id, function(err, inviteDB) {
        if (err) {
            let msg = 'You are trying to update an invite that does not exist!';
            return callback(new Error(msg));
        }
        invite._id = inviteDB._id;
        invite._rev = inviteDB._rev;
        invite.permissions = JSON.parse(invite.permissions);
        const opt = new Options('/invites/' + invite._id + '?rev=' + invite._rev, 'PUT');
        opt.headers = {
            'Content-Type': 'application/json'
        };
        const request = http.request(opt, resp => {
            resp.on('error', callback);
            resp.on('data', () => {});
            resp.on('end', callback);
        });
        request.write(JSON.stringify(invite));
        request.on('error', callback);
        request.end();
    });
}

//callback's descriptor: (Error, id) => void
module.exports.insert = function(invite, callback) {
    insert(invite, callback);
};

//callback's descriptor: (Error, Invite) => void
module.exports.get = function(id, callback) {
    get(id, callback);
};

//callback's descriptor: (Error, Invite[]) => void
module.exports.getAll = function(callback) {
    getAll(callback);
};

//callback's descriptor: (Error, obj) => void
module.exports.update = function(invite, callback) {
    update(invite, callback);
};

module.exports.delete = function(id, callback) {
    deleteById(id, callback);
};