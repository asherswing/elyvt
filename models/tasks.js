var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
//mongoose.set('debug', true);
var Schema = mongoose.Schema;

var User = require('./user.js')
var folder = require('./folders.js')

var tasksSchema = new Schema({
	user: [
      {type: Schema.Types.ObjectId, ref: 'User'}
    ],
    //taskdata: Object,
    id: {type: String},
    accountId: {type: String},
    title: {type: String},
    description: {type: String},
    briefDescription: {type: String},
    parentIds: Object,
    parentFolderIds: {type: String},
    project: {type: Schema.Types.ObjectId, ref: 'folder'},
    milestone: {type: Schema.Types.ObjectId, ref: 'folder'},
    superParentIds: Object,
    sharedIds: Object,
    responsibleIds: Object,
    status: {type: String},
    importance: {type: String},
    createdDate: {type: String},
    updatedDate: {type: String},
    dates: Object,
    scope: {type: String},
    authorIds: Object,
    customStatusId: {type: String},
    hasAttachments: {type: String},
    attachmentCount: {type: String},
    attachents: {type: String},
    permalink: {type: String},
    priority: {type: String},
    superTaskIds: Object,
    subTaskIds: Object,
    dependencyIds: {type: String},
    metadata: Object,
    customFields: Object,
    visible_task_name: {type: String},
    Documentation: {type: String},
    roles: Object,
    email: {type: String},
    emailSubject: {type: String},
    emailBody: {type: String},
    isDeleted: { type: Boolean },
})
var tasks = module.exports = mongoose.model('task', tasksSchema);

module.exports.getalltasks = function(callback){
	var query = {isDeleted: {$ne : true}, project: {$exists: true}};
	tasks.find(query).populate({
        path: 'project',
        match: {isDeleted: {$ne: true}}     
    }).exec(callback);
}

module.exports.getTasksByProject = function($projectId, callback){
    var query = {project: $projectId};
    tasks.find(query, callback);
}

module.exports.gettaskbyId = function($taskID, callback){
	var query = {_id: $taskID};
	tasks.findOne(query, callback);
}

module.exports.gettaskbyTitle = function($taskTitle, callback){
    var query = {title: $taskTitle};
    tasks.findOne(query, callback);
}

module.exports.getTaskbyStatus = function($taskStatus, callback){
    var query = {status: $taskStatus};
    tasks.find(query, callback);
}

module.exports.gettaskbyParentId = function($taskID, callback){
    var query = {parentFolderIds: $taskID, project: {$exists: true}};
    tasks.find(query).populate({
        path: 'project'
    }).exec(callback);
}

module.exports.updateTask = function(query, newValues, callback){
    var query = query;
    tasks.updateOne(query, newValues, callback);
}

module.exports.deletetask = function($projectID, callback){
    var query = {_id: $projectID};
    var isDeleted = {isDeleted: true};
    tasks.updateOne(query, isDeleted, callback);
}
module.exports.restoreTask = function($projectID, callback){
    var query = {_id: $projectID};
    var isDeleted = {isDeleted: false};
    tasks.updateOne(query, isDeleted, callback);
}
module.exports.getArchivetask = function(callback){
    var query = {isDeleted: true};
    tasks.find(query, callback);
}
