var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

var questionsSchema = new Schema({
	//taskdata: Object,
    id: {type: String},
    question: {type: String}
})
var questions = module.exports = mongoose.model('questions', questionsSchema);

module.exports.getallquestions = function(callback){
	var query = {};
	questions.find(query, callback);
}

module.exports.getquestionsbyId = function($questionID, callback){
	var query = {_id: $taskID};
	questions.findOne(query, callback);
}

module.exports.deletequestions = function($questionID, callback){
    var query = {_id: $taskID};
    questions.remove(query, callback);
}

// module.exports.getfolderbyId = function(folderid, callback){
// 	var query = {folderid: folderid};
// 	folder.find(query, callback);
// }