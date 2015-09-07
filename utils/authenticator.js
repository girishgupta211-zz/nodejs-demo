var mongoose = require('mongoose'),
	util = require('util'),
	co = require('co'),
	l = require( '../logger').root.child( { module : __filename.substring( __dirname.length+1, __filename.length-3 ) } );

exports.localUser = function (email, password, done) {
	var User = mongoose.model('User');
	l.info("auth %s %s", email, password);

	co(function *() {
		try {
			return yield User.passwordMatches(email, password);
		} catch (ex) {
			return null;
		}
	}).then(function (user) {
		done(null, user);
	});
};
