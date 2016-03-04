"use strict";

const http = require('http');
const async = require('async');

const sendRequest = require('../utils/request').sendRequest;

function Options(p, m) {
    this.protocol = 'http:';
    this.hostname = process.env.COUCHIP || "127.0.0.1";
    this.port = process.env.COUCHPORT || 5984;
    this.method = m || 'GET';
    this.path = p || '/users';
}

/**
 *Ctor function that creates a new instance of User.
 *
 * @param username {String} The username
 * @param email {String} The email
 * @param password {String} The password
 */
function User(username, password, email) {
    this._id = username;
    this.username = username;
    this.password = password;
    this.email = email;

}

/**
 * The insert functionality.
 *
 * callback's descriptor: (Error, obj) => void
 */
function insert(user, callback) {
    const opt = new Options(null, 'POST');
    opt.headers = {
        'Content-Type': 'application/json'
    };
    sendRequest(opt, callback, user);
}

/**
 * The get by the given id functionality.
 *
 * callback's descriptor: (Error, obj) => void
 */
function get(id, callback) {
    const opt = new Options('/users/' + id);
    opt.headers = {
        'Content-Type': 'application/json'
    };
    sendRequest(opt, callback);
}

/**
 * The update functionality.
 *
 * callback's descriptor: (Error, obj) => void
 */
function update(user, callback) {
    get(user._id, function(err, userDB) {
        if (err) {
            let msg = 'You are trying to update a record that does not exist!';
            return callback(new Error(msg));
        }
        //update rev to most recent version
        user._rev = userDB._rev;

        const opt = new Options(
            '/users/' + userDB._id + '?rev=' + userDB._rev,
            'PUT');
        opt.headers = {
            'Content-Type': 'application/json'
        };

        sendRequest(opt, callback, user);
    });
}

/*
 * callback's descriptor: (Error, User[]) => void
 */
function getAll(callback) {
    const opt = new Options('/users/_all_docs');
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
  What it is exported
*/
module.exports.User = function(name, password) {
    return new User(name, password);
};

module.exports.get = function(id, callback) {
    get(id, callback);
};

//callback's descriptor: (Error, User[]) => void
module.exports.getAll = function(callback) {
    getAll(callback);
};

module.exports.insert = function(user, callback) {
    insert(user, callback);
};

module.exports.update = function(user, callback) {
    update(user, callback);
};