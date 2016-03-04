/**
 * Ctor function to create an instance of Group.
 * The "id" property is the name of the group without blank spaces.
 * It is used as the uri that identifies the group.
 *
 * Permissions are defined as the following properties:
 *   readPermissions : list of users that own permission to check out the group
 *   writePermissions : list of users that own permission to modify the group
 */
function Group(dbObject) {
    this._id = dbObject._id;
    this.name = dbObject.name;
    this.teams = dbObject.teams;
    this.master = dbObject.master;
    this.readPermissions = dbObject.readPermissions || [];
    this.writePermissions = dbObject.writePermissions || [];
}

/**
 * Helper function that adds a permission into one of the lists.
 */
function addPermission(struct, permission) {
    if (typeof permission === 'object') {
        if (struct.indexOf(permission.user) === -1) {
            struct.push(permission.user);
        }
    } else if (typeof permission === 'string') {
        if (struct.indexOf(permission) === -1) {
            struct.push(permission);
        }
    }
}

/**
 * Add read permissions to the group instance.
 *
 * If the parameter is an object, the method expects a property
 * 'user' from which can retrieve the username/id of the user that
 * will have read permissions over the group.
 *
 * Accepts a simple string if is only the username
 */
Group.prototype.addReadPermissions = function(permission) {
    addPermission(this.readPermissions, permission);
};

/**
 * Remove read permissions to the group instance.
 */
Group.prototype.remReadPermissions = function(permission) {

};

/**
 * Add write permissions to the group instance.
 */
Group.prototype.addWritePermissions = function(permission) {
    addPermission(this.writePermissions, permission);
};

/**
 * Remove write permissions to the group instance.
 */
Group.prototype.remWritePermissions = function(permissions) {
    // body...
};


module.exports.Group = function(dataObj) {
    return new Group(dataObj);
};