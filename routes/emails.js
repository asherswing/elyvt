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
var foldersModel = require('../models/folders');
var tasks = require('../models/tasks');
var functions = require('../resources/functions.js');

require('dotenv').config();

/**
* Email Dashboard
*/
router.get('/dashboard', function(req, res){

	mail_settings.get_mail_settings(function(err, mailSettingsData){

		var from_email = mailSettingsData.from_email;

 	foldersModel.getfolders(function(folderserr, foldersContents){ //Get/Fetch folders
 		userModel.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
 			functions.getProjects(moment, (foldersContents), (contactsContents)).then((projectsData)=>{
 				$projectsDataloop = 0;
 				async.forEachSeries(projectsData['foldersArr'], function(value, callback){
 					$projectsDataloop++;
 					var item = projectsData['foldersArr'].indexOf(value);
 					projectId  = value['_id'];
 					tasksContents = [];
 					tasksContentData = [];
 					MilestonesTableContent = [];
			 		tasks.getTasksByProject(projectId, function(taskserr, tasksContents){ //Get/Fetch Tasks
			 			functions.tasksEmailContent(moment, foldersContents, tasksContents, contactsContents).then((tasksContentData)=>{
					 	    ////console.log("====", projectsData['foldersArr'][item]['_id'], tasksContents);					 	
					 	    functions.buildMilestonesEmailTable(moment, (foldersContents), (tasksContents), (contactsContents), value['_id']).then((MilestonesTableContent)=>{
					 	    	console.log("============line no 42=======",value['project']['endDate']);

					 	    	var dueDate = moment(value['project']['endDate'],'MM/DD/YYYY');
					 	    	var daysLeft = dueDate.diff(moment(), 'days');
					 	    	var launchDate = dueDate.format('MM/DD/YYYY');
					 	    	if (daysLeft<0){
					 	    		daysLeftText = "overdue "+daysLeft+" days"
					 	    	}else{
					 	    		daysLeftText = daysLeft
					 	    	}
					 	    	if(value['projectManager']){
					 	    		console.log("Line 1010, ", value['projectManager']);
					 	    		if(typeof value['projectManager']['firstname'] !== "undefined"){
					 	    			var projectManager = value['projectManager']['firstname']+' '+value['projectManager']['lastname'];
					 	    			var projectManagerEmail = value['projectManager']['email'];
					 	    		}else if(value['projectManager']['name']){
					 	    			var projectManager = value['projectManager']['name'];
					 	    			var projectManagerEmail = value['projectManager']['email'];
					 	    		}else{
					 	    			var projectManager = 'Asher Swing';
					 	    			var projectManagerEmail = 'aswing@accesselevate.com';
					 	    		}

					 	    	}else{
					 	    		var projectManager = 'Asher Swing';
					 	    		var projectManagerEmail = 'aswing@accesselevate.com';
					 	    	}
					 	    	//console.log("projectManagerEmail", projectManagerEmail);
					 	    	res.render('theme/email/dashboard', {
					 	    		layout: 'layout2',
					 	    		'tasks': tasksContentData, 
					 	    		'MilestonesTableContent': MilestonesTableContent,
					 	    		'project': value['title'],
					 	    		'daysLeft': daysLeft,
					 	    		'launchDate': launchDate,
					 	    		'projectManager': projectManager,
					 	    		'projectManagerEmail': projectManagerEmail,
					 	    		'site_url': process.env.SITE_URL

					 	    	},  
					 	    	function(err, list){
												console.log(projectManagerEmail, );							
												const sgMail = require('@sendgrid/mail');
												sgMail.setApiKey(process.env.SENDGRID_API_KEY);
											      console.log(process.env.DEFAULT_EMAIL);
											      const msg = {
											        to: process.env.DEFAULT_EMAIL,
											        from: projectManagerEmail,
											        subject: 'Elevate Weekly Dashboard: '+ projectsData['foldersArr'][item]['title']+' , '+moment().format('MM/DD/YY'),
											        text: 'Elevate Weekly Dashboard: '+ projectsData['foldersArr'][item]['title']+' , '+moment().format('MM/DD/YY')+'.\n',
											        html: list
											    };
											    emailResponse = sgMail.send(msg); 
											    console.log($projectsDataloop, projectsData['foldersArr'].length, emailResponse)
											    if($projectsDataloop == projectsData['foldersArr'].length){
											    	res.send('list')
											    }
											    callback()											      
											});
					 	    });
					 	});

			 		});						 	
			 	});



 			});
 		});
});
});
});


/**
* Email Task Reminder
*/
router.get('/task-reminder', function(req, res){
	mail_settings.get_mail_settings(function(err, mailSettingsData){
		var from_email = mailSettingsData.from_email;
	 tasks.getalltasks(function(taskserr, tasksContents){ //Get/Fetch Tasks
	 	foldersModel.getfolders(function(folderserr, foldersContents){ //Get/Fetch folders
	 		userModel.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
	 			functions.tasksEmailContent(moment, foldersContents, tasksContents, contactsContents).then((tasksContentData)=>{
	 				functions.getProjects(moment, (foldersContents), (contactsContents)).then((projectsData)=>{

	 					for(var item in projectsData['foldersArr']){
	 						async.forEachSeries(tasksContents, function(value, callback){	
						 		//functions.taskReminderEmailTable(moment, tasksContents, (contactsContents['contactdata'])).then((taskReminderTableContent)=>{
						 			var dueDate = moment(value['dates']['due'],'MM/DD/YY');
						 			var daysLeft = dueDate.diff(moment(), 'days');
						 			var launchDate = dueDate.format('MM/DD/YY');
						 			if((daysLeft>0) && (daysLeft<7)){
						 				if(typeof value['emailSubject'] != "undefined"){
							 				console.log("====", daysLeft);					 	
							 				if(projectsData['foldersArr'][item]['projectManager']){
									 				var projectManager = projectsData['foldersArr'][item]['projectManager']['firstname']+' '+projectsData['foldersArr'][item]['projectManager']['lastname'];
									 				var projectManagerEmail = 'aswing@accesselevate.com';
									 			}else{
									 				var projectManager = 'Asher Swing';
									 	    		var projectManagerEmail = 'aswing@accesselevate.com';
									 			}
						    					////console.log("projectManagerEmail", projectManagerEmail);
						    					res.render('theme/email/task_reminder', {
						    						layout: 'layout2',
						    						'tasks': tasksContentData, 
						    						'tasksvalue': value,
						    						//'taskReminderTableContent': taskReminderTableContent,
						    						'project': projectsData['foldersArr'][item]['title'],
						    						'daysLeft': daysLeft,
						    						'launchDate': launchDate,
						    						'projectManager': projectManager,
						    						'projectManagerEmail': projectManagerEmail
						    					},  
						    				 function(err, list){
														//////console.log(list);							
														const sgMail = require('@sendgrid/mail');
														sgMail.setApiKey(process.env.SENDGRID_API_KEY);
													      ////console.log(process.env.SENDGRID_API_KEY);
													      const msg = {
													        to: process.env.DEFAULT_EMAIL,
													        from: projectManagerEmail,
													        subject: 'Elevate Task Reminder: '+ value['emailSubject']+', '+moment().format('MM/DD/YY'),
													        text: 'Elevate Task Reminder: '+ value['emailSubject']+' , '+moment().format('MM/DD/YY')+'.\n',
													        html: list
													    };
													    emailResponse = sgMail.send(msg); 
													      console.log(emailResponse)	

												  });
											}
										}
								//});
callback();
		    				});						 	
					 	}
					 	res.send('list')
					 });

	 			});
	 		});
	 	});
	 });
	});
});

router.get('/settings', function(req, res){
   
	var userDetails = req.user;
	foldersModel.getfolders(function(folderserr, foldersContents){
		userModel.getAllUsers(function(contactserr, userdata){
			functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
				functions.getemailcontacts(userdata).then((contactsHTML)=>{
					mail_settings.get_mail_settings(function(err, mailSettingsData){
	 			console.log(mailSettingsData);

	 			var day_of_week_arr = {
	 				"0": "Sunday",
	 				"1": "Monday",
	 				"2": "Tuesday",
	 				"3": "Wednesday",
	 				"4": "Thursday",
	 				"5": "Friday",
	 				"6": "Saturday" 				 				
	 			};
	 			var day_of_week_dropdown = '';
	 			for(var index in day_of_week_arr){
	 				day_of_week_dropdown += '<option value="1" ';
	 				if(mailSettingsData.day_of_week){
	 					if(mailSettingsData.day_of_week==index){ day_of_week_dropdown += "selected"}
	 				}
	 			day_of_week_dropdown += '>'+day_of_week_arr[index]+'</option>';
	 		}

	 		var hour_of_day_dropdown = '';
	 		for($i=0; $i<=24;$i++){
	 			hour_of_day_dropdown += '<option value="1" ';
	 			if(mailSettingsData.hour_of_day){
	 				if(mailSettingsData.hour_of_day==$i){ hour_of_day_dropdown += "selected"}
	 			}
	 		hour_of_day_dropdown += '>'+$i+'</option>';
	 	}
					//console.log("=======Line No 32=========",userdata)
					res.render('theme/emailcontactlist', {
						layout: 'layout2',
						'mailSettingsData': mailSettingsData,
						'contactsHTML': contactsHTML,
						'foldermenu':  foldersHeiraricalData,
						'userDetails': userDetails,
						'day_of_week_dropdown': day_of_week_dropdown,
	 		            'hour_of_day_dropdown': hour_of_day_dropdown
					});
				});
			});
		}); // End Fetching Contacts
	}); // End Fetching folders
});

});
router.post('/settings',  function(req, res){
	var from_email = req.body.from_email;
	var day_of_week = req.body.day_of_week;
	var hour_of_day = req.body.hour_of_day;
	var minute_of_hour = req.body.minute_of_hour;

	var mailSettings = new mail_settings({
		from_email: from_email,
		day_of_week:day_of_week,
		hour_of_day: hour_of_day,
		minute_of_hour: minute_of_hour
	});


	mailSettings.save(function(err) {
	       ////console.log('mail settings saved')
	   });

	req.flash('success_msg', 'Settings Successfully Saved');

	res.redirect('/email/settings');
});

module.exports = router;
