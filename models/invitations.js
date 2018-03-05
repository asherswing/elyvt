var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

var User = require('./user.js')

var invitationsSchema = new Schema({
	user: [
      {type: Schema.Types.ObjectId, ref: 'User'}
    ],
    invitationdata: Object,
})
var invitations = module.exports = mongoose.model('invitations', invitationsSchema);

module.exports.gettasks = function(callback){
	var query = {};
	invitations.findOne(query, callback);
}

// module.exports.getfolderbyId = function(folderid, callback){
// 	var query = {folderid: folderid};
// 	folder.find(query, callback);
// }