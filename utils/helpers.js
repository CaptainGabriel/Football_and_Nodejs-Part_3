/**
 * This module exports the helper functions used by the handlebar's
 * templates.
 *
 */
"use strict";

function removeSpaces(name) {
    if (name !== undefined) {
        return name.replace(/\s/g, "");
    }
    return name;
}

function dateHandler(rawdate) {
    //expecting -> 2015-08-1T18:30:00Z
    if (!rawdate) {
        return "";
    }
    let readableDate;

    readableDate = rawdate.slice(0, 10);
    readableDate += ' ';
    readableDate += rawdate.slice(10, 16);

    return readableDate;
}

function validateGoals(goals) {
    if (goals && goals >= 0) {
        return '' + goals;
    } else {
        return '0';
    }
}

function linkToProperUser(loggedUsername, contextGroup) {
    //if the logged user is not the master of the group, he can only watch
    if (loggedUsername !== contextGroup.master) {
        return "/groups/" + contextGroup._id;
    } else {
        //otherwise he can touch
        return "/profile/groups/" + contextGroup._id;
    }
}


function calcHash(str) {
    return require('crypto').createHash('md5').update(str).digest("hex");
}

module.exports = {
    "removeSpaces": removeSpaces,
    "dateHandler": dateHandler,
    "validateGoals": validateGoals,
    "linkToProperUser": linkToProperUser,
    "calcHash": calcHash
};