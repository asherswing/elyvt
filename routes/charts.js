var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt-nodejs');
var async = require('async');
var crypto = require('crypto');
var base64 = require('base-64');
var moment = require('moment');

var mail_settings = require('../models/mail_settings');
var userModel = require('../models/user');
var roles = require('../models/roles');
var foldersModel = require('../models/folders');
var tasksModel = require('../models/tasks');
var functions = require('../resources/functions.js');
var logs = require('../models/logs');
var AuthenteCheck = require('../routes/index');

var fs = require('fs');

require('dotenv').config();


/**
* Function Gantt-chart
* Return Void
*/
router.get('/gantt',  AuthenteCheck.ensureAuthenticated, function(req, res){

	var projectId = req.query.id;
	var userDetails = req.user;
	//console.log("projectId", projectId);
	//console.log("projectId", projectId);
	if(projectId == null || projectId == "undefined"){

		foldersModel.getfolders(function(folderserr, foldersContents){ //Get/Fetch folders
	 		foldersModel.getprojects(function(projectserr, projectContents){ //Get/Fetch folders
	 			var projectDropdown = '';
	 			projectDropdown += "<option value=\"null\">Select Project</option>";
	 			for(var item in projectContents){
	 				projectDropdown += '<option value="'+projectContents[item]['_id']+'"';
	 				if(projectId == projectContents[item]['_id']){
	 					projectDropdown += 'selected'
	 				}
	 				projectDropdown += '>'+projectContents[item]['title']+'</option>';
	 			}
	 			userModel.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
	 				functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{

				 	    	////console.log("tasksGanttChartContents Line 294", tasksGanttChartContents);
				 	    	res.render('theme/graphs/gantt_chart', {
				 	    		layout: 'layout2',
				 	    		'folders': foldersContents,
				 	    		'foldermenu':  foldersHeiraricalData,
				 	    		'contacts': contactsContents, 
				 	    		'userDetails': userDetails,
				 	    		'projectDropdown': projectDropdown,
				 	    		'projectId': projectId,
				 	    		'isProject': false,
				 	    		'ganttTab': true
				 	    	});
				 	   
	 				});
				 }); // End Fetching Contacts
				}); // End Fetching Folders
	 	}); // End Fetching folders


	}else{

	 tasksModel.getalltasks(function(taskserr, tasksContents){ //Get/Fetch Tasks
	 	foldersModel.getfolders(function(folderserr, foldersContents){ //Get/Fetch folders
	 		foldersModel.getprojects(function(projectserr, projectContents){ //Get/Fetch folders
	 			var projectDropdown = '';
	 			projectDropdown += "<option value=\"null\">Select Project</option>";
	 			for(var item in projectContents){
	 				projectDropdown += '<option value="'+projectContents[item]['_id']+'"';
	 				if(projectId == projectContents[item]['_id']){
	 					projectDropdown += 'selected'
	 				}
	 				projectDropdown += '>'+projectContents[item]['title']+'</option>';
	 			}
	 			userModel.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
	 				functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{

	 					functions.taskGanntChart(moment, (tasksContents), req.query.id, (contactsContents), (foldersContents)).then((tasksGanttChartContents)=>{

				 	    	////console.log("tasksGanttChartContents Line 294", tasksGanttChartContents);
				 	    	res.render('theme/graphs/gantt_chart', {
				 	    		layout: 'layout2',
				 	    		'tasks': tasksContents, 
				 	    		'tasksGanttChartContents': JSON.stringify(tasksGanttChartContents),
				 	    		'folders': foldersContents,
				 	    		'foldermenu':  foldersHeiraricalData,
				 	    		'contacts': contactsContents, 
				 	    		'userDetails': userDetails,
				 	    		'projectDropdown': projectDropdown,
				 	    		'projectId': projectId,
				 	    		'isProject': true,
				 	    		'ganttTab': true
				 	    	});
				 	    });
	 				});
				 }); // End Fetching Contacts
				}); // End Fetching Folders
	 	}); // End Fetching folders
 	 }); // End Fetching tasks
	}

}); // End Function Gantt-Chart


router.get('/charts', AuthenteCheck.ensureAuthenticated, function(req, res) {
	var userDetails = req.user;

	 userModel.getAllUsers(function(userserr, users) {
	 	console.log("=========line No 115",users);
	 	tasksModel.getalltasks(function(taskserr, tasksContents){ //Get/Fetch Tasks
			foldersModel.getfolders(function(folderserr, foldersContents){ //Get/Fetch folders
				foldersModel.getprojects(function(projectserr, projectsContents){ //Get/Fetch folders
					userModel.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
						functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
							functions.folderDashboardContent(moment, (foldersContents), (tasksContents), (contactsContents['contactdata'])).then((folderDashboardData)=>{
								//functions.taskGanntChart(moment, (tasksContents),null, (contactsContents['contactdata']), (foldersContents)).then((tasksGanttChartContents)=>{
									res.render('theme/graphs/charts', {
										layout: 'layout3',
										'roles': JSON.stringify(functions.buildUserRoleData(users)),
										'users': JSON.stringify(users),
										'tasks': JSON.stringify(tasksContents), 
										'folders': JSON.stringify(foldersContents),
										'folderDashboardData': folderDashboardData, 
										'foldermenu':  foldersHeiraricalData,
										'contacts': contactsContents['contactdata'],
										'projects': JSON.stringify(projectsContents),
										'userDetails': userDetails,
										'graphTab': true
									//});
								});
							});
						});
					}); // End Fetching Contacts
				});
			}); // End Fetching folders
		});
	 })
});

router.get('/data/json/users.json', function(req, res) {
	var usersData = fs.readFileSync("data/json/users.json");
	res.send(usersData);
});


router.get('/data/json/tasks.json', function(req, res) {
	var tasksData = fs.readFileSync("data/json/tasks.json");
	res.send(tasksData);
});


module.exports = router;