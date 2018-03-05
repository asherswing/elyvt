var mongoose = require('mongoose');
//mongoose.set('debug', true);
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

var User = require('./user.js');

var folderSchema = new Schema({
	user: [
      {type: Schema.Types.ObjectId, ref: 'User'}
    ],
    //foldersdata: Object,
	id: { type: String },
	title: { type: String },
	description: {type: String},
	color: { type: String },
	childIds: Object,
	scope: { type: String },
	projectId: Object,
	project: Object,
	authorIds: Object,
	isProject: { type: Boolean },
	parentId: { type: String },
	milestone: { type: String },
	projectManager: {type: Schema.Types.ObjectId, ref: 'User'},
	buildingManager: Object,
	clientprojectManager: Object,
	clientlaunchManager: Object,
	uiManager: Object,
	securityManager: Object,
	securityintegratorManager: Object,
	conceirageManager: Object,
	communicationManager: Object,
	eventsManager: Object,
	facilityManager: Object,
	foodandbeverageManager: Object,
	startDate: { type: String },
	endDate: { type: String },
	dependencyIds: {type: String},
	hasAttachments: {type: String},
    attachmentCount: {type: String},
    attachents: {type: String},
	status: {type: String},
	isDeleted: { type: Boolean },

})
var folder = module.exports = mongoose.model('folder', folderSchema);


module.exports.getfolders = function( callback){
	var query = {};
	folder.find(query).populate('user').exec(callback);
}

module.exports.getfolderbyId = function(folderid, callback){
	var query = {_id: folderid};
	folder.findOne(query).exec(callback);
}

module.exports.getfolderbyParentId = function(folderid, callback){
	var query = {parentId: folderid};
	folder.find(query, callback);
}

module.exports.getprojects = function(callback){
	var query = {isProject: true, isDeleted: false};
	folder.find(query).populate({
        path: 'projectManager'
    }).exec(callback);
}

module.exports.getArchiveProjects = function(callback){
	var query = {isProject: true, isDeleted: true};
	folder.find(query, callback);
}


module.exports.getrootfolder = function(callback){
	var query = {title: 'Root'};
	folder.findOne(query, callback);
}

module.exports.updateFolder = function(query, newValues, callback){
	var query = query;
	folder.updateOne(query, newValues, callback);
}

module.exports.deleteproject = function($projectID, callback){
	var query = {_id: $projectID};
	var isDeleted = {isDeleted: true};
	folder.updateOne(query, isDeleted, callback);
}

module.exports.restoreProject = function($projectID, callback){
	var query = {_id: $projectID};
	var isDeleted = {isDeleted: false};
	folder.updateOne(query, isDeleted, callback);
}

 