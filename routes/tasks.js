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
var rolesModel = require('../models/roles');
var foldersModel = require('../models/folders');
var question_answer = require('../models/question_answers');
var tasks = require('../models/tasks');
var functions = require('../resources/functions.js');
var logs = require('../models/logs');
var AuthenteCheck = require('../routes/index');

require('dotenv').config();


router.get('/list', AuthenteCheck.ensureAuthenticated, function(req, res){
	var userDetails = req.user;
	 tasks.getalltasks(function(taskserr, tasksContents){ //Get/Fetch Tasks
	 	foldersModel.getfolders(function(folderserr, foldersContents){ //Get/Fetch folders
	 		userModel.getcontacts(function(contactserr, contactsContents){
	 		//userModel.getcontacts(getUserID,function(contactserr, contactsContents){ //Get/Fetch Contacts
	 			functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
	 				functions.folderDashboardContent(moment, (foldersContents), (tasksContents), (contactsContents)).then((folderDashboardData)=>{
	 					foldersModel.getprojects(function(folderserr, projectContents){ //Get/Fetch folders
	 					//functions.taskGanntChart(moment, (tasksContents),null, (contactsContents), (foldersContents)).then((tasksGanttChartContents)=>{
	 						res.render('theme/tasks', {
	 							layout: 'layout2',
	 							'tasks': JSON.stringify(tasksContents), 
	 							'folders': JSON.stringify(foldersContents),
	 							'projects': JSON.stringify(projectContents),
	 							'folderDashboardData': folderDashboardData, 
	 							'foldermenu':  foldersHeiraricalData,
	 							'contacts': contactsContents, 
	 							'userDetails': userDetails,
	 							'taskTab': true
	 						});
	 					//});
	 					});
	 				});
	 			});
			}); // End Fetching Contacts
		 }); // End Fetching folders
	  }); // End Fetching tasks
}); // End Tasks Function
router.get('/taskarchive', AuthenteCheck.ensureAuthenticated, function(req, res){
	var userDetails = req.user;
	 tasks.getArchivetask(function(taskserr, tasksContents){ 
	 	//console.log("========Line no 53",tasksContents)
	 	foldersModel.getfolders(function(folderserr, foldersContents){ //Get/Fetch folders
	 		userModel.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
	 			functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
	 				functions.folderDashboardContent(moment, (foldersContents), (tasksContents), (contactsContents)).then((folderDashboardData)=>{
	 					foldersModel.getprojects(function(folderserr, projectContents){ //Get/Fetch folders
	 					//functions.taskGanntChart(moment, (tasksContents),null, (contactsContents), (foldersContents)).then((tasksGanttChartContents)=>{
	 						res.render('theme/archive/taskarchive', {
	 							layout: 'layout2',
	 							'tasks': JSON.stringify(tasksContents), 
	 							'folders': JSON.stringify(foldersContents),
	 							'projects': JSON.stringify(projectContents),
	 							'folderDashboardData': folderDashboardData, 
	 							'foldermenu':  foldersHeiraricalData,
	 							'contacts': contactsContents, 
	 							'userDetails': userDetails,
	 							'archiveTab': true
	 						});
	 					//});
	 					});
	 				});
	 			});
			}); // End Fetching Contacts
		 }); // End Fetching folders
	  }); // End Fetching tasks
}); 
router.get('/task', AuthenteCheck.ensureAuthenticated, function(req, res){
	var taskID = req.query.id;

	var userDetails = req.user;
 	tasks.getalltasks(function(taskserr, tasksContents){ //Get/Fetch Tasks

	tasks.gettaskbyId(taskID, function(taskserr, taskdetails){ //Get/Fetch Tasks
		foldersModel.getfolderbyId(taskdetails.project, function(err, projectData){
		foldersModel.getfolderbyId(taskdetails.milestone, function(err, milestoneData){
		 foldersModel.getfolders(function(folderserr, foldersContents){ //Get/Fetch folders
	 		userModel.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
//console.log("==========Line No 1417=====",projectData._id)
              tasks.getTasksByProject(projectData._id, function(taskserr, tasksProjectContents){
	 			functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
	 				question_answer.getQuestionAnswers(taskID, function(err, QuestionAnswersData){ 
	 					rolesModel.getallroles(function(roleErr, rolesDetails){

	 						if(taskdetails){

	 							if(req.query.title){
	 								taskdetails.title = base64.decode(req.query.title);
	 							}
	 							if(req.query.description){
	 								taskdetails.description = base64.decode(req.query.description);
	 							}
	 							if(req.query.startDate){
	 								taskdetails.startDate = base64.decode(req.query.startDate);
	 							}
	 							if(req.query.endDate){
	 								taskdetails.endDate = base64.decode(req.query.endDate);
	 							}
	 							if(req.query.status){
	 								taskdetails.status = base64.decode(req.query.status);
	 							}

	 							taskStatusOptions = '<option value="">Select</option>\
	 							<option value="Active"';
	 							if(taskdetails.status=="Active"){
	 								taskStatusOptions += 'selected';
	 							}
	 							taskStatusOptions += '>In Progress</option>\
	 							<option value="Upcoming"';
	 							if(taskdetails.status=="Upcoming"){
	 								taskStatusOptions += 'selected';
	 							}
	 							taskStatusOptions += '>Upcoming</option>\
	 							<option value="Completed"';
	 							if(taskdetails.status=="Completed"){
	 								taskStatusOptions += 'selected';
	 							}
	 							taskStatusOptions += '>Completed</option>';



	 							var attachents = '';
	 							if(taskdetails['attachents'] != '' && taskdetails['attachents']){
	 								attachents = JSON.parse(taskdetails['attachents']);
	 							}



							//////console.log(taskdetails['attachents'], typeof(attachents), attachents.title)
							
							contactsDropdownHTML = '<option value="">Select</option>';
							for(var item in contactsContents){
								contactsDropdownHTML += '<option value="'+contactsContents[item]['id']+'"';
								if((taskdetails['authorIds']) && contactsContents[item]['id']){
									if(taskdetails['authorIds'].indexOf(contactsContents[item]['id']) != -1)
									{
										contactsDropdownHTML += " selected";
									}
								}
								contactsDropdownHTML += '>'+contactsContents[item]['firstname']+' '+contactsContents[item]['lastname']+'('+contactsContents[item]['title']+')</option>';
							}
							contactsDropdownHTML += '<option value="null">Add New Assignee</option>';

							dependenciesDropdownHtml = '<option value="">Select</option>';
							for(var item in tasksProjectContents){
								dependenciesDropdownHtml += '<option value="'+tasksProjectContents[item]['_id']+'"';
								/////for(var dependencyId in taskdetails['dependencyIds']){
									if(taskdetails['dependencyIds'] == (tasksProjectContents[item]['_id']))
									{
										dependenciesDropdownHtml += " selected";
									}
								//}								
								dependenciesDropdownHtml += '>'+tasksProjectContents[item]['title']+'</option>';
							}

							//console.log("Line 1493", taskdetails['email']);
							emailDropdownHtml = '<option value="">Select</option>';
							emailoption = ['yes', 'no'];
							for(var item in emailoption){
								emailDropdownHtml += '<option value="'+emailoption[item]+'"';
								/////for(var dependencyId in taskdetails['dependencyIds']){
									if(taskdetails['email'] == (emailoption[item]))
									{
										emailDropdownHtml += " selected";
									}
								//}								
								emailDropdownHtml += '>'+emailoption[item]+'</option>';
							}
						}


		
							//console.log(taskdetails);

							res.render('theme/taskdetails', {
								layout: 'layout2',
								'taskdetails':  taskdetails,
								'taskID': taskID,
								'contacts':  contactsContents,
								'contactsDropdownHTML': contactsDropdownHTML,
								'dependenciesDropdownHtml': dependenciesDropdownHtml,
								'taskStatusOptions': taskStatusOptions,
								'foldermenu':  foldersHeiraricalData,
								'userDetails': userDetails,
								'roles': rolesDetails ,
								'QuestionAnswersData': QuestionAnswersData,
								'attachents': attachents,
								'projectData': projectData,
								'milestoneData': milestoneData,
								'emailDropdownHtml':emailDropdownHtml,
								'emailOption': taskdetails['email'],
	 							'taskTab': true
							});
						});	
	 				});					
	 			});
	 			});
	 		  });
			}); // End Fetching Contacts
	    }); // End Fetching folders
	}); // End Fetching tasks
});
 });
})
router.post('/task/update', AuthenteCheck.ensureAuthenticated, function(req, res){
	if(typeof(dependencies) =="string"){
    var dependencyIds = req.body.dependencies
	}
else if(typeof(dependencies) =="object"){
var dependencyIds = req.body.dependencies[0]
}
else {
	var dependencyIds = null
}
userID = req.body.authorIds;
tasks.gettaskbyId(req.body.taskId, function(taskserr, taskdeta){
	tasks.gettaskbyId(dependencyIds, function(taskserr, taskdetails){
		userModel.getUserID(userID, function(contactserr, contactsContents){
		//console.log("==========Line No 1544",taskdetails['dates']['due'])
		var taskId = req.body.taskId;
		var userDetails = req.user;
		//var dependencyIds = req.body.dependencies;
		var taskentrydata = {
			title: req.body.title,
			description: req.body.description,
			roles: req.body.roles,
			status: req.body.status,
			authorIds: [contactsContents],
			dependencyIds: dependencyIds,
			attachents: req.body.attachement,
			visible_task_name: req.body.visible_task_name,
			Documentation: req.body.Documentation,
			email: req.body.email,
			emailSubject: req.body.emailSubject,
			emailBody: req.body.emailBody
		};
		if(req.body.startDate){
			$startDate =  moment(req.body.startDate,'MM/DD/YY').format('MM/DD/YY');
			$endDate = moment(req.body.due,'MM/DD/YY').format('MM/DD/YY');
				taskentrydata['dates'] = {
					'type': 'Planned',
					'start': $startDate,
					'due': $endDate
				}
			}

//console.log("======Line No 1549=====",req.body.ProjectName,req.body.TaskName)
var old_data_Str = "Title: "+taskdeta.title+"<br /> Discription:"+taskdeta.description+"<br />  Start Date: "+taskdeta.dates.start+"<br /> End Date:"+taskdeta.dates.due+"<br /> Status: "+taskdeta.status+"<br /> "
 var new_data_Str = "Title: "+req.body.title+"<br /> Discription:"+req.body.description+"<br />  Start Date: "+req.body.startDate+"<br /> End Date:"+req.body.due+"<br /> Status: "+req.body.status+"<br /> "
		var newLogs = new logs({
		    log_type: 'Task',
	        log_content: {
				'title': req.body.title,
				'description': req.body.description,
				'roles': req.body.roles,
				'status': req.body.status,
				'attachents': req.body.attachement,
				'status': req.body.status
				},
			action: 'Update',
			old_data: old_data_Str,
			new_data: new_data_Str,
			msg: "Task "+req.body.title+" ("+req.body.ProjectName+") ("+req.body.TaskName+") has been updated by user "+ userDetails.firstname+" "+userDetails.lastname+".",
	    	created_at: moment().format('MM/DD/YY'),
	        log_type_id: taskId,
	        log: req.body.title,
	        user_id: userDetails	      
	    });

	    logs.createLogs(newLogs, function(err, logs){
	    	if(err) throw err;
	      console.log(logs);
	    });
		tasks.findOneAndUpdate({_id: taskId}, taskentrydata, function(err, taskentrydata) {

			tasks.findOne({dependencyIds: taskId}, function(err, dependecydata) {
		  	////console.log('dependecydata',dependecydata);
		  	if(dependecydata != null){
		  		if(req.body.startDate){
		  			dependecydata['dates'] = {
		  				'type': 'Planned',
		  				'start': req.body.due,
		  				'due': dependecydata['dates']['due']
		  			}
		  			tasks.findOneAndUpdate({_id: dependecydata['_id']}, dependecydata, function(err, dependencyUpdatesdata) {
						////console.log("Task Updated");
						res.redirect('/tasks/task/?id='+taskId);
					});
		  		}else{
					////console.log("Task Updated");
					res.redirect('/tasks/task/?id='+taskId);
				}
			}else{
					////console.log("Task Updated");
					res.redirect('/tasks/task/?id='+taskId);
				}

			});
          });
	});
		});
	});
});

router.get('/delete', AuthenteCheck.ensureAuthenticated, function(req, res){
	var taskID = req.query.id;
	var userDetails = req.user;
	tasks.gettaskbyId(taskID, function(taskserr, taskdeta){
	var newLogs = new logs({
		    log_type: 'Task',
	        log_content: taskdeta.title,
				
			action: 'Delete',
			
			old_data: '',
			new_data: "Task "+taskdeta.title+" ("+taskdeta.description+") has been Delete by user "+ userDetails.firstname+" "+userDetails.lastname+".",
	    	created_at: moment().format('MM/DD/YY'),
	        log_type_id: taskID,
	        log: taskdeta.title,
	        user_id: userDetails	      
	    });

	    logs.createLogs(newLogs, function(err, logs){
	    	if(err) throw err;
	      console.log(logs);
	    });
	});
	tasks.deletetask(taskID, function(taskserr, taskdetails){ //Get/Fetch Tasks
		//question_answers.handlebars
		res.redirect('/');
	}); // End Fetching tasks

});




router.get('/task/answer', function(req, res){
	var questionID = req.query.id
	var username = req.query.user;
	var taskId = req.query.taskId;
	////console.log(username);
	var userDetails = req.user
	 	foldersModel.getfolders(function(folderserr, foldersContents){ //Get/Fetch folders
		 		userModel.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
		 			functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
						question_answer.getQuestionbyId(questionID, function(questionserr, questiondetails){ //Get/Fetch Tasks
							//console.log(questiondetails);
							res.render('theme/question_answers', {
								layout: 'layout2',
								'taskId': taskId,
								'questionID': questionID,
								'questiondetails': questiondetails,
								'contacts':  contactsContents,
								'foldermenu':  foldersHeiraricalData,
								'userDetails': userDetails,
	 							'taskTab': true
							});
							//res.send('success');
							//res.redirect('/');
						}); // End Fetching tasks
					}); // End Fetching Contacts
		    }); // End Fetching folders
		}); // End Fetching tasks
	 });


router.post('/task/createquestions', AuthenteCheck.ensureAuthenticated,  function(req, res){
	//console.log(req.body);
	var newQuestionAnswer = new question_answer({
		user: req.user,
		taskid: req.body.taskId,
		question: req.body.question,
		answer: req.body.answer
	});
	newQuestionAnswer.save(function(err, data) {
       //console.log('Task Question saved', data);
       answerLink = hostUrl+'/task/answer/?id='+data._id+'&taskId='+req.body.taskId;
       taskLink = hostUrl+'/task/?id='+req.body.taskId;
       answerLink = hostUrl+'/users/emailRedirect?username=user1&url='+answerLink;
       taskLink = hostUrl+'/users/emailRedirect?username=user1&url='+taskLink;
       if(req.body.answer==''){
		//send Mail if answer is empty
		mail_settings.get_mail_settings(function(err, mailSettingsData){

			var from_email = mailSettingsData.from_email;
			res.render('theme/email/questionAnswers', {
				layout: 'layout2',
				'question': req.body.question, 
				'answerLink': answerLink,
				'taskLink': taskLink
			},  function(err, list){
											  //////console.log(list);							
											  const sgMail = require('@sendgrid/mail');
											  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
											  const msg = {
										        //to: userDetails.email,
										        to: 'aswing@accesselevate.com',
										        //to: 'dinesh829269@gmail.com',
										        //from: 'info@elyvt.com',
										        from: from_email,
										        //cc: 'alexandra.volkova2017@gmail.com',
										        //cc: 'dinesh829269@gmail.com',
										        subject: 'Elevate: Question- 1 Main Street',
										        text: 'Elevate: Answer the Questions.\n',
										        html: list
										    };
										    emailResponse = sgMail.send(msg); 
										    res.redirect('/task/?id='+req.body.taskId);
										});
		});
	}else{
		res.redirect('tasks/task/?id='+req.body.taskId);
	}
});
});


router.post('/task/updatequestions',  function(req, res){
	var questionId = req.body.questionID;
	var taskId = req.body.taskId;
	var newQuestionAnswerData = {
		question: req.body.question,
		answer: req.body.answer
	};
	question_answer.findOneAndUpdate({_id: questionId}, newQuestionAnswerData, function(err, questionentrydata) {
	  //console.log("Question Updated");
	  req.flash('success_msg', 'Question has been Answered Successfully.');
	  res.redirect('tasks/task/?id='+taskId);
	})
});

router.get('/restore', AuthenteCheck.ensureAuthenticated, function(req, res){
	var taskID = req.query.id;
	var userDetails = req.user;
	tasks.restoreTask(taskID, function(projecterr, taskdetails){ //Get/Fetch Tasks
		res.redirect('/tasks/taskarchive');
	}); // End Fetching contact

});



router.get('/create',  AuthenteCheck.ensureAuthenticated, function(req, res){
	var userDetails = req.user
	console.log("==============line no 1667============",userDetails);
	foldersModel.getfolders(function(err, foldersData){
		tasks.getalltasks(function(taskserr, tasksContents){ //Get/Fetch Tasks
 			userModel.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
 				rolesModel.getallroles(function(roleErr, rolesDetails){
					if(err) throw err;
					////console.log(foldersData['foldersdata']['data']);
					var foldersContents = foldersData			
					//var userDetails = req.user
				 	functions.foldersHeierarcy(foldersContents).then((foldersHeiraricalData)=>{
				 		var jstreeContent = JSON.stringify(foldersHeiraricalData).replace(/onclick/g, "data-click")
				 		contactsDropdownHTML = '<option value="">Select</option>';
							for(var item in contactsContents){
								contactsDropdownHTML += '<option value="'+contactsContents[item]['id']+'"';
								contactsDropdownHTML += '>'+contactsContents[item]['firstname']+' '+contactsContents[item]['lastname']+'('+contactsContents[item]['title']+')</option>';
							}
                           
							dependenciesDropdownHtml = '<option value="">Select</option>';
							for(var item in tasksContents){
								dependenciesDropdownHtml += '<option value="'+tasksContents[item]['_id']+'"';
								dependenciesDropdownHtml += '>'+tasksContents[item]['title']+'</option>';
							}

				 		res.render('theme/tasks/create', {
									layout: 'layout2',
									'roles': rolesDetails ,
									'contactsDropdownHTML': contactsDropdownHTML,
									'dependenciesDropdownHtml': dependenciesDropdownHtml,
									'foldermenu':  foldersHeiraricalData,
									'jstreeContent': jstreeContent,
									'userDetails': userDetails
								});
					});	
				});				
			});
		});
	});
});



module.exports = router;