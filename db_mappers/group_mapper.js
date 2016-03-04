//sudo mkdir -p /var/run/couchdb
//sudo chown couchdb:couchdb /var/run/couchdb
//start couchdb
//sudo su couchdb -c /usr/bin/couchdb
//
//curl http://127.0.0.1:5984
//
//curl -X DELETE http://127.0.0.1:5984/groups/
//curl -X GET http://127.0.0.1:5984/groups/1
//curl -X PUT http://127.0.0.1:5984/groups/1 -d '{"name":"Masterminds","Teams":[]}'

"use strict";

const http = require('http');
const async = require('async');

const checkResponse = require('../utils/utils').hasCouchSentError;

let dbGroups = {};

/*
 * Clear cache bdGroups
 */
exports.clearCache = function() {
    dbGroups = {};
};

const Options = require('../utils/request').Options;

const Group = require('./models/group_model').Group;


/*
 * callback's descriptor: (Error, id) => void
 */
function insert(group, callback) {
    const opt = new Options('/groups', 'POST');
    opt.headers = {
        'Content-Type': 'application/json'
    };
    const request = http.request(opt, resp => {
        let result = '';
        resp.on('error', callback);
        resp.on('data', data => result += data);
        resp.on('end', () => callback(null, JSON.parse(result).id));
    });
    request.write(JSON.stringify(group));
    request.on('error', callback);
    request.end();
}

/*
 * callback's descriptor: (Error, Group) => void
 */
function get(id, callback) {
    const opt = new Options('/groups/' + id);
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
            const g = JSON.parse(result);
            dbGroups[g._id] = g;
            callback(null, new Group(g));
        });
    });
    request.on('error', callback);
    request.end();
}

/*
 * callback's descriptor: (Error, Group[]) => void
 */
function getAll(callback) {
    const opt = new Options('/groups/_all_docs');
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
function update(group, callback) {
    const g = dbGroups[group._id];
    if (!g) {
        callback(new Error('You must fetch the task before update it!'));
    } else {
        const opt = new Options(
            '/groups/' + group._id + '?rev=' + g._rev,
            'PUT');
        opt.headers = {
            'Content-Type': 'application/json'
        };
        const request = http.request(opt, resp => {
            resp.on('error', callback);
            resp.on('data', () => {});
            resp.on('end', callback);
        });
        request.write(JSON.stringify(group));
        request.on('error', callback);
        request.end();
    }
}

/*
 * callback's descriptor: (Error) => void
 */
function deleteById(id, callback) {
    const g = dbGroups[id];
    if (!g) {
        callback(new Error('You must fetch the Group before update it!'));
    } else {
        const opt = new Options(
            '/groups/' + id + '?rev=' + g._rev,
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
    }
}

//callback's descriptor: (Error, Group) => void
module.exports.get = function(id, callback) {
    get(id, callback);
};

//callback's descriptor: (Error, id) => void
module.exports.insert = function(group, callback) {
    insert(group, callback);
};

//callback's descriptor: (Error) => void
module.exports.update = function(group, callback) {
    update(group, callback);
};

//callback's descriptor: (Error, Group[]) => void
module.exports.getAll = function(callback) {
    getAll(callback);
};

//callback's descriptor: (Error) => void
module.exports.delete = function(id, callback) {
    deleteById(id, callback);
};