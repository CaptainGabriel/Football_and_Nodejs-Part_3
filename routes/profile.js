'use strict';
const express = require('express');
const router = express.Router();

const bodyParser = require("body-parser");

router.use(bodyParser.urlencoded({
    extended: false
}));
router.use(bodyParser.json());


/*
 Mappers.
 Used in some pieces of middleware.
 */
const groupMapper = require('./../db_mappers/group_mapper');
const userMapper = require('./../db_mappers/user_mapper');

/*
Controllers
 */
const authController = require('../controllers/auth_controller');
const profileController = require('../controllers/profile_controller');


//middleware auth verifier
router.use(authController.checkPermission);


/**
 * Perform some work over the variable "group name" that is
 * part of the url. We check to see if there is a group with this
 * name.
 */
router.param('group_name', function(req, res, next, param) {
    groupMapper.get(param, (err, group) => {
        if (err) {
            return next(err);
        }
        if (group) {
            req.group = group;
        }
        next();
    });
});


router.get('/', profileController.rootHandler);

router.get('/groups/:group_name', profileController.profileGroupById);

/**
 * The acton of modifying a certain group requires at all times
 * that the user performing this action is authenticated.that.
 *
 * The user must be the owner or have write acess to edit
 */
router.route('/groups/:group_name/edit')
    .all(function(req, res, next) {
        if (req.user.username === req.group.master) {
            console.log("MASTER");
            next();
        } else {
            if (req.group.writePermissions.indexOf(req.user.username) != -1)
                next();
            else
                return res.redirect(401, '/'); //unauthorized access;

        }
        console.log("NOOOT MASTER");
    })
    .get(profileController.editGroupHandler)
    .post(profileController.editGroupPostHandler);

router.delete('/groups/:group_name', profileController.deleteGroupFromUser);

router.delete('/invites/show', profileController.deleteInvite);

router.post('/invites/show', profileController.updateGroupPermission);

router.post('/invites', profileController.insertInvite);

router.use(profileController.hasInvitations);

router.route('/invites/show').get(profileController.showAllInvitations);

router.get('/invites/', (req, res, next) => {
    if (req.setOfInvites) {
        res.send(req.setOfInvites.length);
    }
});

router.post('/invites/revoke/', (req, res, next) => {
    console.log('ID', req.body.group_id);
    groupMapper.get(req.body.group_id, (err, group) => {
        if (err) {
            return next(err);
        }
        group.readPermissions = [];
        group.writePermissions = [];

        groupMapper.update(group, (err) => {
            if (err) {
                return next(err);
            }
            res.status(200).send('updated');
        });
    });
});

/*What to export.*/
module.exports = router;