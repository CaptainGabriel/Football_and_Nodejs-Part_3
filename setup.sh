#! /bin/bash

echo "Welcome. We will setup all the tools you need"
echo "to execute the Grupo01's web app in your system."

sudo apt-get -qq install couchdb -y
sudo apt-get -qq install curl -y

users="-X PUT localhost:5984/users"
USERS_STATUS_CODE=`curl --output /dev/null --silent --write-out ‘%{http_code}\n’ $users`
# echo $USERS_STATUS_CODE

groups="-X PUT localhost:5984/groups"
GROUPS_STATUS_CODE=`curl --output /dev/null --silent --write-out ‘%{http_code}\n’ $groups `
# echo #GROUPS_STATUS_CODE

echo "All ready. Lets start the app."
cmd="npm start"
eval $cmd 
