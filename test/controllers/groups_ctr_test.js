'use strict';

//expect assertions style
const expect = require('expect.js');

const request = require('../../utils/request');
const groupController = require('./../../controllers/groups_controller');

describe('Testing the GroupsController module', function() {
    describe('The root route ("/groups/")', function() {
        /*
        Common data to the next units of tests
         */
        let mockReq = {
            user: {}
        };

        let mockNext = function() {};

        describe('without groups in the database ', function() {
            /**
             * This functions cleans the table "/groups"
             * in order for the next block act over an empty database.
             */
            before('Cleaning the table "/groups"', function(done) {
                let deleteDB = request.databaseOptions('/groups', 'DELETE');

                request.requestWithOptions(deleteDB, null, function(err) {
                    if (err) {
                        return done(err);
                    }
                    let createNewDB = request.databaseOptions('/groups', 'PUT');
                    request.requestWithOptions(createNewDB, null, function(err) {
                        if (err) {
                            return done(err);
                        }
                        return done();
                    });
                });
            });

            it('must return an empty set of groups ', function(done) {
                let mockRes = {
                    layout: null,
                    contextObj: null,
                    render: function(layoutName, ctxObject) {
                        this.layout = layoutName;
                        this.contextObj = ctxObject;

                        expect(this.layout).to.be.equal('groups_layouts/groups_list_layout');

                        //deep (aka structural) equality
                        expect(this.contextObj.groups).to.be.empty;

                        done();
                    }
                };

                groupController.rootHandler(mockReq, mockRes, mockNext);

            });

            it('must render the template "groups_layouts/groups_list_layout"',
                function(done) {
                    let mockRes = {
                        layout: null,
                        render: function(layoutName, ignore) {
                            this.layout = layoutName;
                            expect(this.layout).to.be.equal('groups_layouts/groups_list_layout');
                            done();
                        }
                    };

                    groupController.rootHandler(mockReq, mockRes, mockNext);

                });
        });

        describe('with groups in the database', function() {
            before('Insert new records into "/groups"', function(done) {
                cleanAndInsertTwoRecords(done);
            });

            it('must return an array with two groups as objects', function(done) {
                let mockRes = {
                    layout: null,
                    contextObj: null,
                    render: function(layoutName, ctxObject) {
                        this.layout = layoutName;
                        this.contextObj = ctxObject;

                        expect(this.layout).to.be.equal('groups_layouts/groups_list_layout');

                        expect(this.contextObj.groups[0]).to.be.an('object')
                        expect(this.contextObj.groups[0]).to.eql(objData);

                        expect(this.contextObj.groups[1]).to.be.an('object')
                        expect(this.contextObj.groups[1]).to.eql(objData2);

                        done();
                    }
                };
                //the actual test
                groupController.rootHandler(mockReq, mockRes, mockNext);
            });
        });
    });
});


/**
 * This functions cleans the table "/groups"
 * and adds two new records afterwards.
 */
function cleanAndInsertTwoRecords(done) {
    let deleteDB = request.databaseOptions('/groups', 'DELETE');

    request.requestWithOptions(deleteDB, null, function(err) {
        if (err) {
            return done(err);
        }
        let createNewDB = request.databaseOptions('/groups', 'PUT');
        request.requestWithOptions(createNewDB, null, function(err) {
            if (err) {
                return done(err);
            }

            let mapper = require('../../db_mappers/group_mapper');
            mapper.insert(objData, (err) => {
                if (err) {
                    return done(err);
                }
                mapper.insert(objData2, (err) => {
                    if (err) {
                        return done(err);
                    }
                    return done(err);
                });
            });
        });
    });
}



/*
Some pre - built objects that can be used to be
insert into the database.
*/
let objData = {
    "_id": "NewGroup",
    "name": "NewGroup",
    "teams": [{
        "league": "1. Bundesliga 2015/16",
        "leagueCode": "BL1",
        "team": "Eintracht Frankfurt"
    }],
    "master": "pedro"
}
let objData2 = {
    "_id": "NewGroup2",
    "name": "NewGroup2",
    "teams": [{
        "league": "1. Bundesliga 2015/16",
        "leagueCode": "BL1",
        "team": "Eintracht Frankfurt"
    }],
    "master": "pedro"
}