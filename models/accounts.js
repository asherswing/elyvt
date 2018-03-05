var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

var User = require('./user.js')

var accountsSchema = new Schema({
	user: [
      {type: Schema.Types.ObjectId, ref: 'User'}
    ],
    accountdata: Object,

})
var accounts = module.exports = mongoose.model('accounts', accountsSchema);



module.exports.getaccounts = function( callback){
	var query = {};
	accounts.findOne(query, callback);
}

// module.exports.getfolderbyId = function(folderid, callback){
// 	var query = {folderid: folderid};
// 	folder.find(query, callback);
// }