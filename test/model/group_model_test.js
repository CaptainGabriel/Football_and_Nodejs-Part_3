'use strict';

//expect assertions style
const expect = require('expect.js');

const Group = require('./../../db_mappers/models/group_model').Group;

describe('Testing the model data type Group', function() {
    describe('Adding new READ permissions', function() {

        it('must be able to add an user based upon an object', function() {
            let newGroup = new Group({
                _id: "NewGroup",
                "name": "New Group"
            });
            let permissionObj = {
                user: "Pedro"
            };
            expect(permissionObj).to.be.an('object');
            newGroup.addReadPermissions(permissionObj);
            expect(newGroup.read).to.be.an('array')
            expect(newGroup.read[0]).to.eql(permissionObj.user);
        });

        it('must be able to add an user based upon a string', function() {
            let newGroup = new Group({
                _id: "NewGroup",
                "name": "New Group"
            });
            let username = "Pedro";
            expect(username).to.be.a('string');
            newGroup.addReadPermissions(username);
            expect(newGroup.read).to.be.an('array')
            expect(newGroup.read[0]).to.eql(username);
        });

        it('must not add repetead usernames to the permission list', function() {
            let newGroup = new Group({
                _id: "NewGroup",
                "name": "New Group"
            });

            expect("Pedro").to.be.a('string');

            //different references
            newGroup.addReadPermissions("Pedro"); //goes into [0]
            newGroup.addReadPermissions("Pedro"); //should not go into [1]

            expect(newGroup.read).to.be.an('array')

            expect(newGroup.read[0]).to.eql("Pedro");
            expect(newGroup.read[1]).to.be.undefined;
        });
    });

    describe('Adding new WRITE permissions', function() {

        it('must be able to add an user based upon an object', function() {
            let newGroup = new Group({
                _id: "NewGroup",
                "name": "New Group"
            });
            let permissionObj = {
                user: "Pedro"
            };
            expect(permissionObj).to.be.an('object');
            newGroup.addWritePermissions(permissionObj);
            expect(newGroup.write).to.be.an('array')
            expect(newGroup.write[0]).to.eql(permissionObj.user);
        });

        it('must be able to add an user based upon a string', function() {
            let newGroup = new Group({
                _id: "NewGroup",
                "name": "New Group"
            });
            let username = "Pedro";
            expect(username).to.be.a('string');
            newGroup.addWritePermissions(username);
            expect(newGroup.write).to.be.an('array')
            expect(newGroup.write[0]).to.eql(username);
        });

        it('must not add repetead usernames to the permission list', function() {
            let newGroup = new Group({
                _id: "NewGroup",
                "name": "New Group"
            });

            expect("Pedro").to.be.a('string');

            //different references
            newGroup.addWritePermissions("Pedro"); //goes into [0]
            newGroup.addWritePermissions("Pedro"); //should not go into [1]

            expect(newGroup.write).to.be.an('array')

            expect(newGroup.write[0]).to.eql("Pedro");
            expect(newGroup.write[1]).to.be.undefined;
        });
    });

});