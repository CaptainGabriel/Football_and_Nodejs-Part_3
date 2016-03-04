const passport = require('passport');


module.exports = function(app) {
    app.use(passport.initialize());
    app.use(passport.session());

    /**
	Use the serializeUser() method to specify what information about the user 
	should actually be stored in the session. 
	You can still keep other data elsewhere, but this is the data that gets 
	associated with the session cookie.

	We can save the entireobject or just the "primary key" and
	later obtain the entire obj.
	*/
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    /*
	The deserializeUser() method is where you take the stored session data and turn
	it back into a rich object for use by your application. 
	
	This operation must be light and fast since it will happen on 
	virtually every request to your server.
	*/
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    //estratégias deve ser 'required' nesta zona. Cada função fará a configuração de uma estratégia especifica
    require('./strategies/local')();

};