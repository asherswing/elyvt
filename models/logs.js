var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

var logsSchema = new Schema({
	//taskdata: Object,
    log_type: {type: String},
    log_content: Object,
    old_data: Object,
    new_data: Object,
    created_at: {type: String},
    log_type_id: {type: String},
    log: {type: String},
    msg: {type: String},
    action: {type: String},
    user_id: Object,
})
var logs = module.exports = mongoose.model('logs', logsSchema);

module.exports.createLogs = function(newlogs, callback){
	
	        newlogs.save(callback);
	    } 
module.exports.getalllogs = function(callback) {
	var query = {};
	logs.find(query).sort({ _id : 'desc'}).exec(callback);
}