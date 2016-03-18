'use strict';

/**
 *  Mappers
 */
const groupMapper = require('./../db_mappers/group_mapper');
const userMapper = require('./../db_mappers/user_mapper');
const inviteMapper = require('./../db_mappers/invite_mapper');

/*
 * Contains all the leagues previously checked out.
 */
let leaguesCache = [];

//request module
const requestResource = require('../utils/request').requestEndpoint;

// When requesting all seasons/leagues, use this url.
const mainApiEndpoint = require('../utils/utils').mainUrlEndpoint;

//the ctor function from the model
const Invite = require("./../db_mappers/models/invite_model").Invite;

/**
 * The handler of the route '/profile/'.
 */
function rootHandler(req, res, next) {
    groupMapper.getAll((err, groups) => {
        if (err) {
            //do something
            next(err);
        }
        //groups this user and write access to
        let writeGroups = [];
        let currUser = req.user.username;
        groups.forEach((group) => {
            if (group.master === currUser) {
                return;
            }
            group.writePermissions.forEach((u) => {
                if (u === currUser) {
                    writeGroups.push(group);
                }
            });
        });
        res.render('user_profile', {
            'title': 'Profile',
            'user': req.user,
            'writeGroups': writeGroups
        });
    });
}

/**
 * The handler of the route '/profile/groups/{group_id}'.
 * This endpoint shows the details of the given group. The group
 * must be associated to the user.
 */
function profileGroupById(req, res) {
    res.render('groups_layouts/group_detail', {
        groupName: req.group.name,
        teams: req.group.teams,
        nextFixturesAmount: req.nextFixtures,
        lastFixturesAmount: req.lastFixtures,
        user: req.user
    });
}

const pred = require('./../utils/utils').predicateByCaption;

/**
 * The handler function for the route '/groups/:group_name/edit'.
 * Displays an edit page for the desired group.
 */
function editGroupHandler(req, res, next) {
    let context = {
        'leagueCaption': leaguesCache,
        'groupName': req.group.name,
        'teams': req.group.teams,
        'user': req.user
    };

    if (leaguesCache.length === 0) {
        requestResource(mainApiEndpoint, function(err, allLeagues) {
            if (err) {
                return next(err);
            }
            allLeagues = allLeagues.sort(pred);
            for (let league of allLeagues) {
                leaguesCache.push({
                    caption: league.caption,
                    leagueCode: league.league
                });
            }
            context.leagueCaption = leaguesCache;
            res.render('groups_layouts/group_edit', context);
        });
    } else {
        res.render('groups_layouts/group_edit', context);
    }
}

/**
 * The handler function for the route '/groups/:group_name/edit'.
 * Handles the form submit for the edited group
 */
function editGroupPostHandler(req, res, next) {
    groupMapper.get(req.body.name, (err, group) => {
        if (err) {
            next(err);
        }
        group.teams = JSON.parse(req.body.teams);
        groupMapper.update(group, (err) => {
            if (err) {
                return next(err);
            }
            res.status(200).end("/profile/");
        });
    });
}

/**
 * 
 */
function updateGroupPermission(req, res, next) {
    groupMapper.get(req.body.group, (err, group) => {
        if (err) {
            next(err);
        }
        if (req.body.permission == 'read') {
            group.readPermissions.push(req.user.username);
        }
        if (req.body.permission == 'write') {
            group.readPermissions.push(req.user.username);
            group.writePermissions.push(req.user.username);
        }
        groupMapper.update(group, () => {});
    });
}

/**
 * Delete a group from the database
 */
function deleteGroupFromUser(req, resp, next) {
    groupMapper.delete(req.group.name, (err) => {
        if (err) {
            next(err);
        } else {
            //rem group name from user object in the DB
            let updatedUser = req.user;
            let idx = updatedUser.groups.indexOf(req.group.name);
            updatedUser.groups.splice(idx, 1);
            userMapper.update(updatedUser, function(err, result) {
                if (err) {
                    return next(err);
                }
                resp.status(200).end('/profile');
            });
        }
    });
}

/**
 * Before an insert we verify if an equal invite is already present on the db
 * If there is we issue an update
 * If not an new one is inserted
 */
function insertInvite(req, res, next) {

    let newInv = new Invite({
        'from': req.user.username,
        'to': req.body.to,
        'group': req.body.group,
        'permissions': req.body.permissions
    });

    inviteMapper.getAll((err, invites) => {
        if (err) {
            next(err);
        }
        let equalFound = false;
        invites.forEach((element) => {
            if (newInv.equals(element)) {
                equalFound = true;
                //modify the element to be updated
                element.permissions = newInv.permissions;
                inviteMapper.update(element);
                return;
            }

        });
        if (equalFound) {
            return;
        }
        //an equal invite wasnt found

        inviteMapper.insert(newInv, ((err, id) => {
            if (err) {
                return next(err);
            }
            console.log(`Inserted a new invite with the id ${id}`);
        }));
    });
}

/**
 * This function acts as a piece of middleware that
 * requests all the invites, for a certain user,
 * from the database
 * and stores it in a property of the request.
 *
 * With this field (setOfInvites) will be possible
 * to check if a certain user has invitations just by
 * querying the endpoint '/profile/invites'.
 */
function hasInvitations(req, res, next) {
    inviteMapper.getAll((err, invites) => {
        if (err) {
            return next(err);
        }
        //filter only those which are related to our logged in user
        req.setOfInvites = invites.filter((elem) => {
            return elem.to === req.user.username;
        });
        next();
    });
}

/**
 * Helper method that for a set of invites related
 * to the user logged in it will create an array of objects
 * and each object will hold more information about the user
 * who made it. This is done in order to present more and better
 * information when listing the invites.
 */
function getUsersHelper(setOfInvites, callback) {
    userMapper.getAll((err, setOfUsers) => {
        if (err) {
            return callback(err);
        }
        let invitationsHolder = [];
        setOfInvites.forEach((invite) => {
            setOfUsers.forEach((user) => {
                if (user.username === invite.from) {
                    //
                    //necessary to fix inner objects being passed as string
                    //instead of actual objects
                    //
                    let auxObj = JSON.parse(invite.permissions);
                    invite.permissions = auxObj;
                    //beware, passwords go in blank
                    let tmp = {
                        "from": {
                            "username": user.username,
                            "email": user.email
                        },
                        "group": invite.group,
                        "permissionGranted": (invite.permissions.write == true) ? "write" : "read"
                    }
                    invitationsHolder.push(tmp);
                }
            });
        });
        callback(null, invitationsHolder);
    });
}

/**
 * Handler that will render a list of invites for the current
 * logged in user if he has any.
 */
function showAllInvitations(req, resp, next) {
    if (req.setOfInvites.length <= 0) {
        resp.render('invites_layouts/invite_list_layout', {
            'noInvites': true,
            'user': req.user
        })
    } else {
        getUsersHelper(req.setOfInvites, (err, invites) => {
            if (err) {
                return next(err);
            }
            resp.render('invites_layouts/invite_list_layout', {
                'invites': invites,
                'user': req.user
            });
        });
    }
}

function deleteInvite(req, res, next) {
    //object used to compare and find the corresponding invite on the db
    let inviteObj = {
        'to': req.user.username,
        'from': req.body.from,
        'group': req.body.group
    };
    inviteMapper.getAll((err, invites) => {
        if (err) {
            next(err);
        }
        invites.forEach((element) => {
            if (element.equals(inviteObj)) {
                inviteMapper.delete(element._id, function() {});
                console.log("ticket deleted with id: " + element._id);
            }
        });
    });
}

module.exports = {
    "deleteGroupFromUser": deleteGroupFromUser,
    "editGroupPostHandler": editGroupPostHandler,
    "editGroupHandler": editGroupHandler,
    "profileGroupById": profileGroupById,
    "rootHandler": rootHandler,
    "insertInvite": insertInvite,
    "hasInvitations": hasInvitations,
    "showAllInvitations": showAllInvitations,
    "deleteInvite": deleteInvite,
    "updateGroupPermission": updateGroupPermission
};