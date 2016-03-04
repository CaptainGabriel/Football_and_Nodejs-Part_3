'use strict';

//some utilities
const request = require('../../utils/request');


const expect = require('expect.js');

//the mapper module
const inviteMapper = require("./../../db_mappers/invite_mapper");
//the ctor function from the model
const Invite = require("./../../db_mappers/models/invite_model").Invite;


/*
Invites represent the possibility given to a user to have access to other 
user's groups and are defined as:
	{
		"from": "some user id",
		"to":   "some user id",
		"group": "some group id",
		"permissions": {"read": [true or false], "write": [true or false]}
	}

The document will be erased before running each test.
*/


describe('Testing the module that maps the document "Invites" to our application',
    function() {

        //beware that there is no '_id' property so ids will be generated
        //by the database itself.
        //This should use the Ctor function
        let mockInvite = new Invite({
            "from": "MyMockedSelf",
            "to": "MyMockedFriend",
            "group": "MyMockedGroup",
            "permissions": {
                "read": false,
                "write": false
            }
        })


        //clean document
        beforeEach(function(done) {
            let deleteDB = request.databaseOptions('/invites', 'DELETE');

            request.requestWithOptions(deleteDB, null, function(err) {
                if (err) {
                    return done(err);
                }
                let createNewDB = request.databaseOptions('/invites', 'PUT');
                request.requestWithOptions(createNewDB, null, function(err) {
                    if (err) {
                        return done(err);
                    }
                    return done();
                });
            });
        });

        it('should be possible to retrieve a single element using its ID', function(done) {

            inviteMapper.insert(mockInvite, (err, idOfInsertedInvite) => {
                if (err) {
                    return done(err);
                }
                //test the "get" method
                //callback's descriptor: (Error, Invite) => void
                inviteMapper.get(idOfInsertedInvite, (err, record) => {
                    if (err) {
                        return done(err);
                    }
                    //an instance created using the ctor function
                    //expect(record).to.be.an.instanceof(Invite);
                    //expect strictly equality of ids
                    expect(record._id).to.equal(idOfInsertedInvite);
                    done();
                });
            });
        });
        it('must be possible to retrieve an array of elements', function(done) {

            inviteMapper.insert(mockInvite, (err, idOfInsertedInvite) => {
                if (err) {
                    return done(err);
                }
                //test the "get" method
                //callback's descriptor: (Error, Invite) => void
                inviteMapper.getAll((err, setOfInvites) => {
                    if (err) {
                        return done(err);
                    }
                    //expect an array
                    //expect(setOfInvites).to.be.instanceof(Array);
                    expect(setOfInvites.length).to.not.be.undefined;
                    expect(setOfInvites.length).to.equal(1);
                    done();
                });
            });
        });

        it('should be possible to update an existing record', function(done) {

            inviteMapper.insert(mockInvite, (err, idOfInsertedInvite) => {
                if (err) {
                    return done(err);
                }
                //test the "update" method
                inviteMapper.getAll((err, setOfInvites) => {
                    if (err) {
                        return done(err);
                    }
                    let theInvite = setOfInvites[0];
                    //update field
                    theInvite.to = "Barack Obama";
                    //try to update
                    inviteMapper.update(theInvite, (err, inviteObj) => {
                        if (err) {
                            return done(err);
                        }

                        //update returns an answer with a status code and
                        //the '_id' and '_rev' of the updated object.
                        //Get the updated object through Get
                        inviteMapper.get(inviteObj.id, (err, objUpdated) => {
                            if (err) {
                                return done(err);
                            }
                            expect(objUpdated.to).to.equal('Barack Obama');
                            done();
                        });
                    });
                });
            });
        });
    });