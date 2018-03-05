var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var Resources = require('./resources/Resources.js');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var Cookies = require( "cookies" );
var base64 = require('base-64');
//var cors = require('cors')
var bcrypt = require('bcryptjs');

var request = require('request');
var http = require('http');
var fs = require('fs');
var data = require("./data.js");
var moment = require('moment');
var ejs = require('ejs');
var functions = require('./resources/functions.js');
var schedule = require('node-schedule');

var userModel = require('./models/user');
var tasks = require('./models/tasks');
var foldersModel = require('./models/folders');
var logsModel = require('./models/logs');
var accounts = require('./models/accounts');
var workflows = require('./models/workflows');
var invitations = require('./models/invitations');
var question_answer = require('./models/question_answers');

var mail_settings = require('./models/mail_settings');
var ConnectRoles = require('connect-roles');
var hostUrl = "http://elyvt.com";

require('dotenv').config();
mongoose.connect('mongodb://mongo:27017/elevate'); //missing variable "connection"?
//mongoose.connect('mongodb://localhost:27017/elevate'); 
var db = mongoose.connection;
var async = require('async');

// var routes = require('./routes/index');
var users = require('./routes/users');
var rolesModel = require('./models/roles');
var questions = require('./models/questions');
var tasksModel = require('./models/tasks');
var logsModel = require('./models/logs');

var folders = require('./routes/folders');
var emails = require('./routes/emails');
var rolesRoute = require('./routes/roles');
var contacts = require('./routes/contacts');
var tasks = require('./routes/tasks');
var projects = require('./routes/projects');
var charts = require('./routes/charts');
var logs = require('./routes/logs');
var AuthenteCheck = require('./routes/index');

// Init App
var app = express();

//app.use(cors());

// here you set that all templates are located in `/views` directory
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
// here you set that you're using `ejs` template engine, and the
// default extension is `ejs`
app.engine('handlebars', exphbs({
	defaultLayout:'layout', 
	helpers: {
		'ifEquals': function(arg1, arg2, options) {
			return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
		},
		'trimString': function(passedString) {
			if(passedString != "undefined"){
				var theString = passedString.substring(0,1);
		    	return theString	
			}else{
				return ''
			}
		    
		}
	}	
}));

app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static update/fo
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
	secret: 'secret',
	saveUninitialized: true,
	resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
	errorFormatter: function(param, msg, value) {
		var namespace = param.split('.')
		, root    = namespace.shift()
		, formParam = root;

		while(namespace.length) {
			formParam += '[' + namespace.shift() + ']';
		}
		return {
			param : formParam,
			msg   : msg,
			value : value
		};
	}
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
	next();
});

var user = new ConnectRoles({
	failureHandler: function (req, res, action) {
    // optional function to customise code that runs when
    // user fails authorisation
    // var accept = req.headers.accept || '';
    // res.status(403);
    // if (~accept.indexOf('html')) {
    //   res.render('access-denied', {action: action});
    // } else {
    //   res.send('Access Denied - You don\'t have permission to: ' + action);
    // }
    req.flash('error_msg','You are not logged in');
    res.redirect('/users/login');
}
});

app.use(user.middleware());
//admin users can access all pages
user.use(function (req, action) {
	if(!req.isAuthenticated()) return false;
  //if (req.user.role === 'admin') {
    //return true;
  //}
  //console.log(req.user.roles);
  ////console.log(AuthenteCheck.ensureAuthenticated);
  return true
});


// app.use('/', routes);
app.use('/users', users);
app.use('/folders', folders);
app.use('/email', emails);
app.use('/role', rolesRoute);
app.use('/contact', contacts);
app.use('/tasks', tasks);
app.use('/projects', projects);
app.use('/charts', charts);
app.use('/logs', logs);



/**
*  Dashboard
*/
app.get('/', AuthenteCheck.ensureAuthenticated, function(req, res){
	var userDetails = req.user;
	var projectId = req.query.id;
	if((typeof projectId === "undefined") || (projectId == "null")){
		projectId = null;
	}

	//console.log("projectId", projectId);
foldersModel.getfolders(function(folderserr, foldersContents){ //Get/Fetch folders
	userModel.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
		foldersModel.getprojects(function(folderserr, projectContents){ //Get/Fetch folders
			//console.log('get Contacts');
			 functions.getTaskByFolder(moment, contactsContents, projectId).then((tasksContents)=>{ //Get/Fetch Tasks
			 	//console.log('tasksContents');
			 	functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
			 		//console.log("herirecy Done");
			 		functions.folderDashboardContent(moment, (foldersContents), (tasksContents), (contactsContents)).then((folderDashboardData)=>{
			 		//	console.log("Dashboard Done");
			 			functions.buildMilestonesTable(moment, (foldersContents), (tasksContents), (contactsContents), projectId).then((MilestonesTableContent)=>{
			 		//		console.log("Milestone Done");

			 				projectsDropdown = '';
			 				var projectName= '';
			 				projectsDropdown = '<option value="null">All Project</option>'
			 				for(var item in projectContents){
			 					projectsDropdown += '<option value="'+projectContents[item]['_id']+'"';
			 					if(projectContents[item]['_id'] == projectId){
			 						projectsDropdown += ' selected';
			 						projectName = projectContents[item]['title'];
			 					}
			 					projectsDropdown += '>'+projectContents[item]['title']+'</option>';
			 				}

			 				res.render('theme/index', {

  			 						  layout: 'layout2',
 									  'tasks': JSON.stringify(tasksContents), 
  									  'MilestonesTableContent': MilestonesTableContent,
 									  'folders': JSON.stringify(foldersContents),
 									  'projects': JSON.stringify(projectContents),
  									  'projectsDropdown': projectsDropdown,
  									  'folderDashboardData': folderDashboardData, 
  									  'foldermenu':  foldersHeiraricalData,
  									  'contacts': JSON.stringify(contactsContents), 
  									  'userDetails': userDetails,
  									  'projectId': projectId,
  									  'projectName': projectName,
  									  'homeTab': true,
  							});
              
              
			 			});
			 		});
			 	});
			}); // End Fetching Contacts
		 }); // End Fetching folders
	}); // End Fetching Projects
  }); // End Fetching tasks
}); // End Dashbord Function

app.get('/edit/folderdata/', AuthenteCheck.ensureAuthenticated, function(req, res){
	 //var foldersContents = fs.readFileSync("data/folders.json");
	 //var contactsContents = fs.readFileSync("data/contacts.json");
	 var projectId = req.query.id



	 var userDetails = req.user;

	 tasksModel.getalltasks(function(taskserr, tasksContents){ //Get/Fetch Tasks
		 foldersModel.getfolders(function(folderserr, foldersContents){ 
		 	userModel.getcontacts(function(contactserr, contactsContents){ 
		 		functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
		 			foldersModel.getfolderbyId(projectId, function(err, folderData){
		 				foldersModel.getfolderbyId(folderData.parentId, function(err, projectData){


		 				taskStatusOptions = '<option value="">Select</option>\
		 									<option value="Active"';
						if(folderData.status=="Active"){
							taskStatusOptions += 'selected';
						}
						taskStatusOptions += '>In Progress</option>\
						<option value="Upcoming"';
						if(folderData.status=="Upcoming"){
							taskStatusOptions += 'selected';
						}
						taskStatusOptions += '>Upcoming</option>\
						<option value="Completed"';
						if(folderData.status=="Completed"){
							taskStatusOptions += 'selected';
						}
						taskStatusOptions += '>Completed</option>';
						var attachents = '';
						if(folderData['attachents'] != '' && folderData['attachents']){
							attachents = JSON.parse(folderData['attachents']);
						}

						//////console.log(taskdetails['attachents'], typeof(attachents), attachents.title)
								
						contactsDropdownHTML = '<option value="">Select</option>';
						for(var item in contactsContents){
							contactsDropdownHTML += '<option value="'+contactsContents[item]['id']+'"';
							if((folderData["authorIds"]) && contactsContents[item]['id']){
								if(folderData['authorIds'].indexOf(contactsContents[item]['id']) != -1)
								{
									contactsDropdownHTML += " selected";
								}
							}
							contactsDropdownHTML += '>'+contactsContents[item]['firstname']+' '+contactsContents[item]['lastname']+'('+contactsContents[item]['title']+')</option>';
						}
						contactsDropdownHTML += '<option value="null">Add New Assignee</option>';

						dependenciesDropdownHtml = '<option value="">Select</option>';
						for(var item in tasksContents){
							dependenciesDropdownHtml += '<option value="'+tasksContents[item]['_id']+'"';
							/////for(var dependencyId in taskdetails['dependencyIds']){
								if(folderData['dependencyIds'] == (tasksContents[item]['_id']))
								{
									dependenciesDropdownHtml += " selected";
								}
							//}								
							dependenciesDropdownHtml += '>'+tasksContents[item]['title']+'</option>';
						}
		 				

		 				res.render('theme/folder_editdata', {
		 					layout: 'layout2',
		 					'foldermenu':  foldersHeiraricalData,
		 					'userDetails': userDetails,
		 					'taskStatusOptions': taskStatusOptions,
		 					'contactsDropdownHTML': contactsDropdownHTML,
		 					'dependenciesDropdownHtml': dependenciesDropdownHtml,
		 					'folderData': folderData,
		 					'projectData': projectData,
		 				});

		 			});
		 		});
			}); // End Fetching Contacts
	 	}); // End Fetching folders
	});
		 });
});



app.post('/edit/folderdata/', AuthenteCheck.ensureAuthenticated, function(req, res){
	
	 var folderId = req.query.id
	var userDetails = req.user;
	foldersModel.getfolderbyId(folderId, function(err, folderData){		
	  var myquery = { _id: folderId };
	  var newvalues = {
			title: req.body.project_name,
			startDate: req.body.startDate,
			endDate: req.body.endDate,
			description: req.body.description,
			status: req.body.status,
			authorIds: [req.body.authorIds],
			dependencyIds: req.body.dependencies,
			attachents: req.body.attachement
		};

		var old_data_Str = "Title: "+folderData.title+"<br /> ProjectManager:"+folderData.projectManager+"<br /> ";
            if(folderData.startDate){
            old_data_Str += "Start Date:"+folderData.startDate+"<br />: End Date:"+folderData.endDate+"<br /> ";
        }
        if(folderData.endDate){
        	old_data_Str += "End Date:"+folderData.endDate+"<br />"; 
        }

			var new_data_Str = "Title: "+ req.body.project_name+"<br /> Discription:"+req.body.projectManager+"<br />  Start Date: "+req.body.startDate+"<br /> End Date:"+req.body.duedate+"<br /> Status: Active "
		 //console.log("========line no 351=======")
			var newlogsModel = new logsModel({
		    log_type: 'Milestone',
	        log_content: {
			    'title': req.body.project_name,
	   			'projectManager': req.body.projectManager,
	   			'roles': req.body.roles,
	            'startDate': req.body.startDate,
	            'endDate': req.body.duedate
			},
            action: 'Update',
			old_data: old_data_Str,
			new_data: new_data_Str,
			msg: "Milestone "+req.body.project_name+" ("+req.body.name+") has been updated by user "+ userDetails.firstname+" "+userDetails.lastname+".",
		    created_at: moment().format('MM/DD/YY'),
		    log_type_id: folderId,
		    log: req.body.project_name,
		    user_id: userDetails
	    });
	    //console.log("========line no 354=======")
	    logsModel.createLogs(newlogsModel, function(err, logsModel){
	    	if(err) throw err;
	      //console.log(logsModel);
	    });

		foldersModel.updateFolder(myquery, newvalues, function(err, data){
		  	////console.log(data);		
		  	res.redirect('/edit/folderdata/?id='+folderId);
		});
	});
});



/**
*  Function Tasks
* return void
*/


app.get('/settings', AuthenteCheck.ensureAuthenticated, function(req, res){
	// var tasksContents = fs.readFileSync("data/tasks.json");
	// var contactsContents = fs.readFileSync("data/contacts.json");
 	//var foldersContents = fs.readFileSync("data/folders.json");
 	var userDetails = req.user;

 	foldersModel.getfolders(function(folderserr, foldersContents){ //Get/Fetch folders

 		functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
 			mail_settings.get_mail_settings(function(err, mailSettingsData){
	 			////console.log(mailSettingsData);

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


	 	res.render('theme/settings', {
	 		layout: 'layout2',
	 		'foldermenu':  foldersHeiraricalData,
	 		'mailSettingsData': mailSettingsData,
	 		'userDetails': userDetails,
	 		'day_of_week_dropdown': day_of_week_dropdown,
	 		'hour_of_day_dropdown': hour_of_day_dropdown
	 	});

	 });
 		});
	 }); // End Fetching folders
 })

app.post('/settings', AuthenteCheck.ensureAuthenticated, function(req, res){
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

	res.redirect('/settings');
});







app.get('/kanban', AuthenteCheck.ensureAuthenticated, function(req, res){
	var userDetails = req.user;
	var kanbanHTML = '';
	foldersModel.getfolders(function(folderserr, foldersContents){ //Get/Fetch folders
	 	userModel.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
	 		functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
				//res.render('partials/sidebar',{'foldermenu':  foldersHeiraricalData,}, function (err, sidebardata){
					//kanbanHTML += sidebardata;
					sidebarHtml = '<div class="left_col_db sd_t">\
					<div class="left_col scroll-view">\
					<div class="navbar nav_title" style="border: 0;">\
					<a href="/" class="site_title">\
					<img src="../build/images/logo_elevate_main.png" style="float: left;width: 255px;padding-top:4px"/>\
					</a>\
					</div>\
					<div class="clearfix"></div>\
					<!-- menu profile quick info -->\
					<div class="profile clearfix">\
					<div class="profile_pic">\
					<img src="https://www.wrike.com/avatars//4A/F9/Box_ff3f9d3f_70-78_v1.png" alt="..." class="img-circle profile_img">\
					</div>\
					<div class="profile_info">\
					<span>Welcome, </span>\
					<h2>'+ userDetails.name +'</h2>\
					</div>\
					</div>\
					<!-- /menu profile quick info -->\
					<br />\
					<!-- sidebar menu -->\
					<div id="sidebar-menu" class="main_menu_side hidden-print main_menu">\
					<div class="menu_section">\
					<ul class="nav side-menu">\
					<li><a><i class="fa fa-sitemap"></i>Folders</a>\
					<div id="root"></div>'+ foldersHeiraricalData +'\
					</li>\
					</ul>\
					<h3>General</h3>\
					<ul class="nav side-menu">\
					<li><a href="/tasks" ><i class="fa fa-tasks"></i>Tasks</a><li>\
					<li><a href="/projects" ><i class="fa fa-briefcase"></i>Projects</a><li>\
					<li><a href="/gantt-chart" ><i class="fa fa-briefcase"></i>Gantt Chart</a><li>\
					<li><a href="/workflows" ><i class=" fa fa-cogs"></i>Workflows</a><li>\
					<li><a href="/contacts"><i class="fa fa-users"></i>Users</a><li>\
					<li><a href="/profile"><i class="fa fa-user"></i>Me</a><li>\
					</ul>\
					</div>\
					</div>\
					<!-- /sidebar menu -->\
					<!-- /menu footer buttons -->\
					<div class="sidebar-footer hidden-small">\
					<a data-toggle="tooltip" data-placement="top" title="Settings">\
					<span class="glyphicon glyphicon-cog" aria-hidden="true"></span>\
					</a>\
					<a data-toggle="tooltip" data-placement="top" title="FullScreen">\
					<span class="glyphicon glyphicon-fullscreen" aria-hidden="true"></span>\
					</a>\
					<a data-toggle="tooltip" data-placement="top" title="Lock">\
					<span class="glyphicon glyphicon-eye-close" aria-hidden="true"></span>\
					</a>\
					<a data-toggle="tooltip" data-placement="top" title="Logout" href="login.html">\
					<span class="glyphicon glyphicon-off" aria-hidden="true"></span>\
					</a>\
					</div>\
					<!-- /menu footer buttons -->\
					</div>\
					</div>';

					fs.readFile('views/theme/kanban.html',function (err, data){
						res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
						kanbanHTML += data;
						res.write(kanbanHTML);
						res.end();
					});
				//});
			});
		}); // End Fetching Contacts
	}); // End Fetching folders
});

/**
Mail Cron Schedular
**/
mail_settings.get_mail_settings(function(err, mailSettingsData){
	//console.log('Cron Started');
	//console.log(mailSettingsData);
	if(mailSettingsData != null){
		if(mailSettingsData.from_email != null){
			var from_email = mailSettingsData.from_email;
			var day_of_week = mailSettingsData.day_of_week;
			var hour_of_day = mailSettingsData.hour_of_day;
			var minute_of_hour = mailSettingsData.minute_of_hour;
		}else{
			var from_email = 'info@elevate.com';
			var day_of_week = 7;
			var hour_of_day = 1;
			var minute_of_hour = 0;
		}
		


		var rule = new schedule.RecurrenceRule();
		rule.dayOfWeek = day_of_week;
		rule.hour = hour_of_day;
		rule.minute = minute_of_hour;

		var j = schedule.scheduleJob(rule, function(){
			//console.log('The answer to life, the universe, and everything!');

			var request = require('request');
			request('http://elyvt.com/emailDashboard', function (error, response, body) {
			  //console.log('error:', error); // Print the error if one occurred
			  //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
			  //console.log('body:', body); // Print the HTML for the Google homepage.
			});

		});
	}
////console.log('The answer to life, the universe, and everything!');
});


app.get('/profile', AuthenteCheck.ensureAuthenticated, function(req, res){
	var UserId = req.user;
	foldersModel.getfolders(function(folderserr, foldersContents){ 
	userModel.getUserID(UserId, function(err, userDetails){//Get/Fetch folders
		rolesModel.getallroles(function(roleErr, rolesDetails){
   			functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
				var checkhtml='';
				var rolesID = userDetails.roles;
				noemailhtml = '<input type="checkbox"  name="no_email">'
		      if(userDetails.noemail == false){
		         //console.log("-------line no 69");
					noemailhtml = '<input type="checkbox"  name="no_email" checked>';
					
				}
				
		        for (var rolesdata in  rolesDetails){
					checkhtml += '<input type="checkbox" value="'+rolesDetails[rolesdata]['_id']+'" name="roles"';
					for(var roleItem in rolesID){	
						if(typeof rolesID[roleItem]._id !== "undefined"){
							if(rolesID[roleItem].roles.indexOf(rolesDetails[rolesdata]['_id']) != -1){
								checkhtml += "checked";
							}
						}
					}
						checkhtml += '>'+rolesDetails[rolesdata]['title']+'</br>';
					//}
				}
				res.render('theme/profile', {
					layout: 'layout2',
					'foldermenu':  foldersHeiraricalData,
					'userDetails': userDetails,
					'roles': checkhtml,
					'noemailhtml': noemailhtml,
				});
			});
		});
	});
});
});


app.get('/change-password', AuthenteCheck.ensureAuthenticated, function(req, res) {
	// Get content from file
	var userDetails = req.user;
	foldersModel.getfolders(function(folderserr, foldersContents){
		functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
				res.render('theme/change_password', {
					layout: 'layout2',
					'foldermenu':  foldersHeiraricalData,
					'userDetails': userDetails
				});
			});
	});	

});

app.post('/change-password', AuthenteCheck.ensureAuthenticated, function(req, res) {
	// Get content from file
	UserId = req.user._id;
	userModel.getUserID(UserId, function(err, userDetails){
		var password = req.body.password;
	  	var password2 = req.body.password2;
	  	req.checkBody('password', 'Password is required').notEmpty();
	  	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
	  	var errors = req.validationErrors();

		if(errors){
			res.render('theme/change-password',{
				errors:errors
			});
		} else {
			userDetails.password = password;
			userModel.updateUser(userDetails, function(err, user){
	          if(err) throw err;
	          //console.log(user);
	          req.flash('success_msg', 'Your password has been successfully change');
			  res.redirect('/profile');
	        });		
		}
	});
});





app.post('/profile', AuthenteCheck.ensureAuthenticated, function(req, res){
	var email = req.body.email;
	var fname = req.body.firstname;
	var lname = req.body.lastname;
	var title = req.body.title;
	var email = req.body.email;
	var phone = req.body.phone;
	var username = req.body.username;
	var userDetails = req.user;
	var roles = req.body.roles;
	var noemail = true;
	if(req.body.no_email == 'on'){
		noemail = false;
	}
	if(typeof roles == "string"){
		var roles = [roles]
	}
	
	var updateData = {
		'firstname': fname,
		'lastname': lname,
		'title': title,
		'email': email,
		'phone': phone,
		'username': username,
		'roles': roles,
		'noemail': noemail
	}
	userModel.findOneAndUpdate({_id: userDetails._id}, updateData, function(err, userData) {
	  //console.log("User Updated: ",userDetails._id, updateData, userData);
	  res.redirect('/profile')
	});
});

app.get('/folderedit', AuthenteCheck.ensureAuthenticated, function(req, res){
	var accountsContents = fs.readFileSync("data/accounts.json");
	var userDetails = req.user;
	 foldersModel.getfolders(function(folderserr, foldersContents){ //Get/Fetch folders
 		userModel.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
 			functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
 				functions.getfolderdata(moment, (foldersContents), (contactsContents)).then((projectsData)=>{
				 	////console.log(JSON.stringify(projectsData));
				 	res.render('theme/allfolderdata', {
				 		layout: 'layout2',
				 		'folders': foldersContents,
						//'foldermenu':  foldersHeiraricalData,
						'projectsData': projectsData,
						'accounts': accountsContents, 
						'contacts': contactsContents, 
						'userDetails': userDetails
					})
				 });
 			});
		}); // End Fetching Contacts
 	}); // End Fetching folders

	});
//user registration


app.get('/dateformatProject', function(req, res){
	foldersModel.getprojects(function(folderserr, ProjectContents){ 
		$ig = 0;
		if(ProjectContents.length>0){
			async.forEachSeries(ProjectContents, function(value, callbackActive){		
				$ig++;
				myquery = { _id: value._id }
				newvalues = value;
				if(typeof value.startDate != "undefined"){
					newvalues.startDate = moment(value.startDate,'DD/MM/YYYY').format('MM/DD/YY');
					newvalues.endDate = moment(value.endDate,'DD/MM/YYYY').format('MM/DD/YY');
				}
				if(typeof value.project != "undefined"){
					newvalues.project.startDate = moment(value.project.startDate,'DD/MM/YYYY').format('MM/DD/YY');
					newvalues.project.endDate = moment(value.project.endDate,'DD/MM/YYYY').format('MM/DD/YY');
				}
				console.log(newvalues.title, newvalues.project, value.project);
				foldersModel.updateFolder(myquery, newvalues, function(err, data){
					  	console.log(data);	
					  	if($ig == ProjectContents.length){
					  		res.send("/")
					  	}else{
					  		callbackActive();
					  	}	
					  });
			});
		}
		////////res.send("list");
	});

})


app.get('/dateformatTasks', function(req, res){
	tasksModel.getalltasks(function(folderserr, taskContents){ 
		$in = 0;
		async.forEachSeries(taskContents, function(value, callbackActive){		
			$in++;
			myquery = { _id: value._id }
			newvalues = value;
			if(typeof value.dates != "undefined"){
				newvalues.dates.start = moment(value.dates.start,'DD/MM/YYYY').format('MM/DD/YY');
				newvalues.dates.due = moment(value.dates.due,'DD/MM/YYYY').format('MM/DD/YY');
			}
			tasksModel.updateTask(myquery, newvalues, function(err, data){
				  	console.log(data);
					  	if($in == taskContents.length){
					  		res.send("/")
					  	}else{
					  		callbackActive();
					  	}		
				  });
		})
		//res.send("list");
	});

});


app.get('/updateTasks', function(req, res){
	UserId = "gblue@accesselevate.com";
	userModel.getUserByEmail(UserId, function(err,alluserdetails){
		console.log(alluserdetails)
		tasksModel.getalltasks(function(folderserr, taskContents){ 
			$in = 0;
			async.forEachSeries(taskContents, function(value, callbackActive){		
				$in++;
				myquery = { _id: value._id }
				newvalues = value;
				newvalues.authorIds = [alluserdetails._id]
				tasksModel.updateTask(myquery, newvalues, function(err, data){
					  	console.log(data);
						  	if($in == taskContents.length){
						  		res.send("/")
						  	}else{
						  		callbackActive();
						  	}		
					  });
			})
			//res.send("list");
		});
	});

})


app.get('/calendar', AuthenteCheck.ensureAuthenticated, function(req, res){
	var accountsContents = fs.readFileSync("data/accounts.json");
	var userDetails = req.user;
	 foldersModel.getfolders(function(folderserr, foldersContents){ //Get/Fetch folders
 		userModel.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
 			functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
 				functions.getfolderdata(moment, (foldersContents), (contactsContents)).then((projectsData)=>{
				 	////console.log(JSON.stringify(projectsData));
				 	res.render('theme/calendar', {
				 		layout: 'layout2',
				 		'folders': foldersContents,
						//'foldermenu':  foldersHeiraricalData,
						'projectsData': projectsData,
						'accounts': accountsContents, 
						'contacts': contactsContents, 
						'userDetails': userDetails
					})
				 });
 			});
		}); // End Fetching Contacts
 	}); // End Fetching folders
});

app.get('/documents', AuthenteCheck.ensureAuthenticated, function(req, res){
	var accountsContents = fs.readFileSync("data/accounts.json");
	 var userDetails = req.user;

	 foldersModel.getfolders(function(folderserr, foldersContents){ //Get/Fetch folders
 		userModel.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
          functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
 				functions.getProjects(moment, (foldersContents), (contactsContents)).then((projectsData)=>{
				 	console.log("--line 869---",JSON.stringify(projectsData));
				 	res.render('theme/documents', {
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


app.get('/view_documents', AuthenteCheck.ensureAuthenticated, function(req, res){
	 var accountsContents = fs.readFileSync("data/accounts.json");
	 var userDetails = req.user;
	 res.render('theme/documents/6790529752789136537', {
				 		layout: 'layoutdocuments'
				 	})
});


// Set Port
app.set('port', (process.env.PORT || 81));

app.listen(app.get('port'), function(){
	//console.log('Server started on port '+app.get('port'));
});

