var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

var User = require('./user.js')

var question_answerSchema = new Schema({
	user: [
		{type: Schema.Types.ObjectId, ref:'User'}
	],
	// folder: [
	// {type: Schema.Types.ObjectId, ref='folder'}
	// ],
	taskid: {type: String},
	question: {type: String},
	answer: {type: String}
})

var question_answer = module.exports = mongoose.model('question_answer', question_answerSchema);

module.exports.getQuestionAnswers = function(taskId,  callback){
	var query = {'taskid': taskId};
	question_answer.find(query, callback);
}


module.exports.getQuestionbyId = function(questionId,  callback){
	var query = {'_id': questionId};
	question_answer.findOne(query, callback);
}