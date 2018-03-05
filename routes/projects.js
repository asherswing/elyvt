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

var foldersModel = require('../models/folders');
var tasks = require('../models/tasks');
var contacts = require('../models/user');
var userModel = require('../models/user');
var question_answer = require('../models/question_answers');
var functions = require('../resources/functions.js')

var AuthenteCheck = require('../routes/index');
var roles = require('../models/roles');
var logs = require('../models/logs');

var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));


// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';




router.get('/projects', AuthenteCheck.ensureAuthenticated, function(req, res){
	 //var foldersContents = fs.readFileSync("data/folders.json");
	 //var contactsContents = fs.readFileSync("data/contacts.json");
	 var accountsContents = fs.readFileSync("data/accounts.json");
	 var userDetails = req.user;

	 foldersModel.getfolders(function(folderserr, foldersContents){ //Get/Fetch folders
 		userModel.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
          functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
 				functions.getProjects(moment, (foldersContents), (contactsContents)).then((projectsData)=>{
				 	//////console.log(JSON.stringify(projectsData));
				 	res.render('theme/projects', {
				 		layout: 'layout2',
				 		'folders': foldersContents,
				 		'foldermenu':  foldersHeiraricalData,
				 		'projectsData': projectsData,
				 		'accounts': accountsContents, 
				 		'contacts': contactsContents, 
				 		'userDetails': userDetails,
				 		'projectTab': true
				 	})
				 });
 			});
		}); // End Fetching Contacts
 	}); // End Fetching folders
});


router.get('/archive', AuthenteCheck.ensureAuthenticated, function(req, res){
	 //var foldersContents = fs.readFileSync("data/folders.json");
	 //var contactsContents = fs.readFileSync("data/contacts.json");
	 var accountsContents = fs.readFileSync("data/accounts.json");
	 var userDetails = req.user;

	 foldersModel.getfolders(function(folderserr, foldersContents){ //Get/Fetch folders
 		userModel.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts

 			functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
 				functions.getArchiveProjects(moment, (foldersContents), (contactsContents)).then((projectsData)=>{
				 	//////console.log(JSON.stringify(projectsData));
				 	res.render('theme/archive', {
				 		layout: 'layout2',
				 		'folders': foldersContents,
				 		'foldermenu':  foldersHeiraricalData,
				 		'projectsData': projectsData,
				 		'accounts': accountsContents, 
				 		'contacts': contactsContents, 
				 		'userDetails': userDetails,
				 		'archiveTab': true
				 	})
				 });
 			});
		}); // End Fetching Contacts
 	}); // End Fetching folders
});

router.get('/edit/project/', AuthenteCheck.ensureAuthenticated, function(req, res){
	 //var foldersContents = fs.readFileSync("data/folders.json");
	 //var contactsContents = fs.readFileSync("data/contacts.json");
	 var projectId = req.query.id
	 var userDetails = req.user;
var projectManager =req.query.projectManager;
var Buldingmanager =req.query.Buldingmanager;
var UIManager =req.query.UIManager;
var SecurityManager =req.query.SecurityManager;
var ClientManager =req.query.ClientManager;
var SecurituintegrityManager =req.query.SecurituintegrityManager;
var ConceirageManager =req.query.ConceirageManager;
var CommunticationManager =req.query.CommunticationManager;
var EventsManager =req.query.EventsManager;
var FacilityManager =req.query.FacilityManager;
var FoodvebrageManager =req.query.FoodvebrageManager;
var clientlauncherManager =req.query.clientlauncherManager;

//console.log("Line No ----414-----", projectManager);

	 foldersModel.getfolders(function(folderserr, foldersContents){ //Get/Fetch folders
 		userModel.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
 			functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
 				foldersModel.getfolderbyId(projectId, function(err, projectData){
//console.log("===========line no 110==============",projectData)
if(projectManager != null && projectManager !="")
{
projectData["projectManager"] =projectManager;

}
if(Buldingmanager != null && Buldingmanager !="")
{
projectData["buildingManager"] = Buldingmanager;
	
}
if(ClientManager != null && ClientManager != ""){

	projectData["clientprojectManager"] = ClientManager;
}
if(UIManager != null && UIManager !="")
{
  projectData["uiManager"] = UIManager;
	
}

if(SecurityManager != null && SecurityManager != "")
{
projectData["securityManager"] = SecurityManager
	
}
if(SecurituintegrityManager != null && SecurituintegrityManager != "")
{
projectData["securityintegratorManager"] = SecurituintegrityManager;
	
}
if(ConceirageManager != null && ConceirageManager != "")
{
  projectData["conceirageManager"] = ConceirageManager;
	
}
if(CommunticationManager  != null && CommunticationManager != "")
{
	projectData["communicationManager"] = CommunticationManager;
}
if(EventsManager != null && EventsManager !="")

{
	projectData["eventsManager"] = EventsManager;
}

if(FacilityManager != null && FacilityManager != "")
{
projectData["facilityManager"] = FacilityManager;
	
}
if(FoodvebrageManager  != null && FoodvebrageManager !="")
{
projectData["foodandbeverageManager"] = FoodvebrageManager;
	
}
if(clientlauncherManager != null && clientlauncherManager !="")
{

	projectData["clientlaunchManager"] = clientlauncherManager;
}


 					roles.getallroles(function(roleErr, rolesDetails){
 						

						contactsDropdownHTML = '<option value="">Select</option>';
 						for(var item in contactsContents){
 							//console.log("===========Line No 184======",projectData['projectManager']['_id'])
 							contactsDropdownHTML += '<option value="'+contactsContents[item]['_id']+'"';
 							if((projectData['projectManager']['_id']) && contactsContents[item]['_id']){
                                  var rolename ='';
                                  var RolesID = contactsContents[item]['roles'];

								if(RolesID){
								for (var RolessingleID in rolesDetails){
	 								//console.log("===========Line No 184======",RolesID)
	 								async.forEachSeries(RolesID, function(value, callback){

	 									//console.log("=============Line No 185=====",rolesDetails[RolessingleID]['_id'], value)
		 								if(String(value) == String(rolesDetails[RolessingleID]['_id'])){

			 									 rolename += rolesDetails[RolessingleID]['title']+',';
			 									 //console.log("=============Line No 185=====",rolename)
			 									 
		 								}
		 								callback()
		 							})
		 							
		 						}
                            }
else {
rolename ='Others';

}

//console.log("=============Line No NARENDRA=====",projectData['projectManager']['_id'])
 								if(String(projectData['projectManager']['_id']).indexOf(contactsContents[item]['id']) != -1)
 								{
 									contactsDropdownHTML += " selected";
 								}
 							}
 							contactsDropdownHTML += '>'+contactsContents[item]['firstname']+' ('+rolename+') </option>';

}
	
//})
 	
 						//}
 						contactsDropdownHTML += '<option value="null">Add new Assignee</option>';

 						managerDropdownHTML = '<option value="">Select</option>';
 						for(var item in contactsContents){
 							managerDropdownHTML += '<option value="'+contactsContents[item]['id']+'"';

 							if((projectData["buildingManager"]) && contactsContents[item]['id']){
 								var rolename ='';
								var RolesID = contactsContents[item]['roles'];
								if(contactsContents[item]['roles']){
								for (var RolessingleID in rolesDetails){
	 								for (var roleitemnamr in RolesID){
		 								if(String(rolesDetails[RolessingleID]['_id']) == String(RolesID[roleitemnamr])){
		 									rolename += rolesDetails[RolessingleID]['title']+',';
			 									
			 								
		 								}
		 							}
		 						}
                            }
else {
rolename ='Others';

}

 								if(projectData['buildingManager'].indexOf(contactsContents[item]['id']) != -1)
 								{
 									managerDropdownHTML += " selected";
 								}
 							}

 							managerDropdownHTML += '>'+contactsContents[item]['firstname']+' ('+rolename+') </option>';

 						}
 						managerDropdownHTML += '<option value="null">Add new Assignee</option>';
 						clientmanagerDropdownHTML = '<option value="">Select</option>';
 						for(var item in contactsContents){
 							clientmanagerDropdownHTML += '<option value="'+contactsContents[item]['id']+'"';
                             var rolename ='';
								var RolesID = contactsContents[item]['roles'];
								if(contactsContents[item]['roles']){
								for (var RolessingleID in rolesDetails){
	 								//console.log("--------line no 547----",RolesID)
	 								for (var roleitemnamr in RolesID){
		 								if(String(rolesDetails[RolessingleID]['_id']) == String(RolesID[roleitemnamr])){
		 									//rolesModel.getrolesbyId(RolesID, function(roleserr, RolesData){
			 									 rolename += rolesDetails[RolessingleID]['title']+',';
			 									 //console.log("Narendra Yadav", rolesDetails[RolessingleID]['title'])
			 								//})
		 								}
		 							}
		 						}
                            }
                           else {
                                 rolename ='Others';

                                   }
 							if((projectData["clientprojectManager"]) && contactsContents[item]['id']){
 								

 								if(projectData['clientprojectManager'].indexOf(contactsContents[item]['id']) != -1)
 								{
 									clientmanagerDropdownHTML += " selected";
 								}
 							}

 							clientmanagerDropdownHTML += '>'+contactsContents[item]['firstname']+' ('+rolename+') </option>';

 						}
 						clientmanagerDropdownHTML += '<option value="null">Add new Assignee</option>';
 						clientlaunchermanagerDropdownHTML = '<option value="">Select</option>';
 						for(var item in contactsContents){
 							clientlaunchermanagerDropdownHTML += '<option value="'+contactsContents[item]['id']+'"';
                              var rolename ='';
								var RolesID = contactsContents[item]['roles'];
								if(contactsContents[item]['roles']){
								for (var RolessingleID in rolesDetails){
	 								//console.log("--------line no 547----",RolesID)
	 								for (var roleitemnamr in RolesID){
		 								if(String(rolesDetails[RolessingleID]['_id']) == String(RolesID[roleitemnamr])){
		 									//rolesModel.getrolesbyId(RolesID, function(roleserr, RolesData){
			 									 rolename += rolesDetails[RolessingleID]['title']+',';
			 									 //console.log("Narendra Yadav", rolesDetails[RolessingleID]['title'])
			 								//})
		 								}
		 							}
		 						}
                            }
else {
rolename ='Others';

}
 							if((projectData["clientlaunchManager"]) && contactsContents[item]['id']){
 								

 								if(projectData['clientlaunchManager'].indexOf(contactsContents[item]['id']) != -1)
 								{
 									clientlaunchermanagerDropdownHTML += " selected";
 								}
 							}

 							clientlaunchermanagerDropdownHTML += '>'+contactsContents[item]['firstname']+' ('+rolename+') </option>';

 						}
 						clientlaunchermanagerDropdownHTML += '<option value="null">Add new Assignee</option>';
 						UImanagerDropdownHTML = '<option value="">Select</option>';
 						for(var item in contactsContents){
 							UImanagerDropdownHTML += '<option value="'+contactsContents[item]['id']+'"';
var rolename ='';
								var RolesID = contactsContents[item]['roles'];
								if(contactsContents[item]['roles']){
								for (var RolessingleID in rolesDetails){
	 								//console.log("--------line no 547----",RolesID)
	 								for (var roleitemnamr in RolesID){
		 								if(String(rolesDetails[RolessingleID]['_id']) == String(RolesID[roleitemnamr])){
		 									//rolesModel.getrolesbyId(RolesID, function(roleserr, RolesData){
			 									 rolename += rolesDetails[RolessingleID]['title']+',';
			 									 //console.log("Narendra Yadav", rolesDetails[RolessingleID]['title'])
			 								//})
		 								}
		 							}
		 						}
                            }
else {
rolename ='Others';

}
 							if((projectData["uiManager"]) && contactsContents[item]['id']){
 								

 								if(projectData['uiManager'].indexOf(contactsContents[item]['id']) != -1)
 								{
 									UImanagerDropdownHTML += " selected";
 								}
 							}

 							UImanagerDropdownHTML += '>'+contactsContents[item]['firstname']+' ('+rolename+') </option>';

 						}
 						UImanagerDropdownHTML += '<option value="null">Add new Assignee</option>';
 						securityManagerDropdownHTML = '<option value="">Select</option>';
 						for(var item in contactsContents){
 							securityManagerDropdownHTML += '<option value="'+contactsContents[item]['id']+'"';
var rolename ='';
								var RolesID = contactsContents[item]['roles'];
								if(contactsContents[item]['roles']){
								for (var RolessingleID in rolesDetails){
	 								//console.log("--------line no 547----",RolesID)
	 								for (var roleitemnamr in RolesID){
		 								if(String(rolesDetails[RolessingleID]['_id']) == String(RolesID[roleitemnamr])){
		 									//rolesModel.getrolesbyId(RolesID, function(roleserr, RolesData){
			 									 rolename += rolesDetails[RolessingleID]['title']+',';
			 									 //console.log("Narendra Yadav", rolesDetails[RolessingleID]['title'])
			 								//})
		 								}
		 							}
		 						}
                            }
else {
rolename ='Others';

}
 							if((projectData["securityManager"]) && contactsContents[item]['id']){
 								

 								if(projectData['securityManager'].indexOf(contactsContents[item]['id']) != -1)
 								{
 									securityManagerDropdownHTML += " selected";
 								}
 							}

 							securityManagerDropdownHTML+= '>'+contactsContents[item]['firstname']+' ('+rolename+') </option>';

 						}
 						securityManagerDropdownHTML += '<option value="null">Add new Assignee</option>';
 						securityintegratorManagerDropdownHTML = '<option value="">Select</option>';
 						for(var item in contactsContents){
 							securityintegratorManagerDropdownHTML += '<option value="'+contactsContents[item]['id']+'"';
var rolename ='';
								var RolesID = contactsContents[item]['roles'];
								if(contactsContents[item]['roles']){
								for (var RolessingleID in rolesDetails){
	 								//console.log("--------line no 547----",RolesID)
	 								for (var roleitemnamr in RolesID){
		 								if(String(rolesDetails[RolessingleID]['_id']) == String(RolesID[roleitemnamr])){
		 									
			 									 rolename += rolesDetails[RolessingleID]['title']+',';
			 									 
		 								}
		 							}
		 						}
                            }
else {
rolename ='Others';

}
 				if((projectData["securityintegratorManager"]) && contactsContents[item]['id']){
 					

 								if(projectData['securityintegratorManager'].indexOf(contactsContents[item]['id']) != -1)
 								{
 									securityintegratorManagerDropdownHTML += " selected";
 								}
 							}

 							securityintegratorManagerDropdownHTML+= '>'+contactsContents[item]['firstname']+' ('+rolename+') </option>';

 						}
 						securityintegratorManagerDropdownHTML += '<option value="null">Add new Assignee</option>';
 						conceirageManagerDropdownHTML = '<option value="">Select</option>';
 						for(var item in contactsContents){
 							conceirageManagerDropdownHTML += '<option value="'+contactsContents[item]['id']+'"';
var rolename ='';
								var RolesID = contactsContents[item]['roles'];
								if(contactsContents[item]['roles']){
								for (var RolessingleID in rolesDetails){
	 								//console.log("--------line no 547----",RolesID)
	 								for (var roleitemnamr in RolesID){
		 								if(String(rolesDetails[RolessingleID]['_id']) == String(RolesID[roleitemnamr])){
		 									//rolesModel.getrolesbyId(RolesID, function(roleserr, RolesData){
			 									 rolename += rolesDetails[RolessingleID]['title']+',';
			 									 //console.log("Narendra Yadav", rolesDetails[RolessingleID]['title'])
			 								//})
		 								}
		 							}
		 						}
                            }
else {
rolename ='Others';

}
 							if((projectData["conceirageManager"]) && contactsContents[item]['id']){
 								

 								if(projectData['conceirageManager'].indexOf(contactsContents[item]['id']) != -1)
 								{
 									conceirageManagerDropdownHTML += " selected";
 								}
 							}

 							conceirageManagerDropdownHTML+= '>'+contactsContents[item]['firstname']+' ('+rolename+') </option>';

 						}
 						conceirageManagerDropdownHTML += '<option value="null">Add new Assignee</option>';
 						communicationManagerDropdownHTML = '<option value="">Select</option>';
 						for(var item in contactsContents){
 							communicationManagerDropdownHTML += '<option value="'+contactsContents[item]['id']+'"';
var rolename ='';
								var RolesID = contactsContents[item]['roles'];
								if(contactsContents[item]['roles']){
								for (var RolessingleID in rolesDetails){
	 								//console.log("--------line no 547----",RolesID)
	 								for (var roleitemnamr in RolesID){
		 								if(String(rolesDetails[RolessingleID]['_id']) == String(RolesID[roleitemnamr])){
		 									//rolesModel.getrolesbyId(RolesID, function(roleserr, RolesData){
			 									 rolename += rolesDetails[RolessingleID]['title']+',';
			 									 //console.log("Narendra Yadav", rolesDetails[RolessingleID]['title'])
			 								//})
		 								}
		 							}
		 						}
                            }
else {
rolename ='Others';

}
 							if((projectData["communicationManager"]) && contactsContents[item]['id']){
 								

 								if(projectData['communicationManager'].indexOf(contactsContents[item]['id']) != -1)
 								{
 									communicationManagerDropdownHTML += " selected";
 								}
 							}

 							communicationManagerDropdownHTML+= '>'+contactsContents[item]['firstname']+' ('+rolename+') </option>';

 						}
 						communicationManagerDropdownHTML += '<option value="null">Add new Assignee</option>';
 						eventsManagerDropdownHTML = '<option value="">Select</option>';
 						for(var item in contactsContents){
 							eventsManagerDropdownHTML += '<option value="'+contactsContents[item]['id']+'"';
var rolename ='';
								var RolesID = contactsContents[item]['roles'];
								if(contactsContents[item]['roles']){
								for (var RolessingleID in rolesDetails){
	 								//console.log("--------line no 547----",RolesID)
	 								for (var roleitemnamr in RolesID){
		 								if(String(rolesDetails[RolessingleID]['_id']) == String(RolesID[roleitemnamr])){
		 									//rolesModel.getrolesbyId(RolesID, function(roleserr, RolesData){
			 									 rolename += rolesDetails[RolessingleID]['title']+',';
			 									 //console.log("Narendra Yadav", rolesDetails[RolessingleID]['title'])
			 								//})
		 								}
		 							}
		 						}
                            }
else {
rolename ='Others';

}
 							if((projectData["eventsManager"]) && contactsContents[item]['id']){
 								

 								if(projectData['eventsManager'].indexOf(contactsContents[item]['id']) != -1)
 								{
 									eventsManagerDropdownHTML += " selected";
 								}
 							}

 							eventsManagerDropdownHTML+= '>'+contactsContents[item]['firstname']+' ('+rolename+') </option>';

 						}
 						eventsManagerDropdownHTML += '<option value="null">Add new Assignee</option>';
 						facilityManagerDropdownHTML = '<option value="">Select</option>';
 						for(var item in contactsContents){
 							facilityManagerDropdownHTML += '<option value="'+contactsContents[item]['id']+'"';
var rolename ='';
								var RolesID = contactsContents[item]['roles'];
								if(contactsContents[item]['roles']){
								for (var RolessingleID in rolesDetails){
	 								//console.log("--------line no 547----",RolesID)
	 								for (var roleitemnamr in RolesID){
		 								if(String(rolesDetails[RolessingleID]['_id']) == String(RolesID[roleitemnamr])){
		 									//rolesModel.getrolesbyId(RolesID, function(roleserr, RolesData){
			 									 rolename += rolesDetails[RolessingleID]['title']+',';
			 									 //console.log("Narendra Yadav", rolesDetails[RolessingleID]['title'])
			 								//})
		 								}
		 							}
		 						}
                            }
else {
rolename ='Others';

}
 							if((projectData["facilityManager"]) && contactsContents[item]['id']){
 								

 								if(projectData['facilityManager'].indexOf(contactsContents[item]['id']) != -1)
 								{
 									facilityManagerDropdownHTML += " selected";
 								}
 							}

 							facilityManagerDropdownHTML+= '>'+contactsContents[item]['firstname']+' ('+rolename+') </option>';

 						}
 						facilityManagerDropdownHTML += '<option value="null">Add new Assignee</option>';
 						foodandbeverageManagerDropdownHTML = '<option value="">Select</option>';
 						for(var item in contactsContents){
 							foodandbeverageManagerDropdownHTML += '<option value="'+contactsContents[item]['id']+'"';
var rolename ='';
								var RolesID = contactsContents[item]['roles'];
								if(contactsContents[item]['roles']){
								for (var RolessingleID in rolesDetails){
	 								//console.log("--------line no 547----",RolesID)
	 								for (var roleitemnamr in RolesID){
		 								if(String(rolesDetails[RolessingleID]['_id'] )== String(RolesID[roleitemnamr])){
		 									//rolesModel.getrolesbyId(RolesID, function(roleserr, RolesData){
			 									 rolename += rolesDetails[RolessingleID]['title']+',';
			 									 //console.log("Narendra Yadav", rolesDetails[RolessingleID]['title'])
			 								//})
		 								}
		 							}
		 						}
                            }
else {
rolename ='Others';

}
 							if((projectData["foodandbeverageManager"]) && contactsContents[item]['id']){
 								

 								if(projectData['foodandbeverageManager'].indexOf(contactsContents[item]['id']) != -1)
 								{
 									foodandbeverageManagerDropdownHTML += " selected";
 								}
 							}

 							foodandbeverageManagerDropdownHTML+= '>'+contactsContents[item]['firstname']+' ('+rolename+') </option>';

 						} 						
 						foodandbeverageManagerDropdownHTML += '<option value="null">Add new Assignee</option>';
 						
 						projectStatusOptions = '<option value="">Select</option>\
						<option value="Active"';
						if(projectData.status=="Active"){
							projectStatusOptions += 'selected';
						}
						projectStatusOptions += '>In Progress</option>\
						<option value="Upcoming"';
						if(projectData.status=="Upcoming"){
							projectStatusOptions += 'selected';
						}
						projectStatusOptions += '>Upcoming</option>\
						<option value="Completed"';
						if(projectData.status=="Completed"){
							projectStatusOptions += 'selected';
						}
						projectStatusOptions += '>Completed</option>';

 						res.render('theme/edit_project', {
 							layout: 'layout2',
 							'foldermenu':  foldersHeiraricalData,
 							'userDetails': userDetails,
 							'managerDropdownHTML':managerDropdownHTML,
 							'clientmanagerDropdownHTML': clientmanagerDropdownHTML,
 							'clientlaunchermanagerDropdownHTML':clientlaunchermanagerDropdownHTML,
 							'contactsDropdownHTML': contactsDropdownHTML,
 							'UImanagerDropdownHTML':UImanagerDropdownHTML,
 							'securityManagerDropdownHTML': securityManagerDropdownHTML,
 							'securityintegratorManagerDropdownHTML':securityintegratorManagerDropdownHTML,
 							'conceirageManagerDropdownHTML': conceirageManagerDropdownHTML,
 							'communicationManagerDropdownHTML':communicationManagerDropdownHTML,
 							'eventsManagerDropdownHTML': eventsManagerDropdownHTML,
 							'facilityManagerDropdownHTML': facilityManagerDropdownHTML,
 							'foodandbeverageManagerDropdownHTML': foodandbeverageManagerDropdownHTML,
 							'projectData': projectData,
 							'projectStatusOptions': projectStatusOptions,
 							'projectTab': true
 						});

 					});
				});
		}); // End Fetching Contacts
 	}); // End Fetching folders
});
});





router.post('/edit/project/', AuthenteCheck.ensureAuthenticated, function(req, res){

	var projectId = req.query.id
	var userDetails = req.user;

	console.log("------Line 817--");
	console.log(req.body);
	
	if(projectId != null){
		foldersModel.getfolderbyId(projectId, function(err, folderData){
			var myquery = { _id: projectId };
			var newvalues = {
				title: req.body.project_name,
				projectManager: req.body.projectManager,
				buildingManager: req.body.BuildingManager,
				clientprojectManager: req.body.clientManager,
				clientlaunchManager: req.body.clientlaunchManager,
				uiManager: req.body.UIManager,
				securityManager: req.body.securityManager,
				securityintegratorManager: req.body.securityintegratorManager,
				conceirageManager: req.body.conciegeManager,
				communicationManager: req.body.communicationManager,
				eventsManager: req.body.eventsManager,
				facilityManager: req.body.facilityManager,
				foodandbeverageManager: req.body.fandbManager,
				project: {
					'startDate': req.body.startDate,
					'endDate': req.body.endDate,
					'Comm': req.body.Communication,
					'Concierge': req.body.Conceirge, 
					'Event': req.body.Events, 
					'Facilities': req.body.Facility_Booking,
					'F_B': req.body.f_B,
					'Security': req.body.Security, 
					'UI_Custom': req.body.UI_Config, 
					'Security_integer': req.body.Security_integer
				},
				status: req.body.status
			};
		var old_data_Str = "Title: "+folderData.title+"<br />   Start Date: "+folderData.project.startDate+"<br /> End Date:"+folderData.project.endDate+"<br /> Status: "+folderData.status+" "
			  var new_data_Str = "Title: "+req.body.project_name+"<br />   Start Date: "+req.body.startDate+"<br /> End Date:"+req.body.endDate+"<br /> Status: "+req.body.status+" "
			 var newLogs = new logs({
			  log_type: 'Project',
			  
		      log_content: {
						'startDate': req.body.startDate,
						'endDate': req.body.endDate,
						'title': req.body.project_name,
						'projectManager': req.body.projectManager,
						'buildingManager': req.body.BuildingManager,
						'clientprojectManager': req.body.clientManager,
						'clientlaunchManager': req.body.clientlaunchManager,
						'uiManager': req.body.UIManager,
						'securityManager': req.body.securityManager,
						'securityintegratorManager': req.body.securityintegratorManager,
						'conceirageManager': req.body.conciegeManager,
						'communicationManager': req.body.communicationManager,
						'eventsManager': req.body.eventsManager,
						'facilityManager': req.body.facilityManager,
						'foodandbeverageManager': req.body.fandbManager,
						'status': req.body.status,
						},
			  action: 'Update',
			  old_data: old_data_Str,
			  new_data : new_data_Str,
			  msg: "Project "+req.body.project_name+" has been updated by user "+ userDetails.firstname+" "+userDetails.lastname+".",
		      created_at: moment().format('MM/DD/YY'),
		      log_type_id: projectId,
		      log:req.body.project_name,
		      user_id: userDetails
		      
		    });

		    logs.createLogs(newLogs, function(err, logs){
		    	if(err) throw err;
		      console.log(logs);
		    });
			foldersModel.updateFolder(myquery, newvalues, function(err, data){
			  	////console.log(data);			
			  });
			res.redirect('/projects/edit/project/?id='+projectId);
		});
	};
});


router.post('/api/edit/project',function(req, res){

	var projectId = req.body.id
	
	if(projectId != null){
		var myquery = { _id: projectId };
		var newvalues = {
			project: {
				'startDate': req.body.startDate,
				'endDate': req.body.endDate,
			}
		};

     
		foldersModel.updateFolder(myquery, newvalues, function(err, data){
		  	////console.log(data);
		  	res.send('/edit/project/?id='+data);			
		  });
	}else{
		res.send(null);
	}
});



router.get('/project/delete', AuthenteCheck.ensureAuthenticated, function(req, res){
	var projectID = req.query.id;
	var userDetails = req.user;
foldersModel.getfolderbyId(projectID, function(err, folderData){
	var newLogs = new logs({
		    log_type: 'Project',
	        log_content: folderData.title,
			action: 'Delete',
			old_data: '',
			new_data: "Project "+folderData.title+"  has been Delete by user "+ userDetails.firstname+" "+userDetails.lastname+".",
	    	created_at: moment().format('MM/DD/YY'),
	        log_type_id: projectID,
	        log: folderData.title,
	        user_id: userDetails	      
	    });

	    logs.createLogs(newLogs, function(err, logs){
	    	if(err) throw err;
	      console.log(logs);
	    });
	});

	foldersModel.deleteproject(projectID, function(projecterr, projectdetails){ //Get/Fetch Tasks
		res.redirect('/projects/projects');
	}); // End Fetching contact

});

router.get('/project/restore', AuthenteCheck.ensureAuthenticated, function(req, res){
	var projectID = req.query.id;
	var userDetails = req.user;
	foldersModel.restoreProject(projectID, function(projecterr, projectdetails){ //Get/Fetch Tasks
		res.redirect('/projects/archive');
	}); // End Fetching contact

});



module.exports = router;