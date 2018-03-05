var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

var User = require('./user.js')

var contactsSchema = new Schema({
	user: [
      {type: Schema.Types.ObjectId, ref: 'User'}
    ],
    firstname: { type: String},
	lastname: { type: String},
	title: { type: String},
	type: { type: String},
	roles: { type: String},
	avatarUrl: { type: String},
	deleted: {type: String},
	resetPasswordToken: String,
  	resetPasswordExpires: Date
})
var contacts = module.exports = mongoose.model('contact', contactsSchema);

module.exports.getcontacts = function(callback){
	var query = {};
	contacts.findOne(query, callback);
}

 //module.exports.getfolderbyId = function(folderid, callback){
 	//var query = {folderid: folderid};
 	//folder.find(query, callback);
// }