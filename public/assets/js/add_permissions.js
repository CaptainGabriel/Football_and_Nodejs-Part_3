"use strict";
$(document).ready(function() {

    //shows the dynamic box where the user can select other users to send
    //an invitation with read/write permissions.

    $('.profile_view_invite_group').click(function(evt) {
        evt.preventDefault();
        let toAppend = $(evt.target).parents(".profile-groups-view-group-div");
        if (toAppend.next().is('form')) {
            toAppend.next().remove();
            return;
        }

        $.getJSON('/users/', null,
            function(data) {

                let allOptions = $('<form class="form_of_options"></form>');

                data.forEach(function(elem) {
                    let divNewOptions = $('<div class="profile-user-view-invite-div"></div>');
                    let spanNewOption = $('<span></span>').text(elem + " : ");

                    $('<label></label>').text(elem)
                        .attr('id', 'user_name')
                        .appendTo(spanNewOption);

                    $('<span></span>').text(" : ")
                        .appendTo(spanNewOption);

                    $('<label></label>').text("Read")
                        .attr('for', 'read_box')
                        .appendTo(spanNewOption);
                    $(`<input id="read_box"></input>`)
                        .attr('type', 'checkbox')
                        .on('click', null, null, handleReadCheckBoxClickEvent)
                        .appendTo(spanNewOption);
                    $('<label></label>').text("Write")
                        .attr('for', 'write_box')
                        .appendTo(spanNewOption);
                    $('<input id="write_box"></input>')
                        .attr('type', 'checkbox')
                        .on('click', null, null, handleWriteCheckBoxClickEvent)
                        .appendTo(spanNewOption);
                    spanNewOption.appendTo(divNewOptions);
                    allOptions.append(divNewOptions);
                });

                let btn = $('<button class="btn btn-success profile-user-view-invite-button" type="submit">Invite</button>')
                    .on('click', null, null, handleInviteClickEvent);
                allOptions.append(btn);
                toAppend.after(allOptions);
                let btnRevoke = $('<button class="btn btn-danger profile-user-view-invite-button">Revoke Permissions</button>')
                    .on('click', null, null, revokeAllPrivileges);
                allOptions.append(btnRevoke);

            }).error(function() {
            console.log('Error trying to get all users from /users/');
        });
    });

    /**
     * Handles the click on the invite button
     * It makes an ajax request with the data of the invites to be created
     */
    function handleInviteClickEvent(evt) {
        evt.preventDefault();
        $.each($('.profile-user-view-invite-div'), function() {
            //
            //get info needed to build the invite            
            //
            let group = $(this).parent().prev('.profile-groups-view-group-div').children().text();
            //remove whitespaces
            group = $.trim(group);
            let permissions = {
                'read': $(this).children().children('#read_box').is(":checked"),
                'write': $(this).children().children('#write_box').is(":checked")
            };
            permissions = JSON.stringify(permissions);
            //check if no permission was selected
            if (permissions.read === false && permissions.write === false)
                return; //this is equivalent to 'continue' for jQuery loop
            // if there is write automatically assign read
            if (permissions.write === true)
                permissions.read = true;
            //who the invite is adressed to
            let to = $(this).children().children('#user_name').text();
            //
            let invite = {
                'group': group,
                'to': to,
                'permissions': permissions
            };
            //
            //for each one its sent an ajax request to handle the invite
            //
            $.ajax({
                type: "POST",
                url: '/profile/invites/',
                data: invite,
                success: function(result) {
                    console.log("sucess");
                    //only works if status code is 200
                },
                error: function(data) {}
            });
        });
        //after the request hide the form
        $(evt.target).parents('.form_of_options').remove();
    }


    function revokeAllPrivileges(evt) {
        evt.preventDefault();

        let group = $.trim($(evt.target).parent()
            .prev('.profile-groups-view-group-div')
            .find('.profile-groups-view-group-a')
            .text());

        $.ajax({
            type: "POST",
            url: 'profile/invites/revoke',
            data: {
                'group_id': group
            },
            success: function(result) {
                //only works if status code is 200
            },
            error: function(data) {}
        });
    }

    /**
     * If write is selected, check read
     */
    function handleWriteCheckBoxClickEvent(evt) {
        let elemEvt = $(evt.target);
        if (elemEvt.is(":checked")) {
            let irmao = elemEvt.siblings('input');
            irmao.prop('checked', true);
        }
    }
    /**
     * If read is selected, uncheck read
     */
    function handleReadCheckBoxClickEvent(evt) {
        let elemEvt = $(evt.target);
        if (!elemEvt.is(":checked")) {
            let bro = elemEvt.siblings('input');
            bro.prop('checked', false);
        }
    }
});