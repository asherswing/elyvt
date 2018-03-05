
var request = require('request');

module.exports = {


	getData: function($token){
		return new Promise(function (resolve, reject) {
				
			var tasksData = module.exports.getTasks($token)
			var foldersData = module.exports.getFolders($token)
			var workflowsData = module.exports.getWorkflows($token)
			var AccountsData = module.exports.getAccount($token)
			var ContactsData = module.exports.getContacts($token)
			var GroupData = module.exports.getgroups($token)
			var InvitationsData = module.exports.getinvitations($token)
			var CustomfieldsData = module.exports.getcustomfields($token)
			var InvitationsData = module.exports.getinvitations($token)

			tasksData.then(function(tasks){
				foldersData.then(function(folders){
					workflowsData.then(function(workflows){
						AccountsData.then(function(accounts){
							ContactsData.then(function(contacts){
								GroupData.then(function(groups){
									InvitationsData.then(function(invitations){
										CustomfieldsData.then(function(customfields){
											$mydata = {
												'tasks': tasks,
												'folders': folders,
												'workflows': workflows,
												'accounts': accounts,
												'contacts': contacts,
												'groups': groups,
												'invitations':invitations
											}
											resolve($mydata)
										})
										
									})
									
								})								
							})
						})
					})
				})
			})

		})
		
	},

	getAccount: function($token){
		url= 'https://www.wrike.com/api/v3/accounts';
		
		return new Promise(function (resolve, reject) {
			request.get({
				url  :url, 
				headers: {
				    'Authorization': 'Bearer '+ $token["access_token"]
				  }
			}, function (error, response, body) {
				//console.log(body)
				resolve(body)
			});
		})
	},

	getContacts: function($token){
		url= 'https://www.wrike.com/api/v3/accounts/IEABRGBF/contacts';
		
		return new Promise(function (resolve, reject) {
			request.get({
				url  :url, 
				headers: {
				    'Authorization': 'Bearer '+ $token["access_token"]
				  }
			}, function (error, response, body) {
				//console.log(body)
				resolve(body)
			});
		})
	},

	getgroups: function($token){
		url= 'https://www.wrike.com/api/v3/accounts/IEABRGBF/groups';
		
		return new Promise(function (resolve, reject) {
			request.get({
				url  :url, 
				headers: {
				    'Authorization': 'Bearer '+ $token["access_token"]
				  }
			}, function (error, response, body) {
				//console.log(body)
				resolve(body)
			});
		})
	},

	getinvitations: function($token){
		url= 'https://www.wrike.com/api/v3/accounts/{accountId}/invitations';
		return new Promise(function (resolve, reject) {
			request.get({
				url  :url, 
				headers: {
				    'Authorization': 'Bearer '+ $token["access_token"]
				  }
			}, function (error, response, body) {
				//console.log(body)
				resolve(body)
			});
		});
	},

	getcustomfields: function($token){
		url= 'https://www.wrike.com/api/v3/accounts/getcustomfields';
		return new Promise(function (resolve, reject) {
			request.get({
				url  :url, 
				headers: {
				    'Authorization': 'Bearer '+ $token["access_token"]
				  }
			}, function (error, response, body) {
				console.log(body)
				resolve(body)
			});
		});
	}, 

	getTasks: function($token){
		url= 'https://www.wrike.com/api/v3/accounts/IEABRGBF/tasks?fields=["sharedIds","dependencyIds","briefDescription","parentIds","superParentIds","subTaskIds","responsibleIds","description","recurrent","authorIds","attachmentCount","hasAttachments","customFields","superTaskIds","metadata"]';
		
		return new Promise(function (resolve, reject) {
			request.get({
				url  :url, 
				headers: {
				    'Authorization': 'Bearer '+ $token["access_token"]
				  }
			}, function (error, response, body) {
				resolve(body)
			});
		})
	},


	getFolders: function($token){
		url= 'https://www.wrike.com/api/v3/accounts/IEABRGBF/folders';
		
		return new Promise(function (resolve, reject) {
			request.get({
				url  :url, 
				headers: {
				    'Authorization': 'Bearer '+ $token["access_token"]
				  }
			}, function (error, response, body) {
				resolve(body)
			});
		})
		
	},


	getWorkflows: function($token){
		url= 'https://www.wrike.com/api/v3/accounts/IEABRGBF/workflows';
		return new Promise(function (resolve, reject) {
			request.get({
				url  :url, 
				headers: {
				    'Authorization': 'Bearer '+ $token["access_token"]
				  }
			}, function (error, response, body) {
				resolve(body)
			});
		})
		
	}


}