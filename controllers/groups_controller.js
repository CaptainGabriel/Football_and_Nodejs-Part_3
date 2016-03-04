/**
 * This module represents/exports the functions that handle the
 * various endpoints related to the segment '/groups'.
 */
"use strict";

const utils = require('./../utils/utils');

/**
 * DB Mappers
 */
const groupMapper = require('./../db_mappers/group_mapper');
const userMapper = require('../db_mappers/user_mapper');

/*
Local dependencies
 */

//Contains the caption of all the leagues available
let leaguesCache = [];
//who knows how to perform http requests
const requestResource = require('../utils/request').requestEndpoint;
//When requesting all seasons/leagues, use this url.
const mainApiEndpoint = require('../utils/utils').mainUrlEndpoint;


const NOT_EXISTS = -1;


/**
 * Add the group identifier to the user's database record.
 */
function refGroupInUserObject(user, groupID) {
    let objToUpdate = user;
    //setup array of teams
    if (!objToUpdate.groups) {
        objToUpdate.groups = [];
    }
    let groupExists = false;
    if(objToUpdate.groups.length > 0){
        objToUpdate.groups.forEach((g) => {
            if(g === groupID){
                groupExists = true;
            }
        });
    }
    if(!groupExists){
        objToUpdate.groups.push(groupID);
        return objToUpdate;
    }
}

const Group = require('./../db_mappers/models/group_model').Group;

/**
 * The handler function for the route '/groups'.
 * Displays all the groups present in the storage.
 *
 * The user can only see the groups if it has permission
 * or if he is the master.
 */
function rootHandler(req, res, next) {
    groupMapper.getAll((err, groups) => {
        if (err) {
            return next(err);
        }
        //The user can only see the groups that has permission to
        //or if he is the master.
        let permittedGroups = groups.filter((elem) => {
            return (elem.readPermissions.indexOf(req.user._id) !== NOT_EXISTS) || (elem.master === req.user._id);
        });
        res.render('groups_layouts/groups_list_layout', {
            groups: permittedGroups,
            user: req.user
        });
    });
}

let predicateByCaption = utils.predicateByCaption;

/**
 * Handler function for the route '/groups/new'.
 * Displays a new group form.
 */
function newGroupHandler(req, resp, next) {
    if (leaguesCache.length === 0) {
        requestResource(mainApiEndpoint, function(err, allLeagues) {
            if (err) {
                return next(err);
            }
            allLeagues = allLeagues.sort(predicateByCaption);

            for (let league of allLeagues) {
                leaguesCache.push({
                    caption: league.caption,
                    leagueCode: league.league
                });
            }
            resp.render('groups_layouts/group_form', {
                'leagueCaption': leaguesCache,
                'user': req.user
            });
        });
    } else {
        resp.render('groups_layouts/group_form', {
            'leagueCaption': leaguesCache,
            'user': req.user
        });
    }
}

/**
 * Handler for the route (POST) '/new'
 * Handles the data submited in the form.
 */
function newGroupHandlerPost(req, resp, next) {
    let data = {
        _id: utils.buildCodename(req.body.name),
        name: req.body.name,
        teams: req.body.teams,
        master: req.user._id
    };
    let newG = new Group(data);
    
    groupMapper.get(newG._id, (err, group) => {
        if(err){
            next(err);
        }
        if(!group){
            groupMapper.insert(newG, (err, id) => {
                if (err) {
                    return next(err);
                }
                console.log(`Inserted a new group with the id ${id}`);
        
                let objToUpdate = refGroupInUserObject(req.user, newG._id);
                //prevent the group is shown more than once
                if(objToUpdate){
                    userMapper.update(objToUpdate,
                        function(err, result) {
                            if (err) {
                                return next(err);
                            }
                            console.log("Updated User with id:", result._id);
                            resp.status(200).end("/groups/");
                        }
                    );
                }
            
            });
        } else {
            resp.status(409).send("This group name already exists");
        }
    });
}

/**
 * The handler function for the route '/groups/:group_name'
 * Displays the details of a certain group.
 */
function detailsOfGroup(req, res, next) {
    if (!req.group) {
        return next();
    }
    res.render('groups_layouts/group_detail', {
        groupName: req.group.name,
        teams: req.group.teams,
        nextFixturesAmount: req.nextFixtures,
        lastFixturesAmount: req.lastFixtures,
        user: req.user
    });
}

/*
What to export
 */
module.exports = {
    rootHandler: rootHandler,
    createGroupHandler: newGroupHandler,
    handleDataGroupCreation: newGroupHandlerPost,
    detailsOfGroup: detailsOfGroup
};