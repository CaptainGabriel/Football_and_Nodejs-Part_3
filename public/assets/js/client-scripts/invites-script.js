"use strict";

/**
 * On this script its handled the event scripts of invites' accept and decline button
 * These button are on /profile/invites/show
 */

$(document).ready(function() {
    
    /**
     * /profile/invites/show
     *
     * Handles the click on the accept button
     * After an invite is accepted the ticket must be delted
     */
    $('.profile-invites-view-decline-button').click(function(evt) {
        let dataObj = {
          'from': $(evt.target).parents('.profile-invites-view-invite-div').find("#username").text(),
          'group': $(evt.target).parents('.profile-invites-view-invite-div').find("#groupname").text()
        };
        //request so the invite is deleted
        $.ajax({
            type: "DELETE",
            url: '/profile/invites/show',
            data: dataObj,
            success: function(result) {
                console.log("sucess");
                //only works if status code is 200
            },
            error: function(data) { }
        });
        //hide the invite elements
        $(evt.target).parents('.profile-invites-view-invite-div').remove();
    });
    
    /**
     * /profile/invites/show
     *
     * Handles the click on the accept button
     * After an invite is accepted the ticket must be delted
     * and the info on the group updated
     */
    $('.profile-invites-view-accept-button').click(function(evt) {
        let permission = $(evt.target).parents('.profile-invites-view-invite-div').find("#permission").text();

       let dataObj = {
          'group': $(evt.target).parents('.profile-invites-view-invite-div').find("#groupname").text(),
          'permission': permission
        };
        //update the group
        $.ajax({
            type: "POST",
            url: '/profile/invites/show',
            data: dataObj,
            dataType: 'json',
            success: function(result) {
                console.log("sucess");
                //only works if status code is 200
            },
            error: function(data) { }
        });
        //request so the invite is deleted
        let dataObj2 = {
          'from': $(evt.target).parents('.profile-invites-view-invite-div').find("#username").text(),
          'group': $(evt.target).parents('.profile-invites-view-invite-div').find("#groupname").text()
        };
        //request so the invite is deleted
        $.ajax({
            type: "DELETE",
            url: '/profile/invites/show',
            data: dataObj2,
            success: function(result) {
                console.log("sucess");
                //only works if status code is 200
            },
            error: function(data) { }
        });
        //hide the invite elements
        $(evt.target).parents('.profile-invites-view-invite-div').remove();
    });
});