var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt-nodejs');
var async = require('async');
var crypto = require('crypto');
var fs = require('fs');
var moment = require('moment');
var bodyParser = require('body-parser');

var folders = require('../models/folders');
var tasks = require('../models/tasks');
var contacts = require('../models/contacts');
var question_answer = require('../models/question_answers');
var functions = require('../resources/functions.js')

var AuthenteCheck = require('../routes/index');
var roles = require('../models/roles');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Get Dolders Content
router.get('/', AuthenteCheck.ensureAuthenticated,  function(req, res){
	// folders.getfolders(function(err, foldersData){
	// 	if(err) throw err;
	// 	console.log(foldersData)
	// });
	
	var folderId = req.query.id
	folders.getfolders(function(err, foldersData){
		tasks.getalltasks(function(taskserr, tasksContents){ //Get/Fetch Tasks
 			contacts.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
					if(err) throw err;
					//console.log(foldersData['foldersdata']['data']);
					var foldersContents = foldersData			
					//var foldersContents = fs.readFileSync("data/folders.json");
				 	//var tasksContents = fs.readFileSync("data/tasks.json");
				 	//var contactsContents = fs.readFileSync("data/contacts.json");
				 	var userDetails = req.user
				 	functions.foldersHeierarcy(foldersContents, folderId).then((foldersHeiraricalData)=>{
						functions.foldersDetails(moment, tasksContents, foldersContents, contactsContents, folderId).then((folderDetailsData)=>{
							functions.taskGanntChart(moment, tasksContents, folderId, contactsContents, foldersContents).then((tasksGanttChartContents)=>{
								//console.log(folderDetailsData);
								res.render('theme/folderdetails', {
									layout: 'layout2',
									'folderId': folderId,
									'tasksGanttChartContents': JSON.stringify(tasksGanttChartContents),
									//'QuestionAnswersData':QuestionAnswersData,
									'folderDetails':  folderDetailsData,
									'foldermenu':  foldersHeiraricalData,
									'userDetails': userDetails
								});
							});
						})
					});
				
				//console.log(foldersData)
			});
		});
	});
});


router.post('/', AuthenteCheck.ensureAuthenticated,  function(req, res){
	console.log(req.body);
	var newQuestionAnswer = new question_answer({
		user: req.user,
		folderid: req.body.folderId,
		question: req.body.question,
		answer: req.body.answer
	});
	newQuestionAnswer.save(function(err) {
       console.log('folder saved')
    });
	res.redirect('/folders/');

});


router.get('/new-project', AuthenteCheck.ensureAuthenticated,  function(req, res){	
	folders.getfolders(function(err, foldersData){
		tasks.getalltasks(function(taskserr, tasksContents){ //Get/Fetch Tasks
 			contacts.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
				if(err) throw err;
				//console.log(foldersData['foldersdata']['data']);
				var foldersContents = foldersData			
				var userDetails = req.user
			 	functions.foldersHeierarcy(foldersContents).then((foldersHeiraricalData)=>{
					res.render('theme/new_project', {
								layout: 'layout2',
								'foldermenu':  foldersHeiraricalData,
								'userDetails': userDetails
							});
				});				
			});
		});
	});

});

router.post('/new-project', AuthenteCheck.ensureAuthenticated,  function(req, res){	
	//console.log(req.body);
	projectStructure = {
						  'features': [
						    'Communication',
						    'Conceirge',
						    'Events',
						    'Facility Booking',
						    'F&B',
						    'Security',
						    'UI Config'
						  ],
						  'discovery': [{
						    'Communication Environment Assessment': [
						      'Landlord',
						      'Tenant'
						    ],
						    'Concierge Environment Assessment': [
						      'Landlord Concierge Needs',
						      'Tenant Concierge Needs'
						    ],
						    'Events Environment Assessment': [
						      'Landlord Event Needs',
						      'Tenant Event Needs'
						    ],
						    'Facilities Booking Environment Assessment': [
						      ' Landlord ID Booking System',
						      'Tenant ID Booking System'
						    ],
						    'F&B Environment Assessment': [
						      'Landlord F&B Workflow Structure/Walkthrough',
						      'Landlord ID POS/Inventory Management System(s) (IMS)',
						      'Landlord ID POS/Inventory Management System(s) (IMS)',
						      'Tenant F&B Workflow Structure/Walkthrough',
						      'Tenant ID POS/Inventory Management System(s) (IMS)'
						    ],
						    'IT Environment Assessment': [
						      'Landlord ID Corp ISP & WiFi Environments',
						      'Landlord ID POS/Inventory Management System(s) (IMS)',
						      'Landlord ID Mobile Carrier & Device(s)',
						      'Onsite Testing (?)',
						      'Tenant: ID Corp Eml Environment',
						      'Tenant: ID Corp ISP & WiFi Environments'
						    ],
						    'Security Environment Assessment': [
						      'Tenant: ID Mobile Carrier & Devices',
						      'Landlord ID ACS System',
						      'Landlord ID VMS System',
						      'Tenant: ID ACS System'
						    ],
						    'UI Custom Config': [
						      'Tenant ID VMS System',
						      'Request: BB Bldg Imagery'
						    ]
						  }],
						  'Alpha': [
						    'Alpha Setup',
						    'Alpha Testing',
						    'Alpha Update to Beta'
						  ],
						  'Beta': [
						    'Beta Setup',
						    'Beta Testing',
						    'Beta Update to Beta'
						  ],
						  'Release': ''
						}

	// var newfolder = new folders({
	// 	user: req.user,
	// 	title: req.body.project_name,
	// 	scope: 'WsRoot',
		// project: {
  //       "authorId": req.user._id,
  //       "ownerIds": [
  //         req.user._id
  //       ],
  //       "status": "Green",
  //       "createdDate": moment.now()
  //     }
	// });
	// newfolder.save(function(err, data) {
      // console.log('folder Created', newfolder, data._id)
       // module.exports.createChildFolder(req, projectStructure, String(data._id)).then(data => {
       // 	console.log("Line 189");
       // 	$folderId = String(data._id);
       // 	var childIds= []
       // 	folders.getfolderbyParentId($folderId, function(data2){
       // 		console.log("Line 192", $folderId)
       // 		for(var index in data2){
       // 			console.log("Line 195", data2);
       // 			childIds.push(data2[index]._id)
       // 		}
       // 		console.log("Line 198", childIds);
       // 	});
       // });

       var title = 'Communication';
	   var childIds = []
       module.exports.savethisFolder(req, title, childIds).then(dataF1_1=>{       	 
	       var title = 'Conceirge';
		   var childIds = []
		   module.exports.savethisFolder(req, title, childIds).then(dataF2_1=>{    
		   	var title = 'Events';
		    var childIds = []
		    module.exports.savethisFolder(req, title, childIds).then(dataF3_1=>{
		    	var title = 'Facility Booking';
		   		var childIds = []
		   		module.exports.savethisFolder(req, title, childIds).then(dataF4_1=>{
		   			var title = 'F&B';
		   			var childIds = []
		   			module.exports.savethisFolder(req, title, childIds).then(dataF5_1=>{
		   				var title = 'Security';
		   				var childIds = []
		   				module.exports.savethisFolder(req, title, childIds).then(dataF6_1=>{
		   					var title = 'UI Config';
		   					var childIds = []	 
		   					module.exports.savethisFolder(req, title, childIds).then(dataF7_1=>{
		   					var title = 'Feature';
		   					var childIds = [String(dataF1_1._id),String(dataF2_1._id),String(dataF3_1._id),String(dataF4_1._id),String(dataF5_1._id),String(dataF6_1._id),String(dataF7_1._id)]	 
		   					module.exports.savethisFolder(req, title, childIds).then(dataF7=>{


      	var title = 'Landlord';
		var childIds = []
       module.exports.savethisFolder(req, title, childIds).then(data1_1=>{
       	title = 'Tenant';
		childIds = []
       	module.exports.savethisFolder(req, title, childIds).then(data1_2=>{
       		title = 'Communication Environment Assessment'
       		childIds = [String(data1_1._id), String(data1_2._id)]
       		
       		module.exports.savethisFolder(req, title, childIds).then(data1=>{

       			title = 'Landlord Concierge Needs';
				childIds = []
       			module.exports.savethisFolder(req, title, childIds).then(data2_1=>{
		       	title = 'Tenant Concierge Needs';
				childIds = []
		       	module.exports.savethisFolder(req, title, childIds).then(data2_2=>{
		       		title = 'Concierge Environment Assessment'
		       		childIds = [String(data2_1._id), String(data2_2._id)]
		       		
		       		module.exports.savethisFolder(req, title, childIds).then(data2=>{

		       			title = 'Landlord Event Needs';
						childIds = []
		       			module.exports.savethisFolder(req, title, childIds).then(data3_1=>{
				       	title = 'Tenant Event Needs';
						childIds = []
				       	module.exports.savethisFolder(req, title, childIds).then(data3_2=>{
				       		title = 'Events Environment Assessment'
				       		childIds = [String(data3_1._id), String(data3_2._id)]
				       		
				       		module.exports.savethisFolder(req, title, childIds).then(data3=>{


				       			title = 'Landlord ID Booking System';
								childIds = []
				       			module.exports.savethisFolder(req, title, childIds).then(data4_1=>{
						       	title = 'Tenant ID Booking System';
								childIds = []
						       	module.exports.savethisFolder(req, title, childIds).then(data4_2=>{
						       		title = 'Facilities Booking Environment Assessment'
						       		childIds = [String(data3_1._id), String(data3_2._id)]
						       		
						       		module.exports.savethisFolder(req, title, childIds).then(data4=>{


						       			title = 'Landlord F&B Workflow Structure/Walkthrough';
										childIds = []
						       			module.exports.savethisFolder(req, title, childIds).then(data5_1=>{
								       	title = 'Landlord ID POS/Inventory Management System(s) (IMS)';
										childIds = []
										module.exports.savethisFolder(req, title, childIds).then(data5_2=>{
								       	title = 'Tenant F&B Workflow Structure/Walkthrough';
										childIds = []
										module.exports.savethisFolder(req, title, childIds).then(data5_3=>{
								       	title = 'Tenant ID POS/Inventory Management System(s) (IMS)';
										childIds = []
										module.exports.savethisFolder(req, title, childIds).then(data5_4=>{
								       		title = 'Facilities Booking Environment Assessment'
								       		childIds = [String(data5_1._id), String(data5_2._id), String(data5_3._id), String(data5_4._id)]
								       		
								       		module.exports.savethisFolder(req, title, childIds).then(data5=>{



								       			title = 'Landlord ID Corp ISP & WiFi Environments';
												childIds = []
								       			module.exports.savethisFolder(req, title, childIds).then(data6_1=>{
										       	title = 'Landlord ID POS/Inventory Management System(s) (IMS)';
												childIds = [];
												module.exports.savethisFolder(req, title, childIds).then(data6_2=>{
										       	title = 'Landlord ID Mobile Carrier & Device(s)';
												childIds = []
												module.exports.savethisFolder(req, title, childIds).then(data6_3=>{
										       	title = 'Onsite Testing (?)';
												childIds = []
												module.exports.savethisFolder(req, title, childIds).then(data6_4=>{
										       	title = 'Tenant: ID Corp Eml Environment';
												childIds = []
												module.exports.savethisFolder(req, title, childIds).then(data6_5=>{
										       	title = 'Tenant: ID Corp Eml Environment';
												childIds = []
												module.exports.savethisFolder(req, title, childIds).then(data6_6=>{
										       		title = 'Tenant: ID Corp ISP & WiFi Environments'
										       		childIds = [String(data6_1._id), String(data6_2._id), String(data6_3._id), String(data6_4._id), String(data6_5._id), String(data6_6._id)]
										       		
										       		module.exports.savethisFolder(req, title, childIds).then(data6=>{


										       			title = 'Tenant: ID Mobile Carrier & Devices';
														childIds = []
										       			module.exports.savethisFolder(req, title, childIds).then(data7_1=>{
												       	title = 'Landlord ID ACS System';
														childIds = []
														module.exports.savethisFolder(req, title, childIds).then(data7_2=>{
												       	title = 'Landlord ID VMS System';
														childIds = []
														module.exports.savethisFolder(req, title, childIds).then(data7_3=>{
												       	title = 'Tenant: ID ACS System';
														childIds = []
														module.exports.savethisFolder(req, title, childIds).then(data7_4=>{
												       		title = 'Security Environment Assessment'
												       		childIds = [String(data7_1._id), String(data7_2._id), String(data7_3._id), String(data5_4._id)]
												       		
												       		module.exports.savethisFolder(req, title, childIds).then(data7=>{


												       			title = 'Tenant ID VMS System';
																childIds = []
												       			module.exports.savethisFolder(req, title, childIds).then(data8_1=>{
														       	title = 'Request: BB Bldg Imagery';
																childIds = []
														       	module.exports.savethisFolder(req, title, childIds).then(data8_2=>{
														       		title = 'UI Custom Config'
														       		childIds = [String(data8_1._id), String(data8_2._id)]
														       		
														       		module.exports.savethisFolder(req, title, childIds).then(data8=>{

														       			title = 'Discovery'
															       		childIds = [String(data1._id), String(data2._id), String(data3._id), String(data4._id), String(data5._id), String(data6._id), String(data7._id), String(data8._id)]
															       		
															       		module.exports.savethisFolder(req, title, childIds).then(dataDiscovery=>{


															       			




var title = 'Alpha Setup';
	   var childIds = []
       module.exports.savethisFolder(req, title, childIds).then(dataA1_1=>{       	 
	       var title = 'Alpha Testing';
		   var childIds = []
		   module.exports.savethisFolder(req, title, childIds).then(dataA2_1=>{    
		   	var title = 'Alpha Update to Beta';
		    var childIds = []
		    module.exports.savethisFolder(req, title, childIds).then(dataA3_1=>{
		    	var title = 'Alpha';
		   		var childIds = [String(dataA1_1._id), String(dataA2_1._id), String(dataA3_1._id)]
		   		module.exports.savethisFolder(req, title, childIds).then(dataA=>{




	var title = 'Beta Setup';
	   var childIds = []
       module.exports.savethisFolder(req, title, childIds).then(dataB1_1=>{       	 
	       var title = 'Beta Testing';
		   var childIds = []
		   module.exports.savethisFolder(req, title, childIds).then(dataB2_1=>{    
		   	var title = 'Beta Update to Release';
		    var childIds = []
		    module.exports.savethisFolder(req, title, childIds).then(dataB3_1=>{
		    	var title = 'Beta';
		   		var childIds = [String(dataB1_1._id), String(dataB2_1._id), String(dataB3_1._id)]
		   		module.exports.savethisFolder(req, title, childIds).then(dataB=>{


		   		var title = 'Release';
		   		var childIds = []
		   		module.exports.savethisFolder(req, title, childIds).then(dataR=>{


															       			title=  req.body.project_name
															       			childIds= [String(dataF7._id), String(dataDiscovery._id),  String(dataA._id), String(dataB._id), String(dataR._id)]
															       			module.exports.savethisFolder(req, title, childIds, true).then(dataProject=>{
															       			console.log("Line 327", dataProject);
															       				folders.getrootfolder(function(err, data){
															       					console.log("Line 329",data, err);
															       					childIds = data.childIds;
															       					childIds.push(String(dataProject._id));
															       					  var myquery = { title: 'Root' };
																					  var newvalues = { childIds: childIds};
																					  console.log("---------", newvalues);
																					  folders.updateFolder(myquery, newvalues, function(err, data){
																					  	console.log("---------", data, err);
																						  	req.flash('success_msg', 'Project Successfully Created');
																					  
																					  });
															       				})

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


							})
		   				});
		   			});		   
		   		});		   
		    });		   
		   });
		   });
		   });


															       		});

														       		});
														       	 });//Tenant
														       	//})
																});	//landlord

												       		});
												       	});//Tenant
												       	});//Tenant
												       	 });//Tenant
												       	//})
														});	//landlord


										       		});
										       	});//Tenant
										       	});//Tenant
										       	});//Tenant
										       	});//Tenant
										       	 });//Tenant
										       	//})
												});	//landlord




								       		});
								       	});//Tenant
								       	});//Tenant
								       	 });//Tenant
								       	//})
										});	//landlord


						       		});
						       	 });//Tenant
						       	//})
								});	//landlord


				       		});
				       	 });//Tenant
				       	//})
						});	//landlord

		       		});
		       	 });//Tenant
		       	//})
				});	//landlord

       		});
       	 });//Tenant
       	//})
		});	//landlord


	res.redirect('/');});





router.get('/folders', function(req, res){
	var folderId = req.query.id
 	var foldersContents = fs.readFileSync("data/folders.json");
 	var tasksContents = fs.readFileSync("data/tasks.json");
 	var contactsContents = fs.readFileSync("data/user.json");
 	var userDetails = req.user
 	functions.foldersHeierarcy(foldersContents, folderId).then((foldersHeiraricalData)=>{
		functions.foldersDetails(moment, tasksContents, foldersContents, contactsContents, folderId).then((folderDetailsData)=>{
			//console.log(folderDetailsData);
			res.render('theme/folderdetails', {
				layout: 'layout2',
				'folderDetails':  folderDetailsData,
				'foldermenu':  foldersHeiraricalData,
				'userDetails': userDetails
			});
		})
	});
});


router.get('/createtasks', function(req, res){
	var folderId = req.query.folderid
	folders.getfolders(function(err, foldersData){
		tasks.getalltasks(function(taskserr, tasksContents){ //Get/Fetch Tasks
 			contacts.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
 				roles.getallroles(function(roleErr, rolesDetails){
					if(err) throw err;
					//console.log(foldersData['foldersdata']['data']);
					var foldersContents = foldersData			
					var userDetails = req.user
				 	functions.foldersHeierarcy(foldersContents).then((foldersHeiraricalData)=>{
				 		res.render('theme/new_task', {
									layout: 'layout2',
									'roles': rolesDetails ,
									folderId: folderId,
									'foldermenu':  foldersHeiraricalData,
									'userDetails': userDetails
								});
					});	
				});				
			});
		});
	});
});


router.post('/createtasks', function(req, res){

  // Validation
  req.checkBody('title', 'Title is required').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		var taskdetails = {
			'title': req.body.title,
			'description':  req.body.description,
			'startDate': req.body.startDate,
			'due': req.body.due,
			'roles': req.body.roles
		}
		console.log("line 561: ", taskdetails);
		var folderId = req.body.folderId;
		folders.getfolders(function(err, foldersData){
		tasks.getalltasks(function(taskserr, tasksContents){ //Get/Fetch Tasks
 			contacts.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
 				roles.getallroles(function(roleErr, rolesDetails){
					if(err) throw err;
					//console.log(foldersData['foldersdata']['data']);
					var foldersContents = foldersData			
					var userDetails = req.user
				 	functions.foldersHeierarcy(foldersContents).then((foldersHeiraricalData)=>{
				 		res.render('theme/new_task', {
				 					errors:errors,
									layout: 'layout2',
									'roles': rolesDetails ,
									'taskdetails': taskdetails,
									folderId: folderId,
									'foldermenu':  foldersHeiraricalData,
									'userDetails': userDetails
								});
						});	
					});				
				});
			});
		});
	} else {

		var taskentrydata = {
			user: req.user,
			parentIds: [req.body.folderId],
			title: req.body.title,
			description: req.body.description,
			briefDescription: req.body.briefDescription,
			createdDate: moment().format('YYYY-MM-DDTHH:mm'),
			dates: { 'type': 'backlog'},
			status: 'Active'
		}
		if(req.body.startDate){
			taskentrydata['dates'] = {
				'type': 'Planned',
				'start': req.body.startDate,
				'due': req.body.startDate,
			}
		}
		var taskData = new tasks(taskentrydata);
		taskData.save(function(err) {
	       console.log('Task saved')
	    });
		req.flash('success_msg', 'Task has been created Successfully');
		res.redirect('/folders/?id='+req.body.folderId);
	}

});


//import data from json file to database
router.get('/importfolders', function(req, res){
	var foldersContents = fs.readFileSync("data/folders.json");
	$foldersData = JSON.parse(foldersContents)
	for(var folderElement in $foldersData['data'])
	{
		var newfolder = new folders({
			user: req.user,
			//foldersdata: $foldersData,
			id: $foldersData['data'][folderElement]['id'],
			title: $foldersData['data'][folderElement]['title'],
			color: $foldersData['data'][folderElement]['color'],
			childIds: $foldersData['data'][folderElement]['childIds'],
			scope: $foldersData['data'][folderElement]['scope'],
			project: $foldersData['data'][folderElement]['project']
		});
		newfolder.save(function(err) {
	       console.log('folder saved')
	    });
	}	
	res.send('sucess')
});

//import data from json file to database
router.get('/importtasks', function(req, res){
	var tasksContents = fs.readFileSync("data/tasks.json");
	$tasksData = JSON.parse(tasksContents)
	
	for(var taskElement in $tasksData['data'])
	{
		var newtasks = new tasks({
			user: req.user,
			//foldersdata: $foldersData,
			id: $tasksData['data'][taskElement]['id'],
			accountId: $tasksData['data'][taskElement]['accountId'],
		    title: $tasksData['data'][taskElement]['title'],
		    description: $tasksData['data'][taskElement]['description'],
		    briefDescription: $tasksData['data'][taskElement]['briefDescription'],
		    parentIds: $tasksData['data'][taskElement]['parentIds'],
		    superParentIds: $tasksData['data'][taskElement]['superParentIds'],
		    sharedIds: $tasksData['data'][taskElement]['sharedIds'],
		    responsibleIds: $tasksData['data'][taskElement]['responsibleIds'],
		    status: $tasksData['data'][taskElement]['status'],
		    importance: $tasksData['data'][taskElement]['importance'],
		    createdDate: $tasksData['data'][taskElement]['createdDate'],
		    updatedDate: $tasksData['data'][taskElement]['updatedDate'],
		    dates: $tasksData['data'][taskElement]['dates'],
		    scope: $tasksData['data'][taskElement]['scope'],
		    authorIds: $tasksData['data'][taskElement]['authorIds'],
		    customStatusId: $tasksData['data'][taskElement]['customStatusId'],
		    hasAttachments: $tasksData['data'][taskElement]['hasAttachments'],
		    attachmentCount: $tasksData['data'][taskElement]['attachmentCount'],
		    permalink: $tasksData['data'][taskElement]['permalink'],
		    priority: $tasksData['data'][taskElement]['priority'],
		    superTaskIds: $tasksData['data'][taskElement]['superTaskIds'],
		    subTaskIds: $tasksData['data'][taskElement]['subTaskIds'],
		    dependencyIds: $tasksData['data'][taskElement]['dependencyIds'],
		    metadata: $tasksData['data'][taskElement]['metadata'],
		    customFields: $tasksData['data'][taskElement]['customFields'],
		});
		newtasks.save(function(err) {
	       console.log('tasks saved')
	    });
	}	
	res.send('sucess')
});

module.exports = router;

module.exports.createChildFolder = function(req, $folderstructure, $parentId=null, $level=1){
	return new Promise(function(resolve, reject){
		var Ids = [];				
		var entry = false;
		for(var index in $folderstructure){		
			var childIds = [];
			var title = index;
			if(index%1==0){
				title = $folderstructure[index]
			}
			savedFolders = module.exports.saveFolder(req, title, $parentId, $folderstructure[index]).then(data=>{
				resolve(savedFolders);
			});	
							
		}
	});
		
		
}

module.exports.savethisFolder = function(req, title, $childIds, isProject=false){
	return new Promise(function(resolve, reject){
		folderData = {
			user: req.user,
			title: title,
			childIds: $childIds
		}
		if(isProject){
			folderData['project'] =  {
						        "authorId": req.user._id,
						        "ownerIds": [
						          req.user._id
						        ],
						        "status": "Green",
						        "startDate": moment().format('YYYY-MM-DDTHH:mm'),
						        "endDate": moment().format('YYYY-MM-DDTHH:mm'),
						        "createdDate": moment().format('YYYY-MM-DDTHH:mm')
						      }
			folderData['scope'] = 'WsFolder'
		}
		var newfolder = new folders(folderData);
		newfolder.save(function(err, data) {
	       //console.log('folder Created', data);
	       resolve(data);
	    });	
	});
}

module.exports.saveFolder = function(req, title, $parentId, $folderstructure, $level=1){
	return new Promise(function(resolve, reject){
		folderData = {
			user: req.user,
			title: title
		}
		folderData['parentId'] = $parentId
		var newfolder = new folders(folderData);
		newfolder.save(function(err, data) {
	       console.log('folder Created', data);
	       if(($folderstructure.length)>0){
	       	$level += 1;
	       	if($level<3){
	       		if (typeof $folderstructure === 'string' || $folderstructure instanceof String){

				}else{

	       		console.log($folderstructure);
				for(var index in $folderstructure){	
					var childIds = [];
					var title = index;
					if(index%1==0){
						title = $folderstructure[index]
					}				
			 	  	module.exports.saveFolder(req, title, String(data._id), $folderstructure[index], $level);
				 	resolve("1")
				 }
				}
			  }else{
			  	resolve("1")
			  }
			}	else{
				resolve("1")
			}
			
	    });	
	});
}