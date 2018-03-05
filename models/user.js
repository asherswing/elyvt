var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;
var roles = require('./roles.js');

// User Schema
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index:true
	},
	password: {
		type: String
	},
	email: {
		type: String
	},
	firstname: { type: String},
	lastname: { type: String},
	email_assignee: { type: String},
	title: { type: String},
	type: { type: String},
	phone:{type:String},
	roles: [
      {type: Schema.Types.ObjectId, ref: 'roles'}
    ],
	types: { type: String},
	avatarUrl: { type: String},
	deleted: {type: String},
	resetPasswordToken: String,
	noemail: {type: Boolean},
  	resetPasswordExpires: Date,
  	email_setting: {type: String}
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.getAllUsers = function(callback) {
	var query = {};
	User.find(query, callback);
}

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        newUser.save(callback);
	    });
	});
}


module.exports.updateUser = function(User, callback){
	console.log("Line 59", User);
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(User.password, salt, function(err, hash) {
	        User.password = hash;
	        User.save(callback);
	    });
	});
}
module.exports.updatecontact = function(query, newValues, callback){
	var query = query;
	User.updateOne(query, newValues, callback);
}
module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}

module.exports.getUserByEmail = function(email, callback){
	var query = {email: email};
	User.findOne(query, callback);
}

module.exports.getcontacts = function(callback){
	var query = {};
	User.find(query, callback);
}
module.exports.getAllUser = function($id, callback){
	var query = {_id: { $ne: $id }};
	User.find(query, callback);
}

module.exports.getUserID = function(id, callback){
	var query = {_id: id};
	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}


module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}
module.exports.deletecontact= function($contactID, callback){
    var query = {_id: $contactID};
    User.remove(query, callback);
}