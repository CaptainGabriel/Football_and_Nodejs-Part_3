# Football & Node.JS - Part 3

## Problem being solved

In the final part of this project we had to modify the second part to be able to support the following features:

* Sign up and login features;
* Restrict the access to the app's functionalities to non-authenticated users;
* Users should be able to invite other users to see/modify their groups according to the permission given. Only the "_master_" of a certain group can delete that same group but users with permissions can see and/or modify them.
* Every user can access a specific page where he can accept or refuse the invitations sent to him.

Last but not least, made once again with the contribution of @HenriqueCalho.

# How did we solved it

Let's traverse the new functionalities and explain briefly how we did it.

#### Authentication and Login

To deal with this funtionality we added to our dependencies a module named _**"Passport.js"**_. This module gives us the possibility to accept more than one way of dealing with user's authentication just by adding the specific logic that proves that some user has valid credentials. This various ways are called "_strategies_". Depending on the one we use our app might be able to handle different forms of authentication. In this case we just use the [Local Stategy](https://github.com/jaredhanson/passport-local#passport-local).Its important to say that we are aware that the way we store passwords is wrong but this was not something important to us during the development of this app. Getting to know the module was far more important.

The main logic implemented inside the local strategy is just making sure the password and username given through the login form belong to some user known to us.

This module also helped us with the second feature where we restrict access to any resource every time a user not authenticated tries to access it.

#### Send an invite to another user

In order to support invites our application had to grow a bit more. We now support another document inside our DB called _"invites"_. This document holds the records of each invite still not accepted/refused. Think about it has a repo of pending invites. Of course we could maintain them and change the state of each one to keep record of the invites sent but this was not the case. We chose to keep only those not yet accepted/refused. The dashboard that checks to see if an user has pending invites traverses this table in order to get all the invites sent to that user. 

Another module to map the application data with the database data was created and is called _"invite_mapper.js"_. 

An invite specifies the user that sent it, the user that will receive it as well as the permissions given to the one receiving it. Permissions can be read and/or write permissions. It means he can check the group and see its content or he can also change the group. 


## How to use

If your using linux (debian-based) like me you can just run the script _setup.sh_ and all the configuration needed to use the CouchDB database will be handled. In every other system you need to have the CouchDB driver installed and documents "groups", "invites" and "users" created.

`npm install`

`npm start`

Don't forget your api key. Add it to the module "request.js".
