'use strict';

//expect assertions style
const expect = require('expect.js');

const authController = require('../../controllers/auth_controller');

describe('Granting permission to access route', function() {
    describe('when user is authenticated', function() {
        it('must grant permission', function() {

            let mockReq = {
                isAuthenticated: () => true
            }

            let permission = false;

            let mockNext = function() {
                permission = true;
            }

            let mockRes = {
                redirect: function() {}
            }

            authController.checkPermission(mockReq, mockRes, mockNext);

            expect(permission).to.be.equal(true);
        });
    });

    describe('when user in not authenticated', function() {
        it('must not grant permission', function() {
            let mockReq = {
                isAuthenticated: () => false
            }
            let permission = false;
            let mockNext = function() {
                permission = true;
            }
            let mockRes = {
                redirect: function() {}
            }
            authController.checkPermission(mockReq, mockRes, mockNext);
            expect(permission).to.be.equal(false);
        });

        it("must redirect to '/' and give 401 status", function() {
            let mockReq = {
                isAuthenticated: () => false
            }
            let permission = false;
            let mockNext = function() {
                permission = true;
            }
            let mockRes = {
                status: null,
                path: null,
                redirect: function(status, path) {
                    this.status = status;
                    this.path = path;
                }
            }
            authController.checkPermission(mockReq, mockRes, mockNext);

            expect(mockRes.status).to.be.equal(401);
            expect(mockRes.path).to.be.equal('/');
        });
    });
});