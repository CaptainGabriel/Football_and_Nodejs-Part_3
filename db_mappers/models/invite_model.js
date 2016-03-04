/**
 * Ctor function to create an instance of Invite.
 * 
 * An invite is exchanged between two users and adresses a given group.
 * Permissions indicates the level of acess the user will have.
 * Its a string and the allowed values are 'read' or 'write'
 */
function Invite(dbObject) {
    this._id = dbObject._id;
    this.from = dbObject.from;
    this.to = dbObject.to;
    this.group = dbObject.group;
    this.permissions = dbObject.permissions;
    this._rev = dbObject._rev;
}

/**
 * To be equal they must have the same from, to and group
 */
function equals(other) {
    return this.to === other.to &&
        this.from === other.from &&
        this.group === other.group;
}

Invite.prototype.equals = equals;

/**
 * What to export
 */
module.exports.Invite = function(dataObj) {
    return new Invite(dataObj);
};

module.exports.equals = function(other) {
    return equals(other);
};