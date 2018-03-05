var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

var rolesSchema = new Schema({
	//taskdata: Object,
    id: {type: String},
    title: {type: String},
    description: {type: String},
})
var roles = module.exports = mongoose.model('roles', rolesSchema);

module.exports.createRoles = function(newRoles, callback){
	
	        newRoles.save(callback);
	    }


module.exports.getallroles = function(callback){
	var query = {};
	roles.find(query, callback);
}

module.exports.getrolesbyId = function($roleID, callback){
	var query = {_id: $roleID};
	roles.findOne(query, callback);
}

module.exports.deleteroles = function($roleID, callback){
    var query = {_id: $roleID};
    roles.remove(query, callback);
}

