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

var request = require('request');
var http = require('http');
var fs = require('fs');
var data = require("./data.js");
var moment = require('moment');
var ejs = require('ejs');
var functions = require('./resources/functions.js');
var schedule = require('node-schedule');

var tasks = require('./models/tasks');
var foldersModel = require('./models/folders');
var contacts = require('./models/contacts');
var accounts = require('./models/accounts');
var workflows = require('./models/workflows');
var invitations = require('./models/invitations');
var question_answer = require('./models/question_answers');

var mail_settings = require('./models/mail_settings');
var ConnectRoles = require('connect-roles');
var hostUrl = "http://localhost:3000";

require('dotenv').config(); //missing variable?
mongoose.connect('mongodb://localhost/loginapp'); //missing variable "connection"?
var db = mongoose.connection;

// var routes = require('./routes/index');
var users = require('./routes/users');
var roles = require('./models/roles');
var questions = require('./models/questions');
var folders = require('./routes/folders');

var AuthenteCheck = require('./routes/index');

// Init App
var app = express();

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
		}
	}	
}));
// app.registerPartials(__dirname + '/templates/theme/includes');
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
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
  console.log(req.user.roles);
  //console.log(AuthenteCheck.ensureAuthenticated);
  return true
});


// app.use('/', routes);
app.use('/users', users);
app.use('/folders', folders);

// var rolesData  = new roles({
//     title: 'security',
//     description: 'Security Role',
// });
// rolesData.save(function(err){
//    console.log('Roles Data saved');
// });

// function AuthenteCheck.ensureAuthenticated(req, res, next){
// 	if(req.isAuthenticated()){
// 		return next();
// 	} else {
// 		//req.flash('error_msg','You are not logged in');
// 		res.redirect('/users/login');
// 	}
// }

// require('./users/server/routes')(app);
// My Configurations
var $accountid= "NNx1cEtu";
var $secret="xDw3oz05F9o05r1PrXfHnLNSadYltJEOr30V7TCN4KDGERALJk2jqe35p3c4ZRhM";
var $serverPort = 3000;


var $token = null;
app.get('/authorize', AuthenteCheck.ensureAuthenticated, function (req, res) {
	
	var tokenHost = "https://www.wrike.com/oauth2/token";
	var $grant_type = "authorization_code";
	var $authorize_code = req.query.code;

	// Request Data from wrike
	request.post({
		url  :tokenHost,
		form :{'client_id':$accountid, 'client_secret':$secret, 'code': $authorize_code, 'grant_type':$grant_type}
	}, function (error, response, body) {
		if (response.statusCode == 200){
			$token = body
			$parsedToken = JSON.parse($token)
			//var getAccountPromise = data.getAccount($parsedToken)
			//console.log(getAccountPromise);
			Resources.load(require('./resources/api.js')).then(resources => {
				resources.fetchData($parsedToken).then(() => {
					resources.get('tasks').toFile('Wrike_data.HTML', '/');
					resources.toFiles();
					resources.toMongoDB();
					res.send(resources.toHTML());

				});
			});
		}
	});

});


app.get('/getData', AuthenteCheck.ensureAuthenticated, function(req, res){
		res.render('theme/getData');
});



/**
*  Dashboard
*/
app.get('/', user.can('dashboard'), function(req, res){

 // Get content from file
 //var tasksContents = fs.readFileSync("data/tasks.json");
 //var foldersContents = fs.readFileSync("data/folders.json");
 var workflowsContents = fs.readFileSync("data/workflows.json");
 var accountsContents = fs.readFileSync("data/accounts.json");
 //var contactsContents = fs.readFileSync("data/contacts.json");
 //var groupsContents = fs.readFileSync("data/groups.json");
 //var invitationsContents = fs.readFileSync("data/invitations.json");
 //var customfieldsContents = fs.readFileSync("data/customfields.json");
 //var commentsContents = fs.readFileSync("data/comments.json");
 //var timelogsContents = fs.readFileSync("data/timelogs.json");
 //var attachmentsContents = fs.readFileSync("data/attachments.json");
 var userDetails = req.user;
 
 tasks.getalltasks(function(taskserr, tasksContents){ //Get/Fetch Tasks
 	foldersModel.getfolders(function(folderserr, foldersContents){ //Get/Fetch folders
 		contacts.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
 			//console.log(foldersContents);
			functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
			 	functions.folderDashboardContent(moment, (foldersContents), (tasksContents), (contactsContents['contactdata'])).then((folderDashboardData)=>{
			 		functions.buildMilestonesTable(moment, (foldersContents), (tasksContents), (contactsContents['contactdata']), null).then((MilestonesTableContent)=>{
			 		 	res.render('theme/index', {
		 						  layout: 'layout2',
								  'tasks': tasksContents, 
								  //'tasksGanttChartContents': JSON.stringify(tasksGanttChartContents),
								  'MilestonesTableContent': MilestonesTableContent,
								  'folders': foldersContents,
								  'folderDashboardData': folderDashboardData, 
								  //'foldersHeiraricalData': foldersHeiraricalData[0],
								  'foldermenu':  foldersHeiraricalData,
								  'workflows': workflowsContents,
								  'accounts': accountsContents, 
								  'contacts': contactsContents['contactdata'], 
								  //'groups':groupsContents,
								  //'invitations':invitationsContents,
								  //'customfields':customfieldsContents,
								  //'comments':commentsContents,
								  //'timelogs':timelogsContents,
								  //'attachments':attachmentsContents,
								  'userDetails': userDetails
						});
		 			});
		 		});
	 		});
		}); // End Fetching Contacts
	 }); // End Fetching folders
  }); // End Fetching tasks
}); // End Dashbord Function


/**
* Function Gantt-chart
* Return Void
*/
app.get('/gantt-chart',  AuthenteCheck.ensureAuthenticated, function(req, res){
	 //var tasksContents = fs.readFileSync("data/tasks.json");
	 //var foldersContents = fs.readFileSync("data/folders.json");
	 //var workflowsContents = fs.readFileSync("data/workflows.json");
	 var accountsContents = fs.readFileSync("data/accounts.json");
	 //var contactsContents = fs.readFileSync("data/contacts.json");
	 // var groupsContents = fs.readFileSync("data/groups.json");
	 // var invitationsContents = fs.readFileSync("data/invitations.json");
	 // var customfieldsContents = fs.readFileSync("data/customfields.json");
	 // var commentsContents = fs.readFileSync("data/comments.json");
	 // var timelogsContents = fs.readFileSync("data/timelogs.json");
	 // var attachmentsContents = fs.readFileSync("data/attachments.json");
	 var userDetails = req.user;

	 tasks.getalltasks(function(taskserr, tasksContents){ //Get/Fetch Tasks
	 	foldersModel.getfolders(function(folderserr, foldersContents){ //Get/Fetch folders
	 		contacts.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts

				 functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
			 	    functions.taskGanntChart(moment, (tasksContents), null, (contactsContents['contactdata']), (foldersContents)).then((tasksGanttChartContents)=>{
			 		 	
			 	    	//console.log("tasksGanttChartContents Line 294", tasksGanttChartContents);
			 		 	res.render('theme/gantt_chart', {
 						  layout: 'layout2',
						  'tasks': tasksContents, 
						  'tasksGanttChartContents': JSON.stringify(tasksGanttChartContents),
						  'folders': foldersContents,
						  'foldermenu':  foldersHeiraricalData,
						  'accounts': accountsContents, 
						  'contacts': contactsContents['contactdata'], 
						  'userDetails': userDetails
						});
 		   			});
			    });
			}); // End Fetching Contacts
	 	}); // End Fetching folders
 	 }); // End Fetching tasks
}); // End Function Gantt-Chart



app.get('/projects', AuthenteCheck.ensureAuthenticated, function(req, res){
	 //var foldersContents = fs.readFileSync("data/folders.json");
	 //var contactsContents = fs.readFileSync("data/contacts.json");
	 var accountsContents = fs.readFileSync("data/accounts.json");
	 var userDetails = req.user;

	 foldersModel.getfolders(function(folderserr, foldersContents){ //Get/Fetch folders
 		contacts.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
			 functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
				 functions.getProjects(moment, (foldersContents), (contactsContents['contactdata'])).then((projectsData)=>{
				 	res.render('theme/projects', {
				 		layout: 'layout2',
				 		'folders': foldersContents,
						'foldermenu':  foldersHeiraricalData,
						'projectsData': projectsData,
						'accounts': accountsContents, 
						'contacts': contactsContents['contactdata'], 
						'userDetails': userDetails
				 	})
				 });
			 });
		}); // End Fetching Contacts
 	}); // End Fetching folders

});



/**
*  Function Tasks
* return void
*/
app.get('/tasks', AuthenteCheck.ensureAuthenticated, function(req, res){

	// Get content from file
 //var tasksContents = fs.readFileSync("data/tasks.json");
 //var foldersContents = fs.readFileSync("data/folders.json");
 var workflowsContents = fs.readFileSync("data/workflows.json");
 var accountsContents = fs.readFileSync("data/accounts.json");
 //var contactsContents = fs.readFileSync("data/contacts.json");
 //var groupsContents = fs.readFileSync("data/groups.json");
 //var invitationsContents = fs.readFileSync("data/invitations.json");
 //var customfieldsContents = fs.readFileSync("data/customfields.json");
 //var commentsContents = fs.readFileSync("data/comments.json");
 //var timelogsContents = fs.readFileSync("data/timelogs.json");
 //var attachmentsContents = fs.readFileSync("data/attachments.json");
 var userDetails = req.user;

 
 tasks.getalltasks(function(taskserr, tasksContents){ //Get/Fetch Tasks
 	foldersModel.getfolders(function(folderserr, foldersContents){ //Get/Fetch folders
 		contacts.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
			functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
			 	functions.folderDashboardContent(moment, (foldersContents), (tasksContents), (contactsContents['contactdata'])).then((folderDashboardData)=>{
			 		functions.taskGanntChart(moment, (tasksContents),null, (contactsContents['contactdata']), (foldersContents)).then((tasksGanttChartContents)=>{
			 		 	res.render('theme/tasks', {
		 						  layout: 'layout2',
								  'tasks': tasksContents, 
								  'tasksGanttChartContents': JSON.stringify(tasksGanttChartContents),
								  'folders': foldersContents,
								  'folderDashboardData': folderDashboardData, 
								  //'foldersHeiraricalData': foldersHeiraricalData[0],
								  'foldermenu':  foldersHeiraricalData,
								  'workflows': workflowsContents,
								  'accounts': accountsContents, 
								  'contacts': contactsContents['contactdata'], 
								  //'groups':groupsContents,
								  //'invitations':invitationsContents,
								  //'customfields':customfieldsContents,
								  //'comments':commentsContents,
								  //'timelogs':timelogsContents,
								  //'attachments':attachmentsContents,
								  'userDetails': userDetails
						});
		 			});
		 		});
	 		});
		}); // End Fetching Contacts
	 }); // End Fetching folders
  }); // End Fetching tasks
}); // End Tasks Function


app.get('/settings', AuthenteCheck.ensureAuthenticated, function(req, res){
	// var tasksContents = fs.readFileSync("data/tasks.json");
	// var contactsContents = fs.readFileSync("data/contacts.json");
 	//var foldersContents = fs.readFileSync("data/folders.json");
 	var userDetails = req.user;

 	foldersModel.getfolders(function(folderserr, foldersContents){ //Get/Fetch folders
	 	functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
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
	       console.log('mail settings saved')
	    });

		req.flash('success_msg', 'Settings Successfully Saved');

		res.redirect('/settings');
});

app.get('/task', AuthenteCheck.ensureAuthenticated, function(req, res){
	var taskID = req.query.id;
 	var userDetails = req.user;
	tasks.gettaskbyId(taskID, function(taskserr, taskdetails){ //Get/Fetch Tasks
		foldersModel.getfolders(function(folderserr, foldersContents){ //Get/Fetch folders
	 		contacts.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
				functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
					question_answer.getQuestionAnswers(taskID, function(err, QuestionAnswersData){ 
						roles.getallroles(function(roleErr, rolesDetails){
							res.render('theme/taskdetails', {
								layout: 'layout2',
								'taskdetails':  taskdetails,
								'taskID': taskID,
								'contacts':  contactsContents['contactdata'],
								'foldermenu':  foldersHeiraricalData,
								'userDetails': userDetails,
								'roles': rolesDetails ,
								'QuestionAnswersData': QuestionAnswersData
							});
						});	
					});					
				});
			}); // End Fetching Contacts
	    }); // End Fetching folders
	}); // End Fetching tasks
});

app.post('/task/update', AuthenteCheck.ensureAuthenticated, function(req, res){
	var taskId = req.body.taskId;
	console.log("Line 459,,,,,,,,,,,,", req.body.roles);
	var taskentrydata = {
		title: req.body.task_name,
		description: req.body.description,
		briefDescription: req.body.briefDescription,
		roles: req.body.roles
	};
	if(req.body.startDate){
		taskentrydata['dates'] = {
			'type': 'Planned',
			'start': req.body.startDate,
			'due': req.body.due
		}
	}

	tasks.findOneAndUpdate({_id: taskId}, taskentrydata, function(err, taskentrydata) {
	  console.log("Task Updated");
	  res.redirect('/task/?id='+taskId)
	});
});

app.get('/task/delete', AuthenteCheck.ensureAuthenticated, function(req, res){
	var taskID = req.query.id;
 	var userDetails = req.user;
	tasks.deletetask(taskID, function(taskserr, taskdetails){ //Get/Fetch Tasks
		question_answers.handlebars
		res.redirect('/');
	}); // End Fetching tasks

});


app.get('/task/answer', AuthenteCheck.ensureAuthenticated, function(req, res){
	var questionID = req.query.id
 	var userDetails = req.user
 	foldersModel.getfolders(function(folderserr, foldersContents){ //Get/Fetch folders
	 		contacts.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
				functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
					question_answer.getQuestionbyId(questionID, function(questionserr, questiondetails){ //Get/Fetch Tasks
						console.log(questiondetails);
						res.render('theme/question_answers', {
												layout: 'layout2',
												'questionID': questionID,
												'questiondetails': questiondetails,
												'contacts':  contactsContents['contactdata'],
												'foldermenu':  foldersHeiraricalData,
												'userDetails': userDetails
											});
						//res.send('success');
						//res.redirect('/');
					}); // End Fetching tasks
				}); // End Fetching Contacts
	    }); // End Fetching folders
	}); // End Fetching tasks

});

app.post('/task/createquestions', AuthenteCheck.ensureAuthenticated,  function(req, res){
	console.log(req.body);
	var newQuestionAnswer = new question_answer({
		user: req.user,
		taskid: req.body.taskId,
		question: req.body.question,
		answer: req.body.answer
	});
	newQuestionAnswer.save(function(err, data) {
       console.log('Task Question saved', data);
       answerLink = hostUrl+'/task/answer/?id='+data._id;
       if(req.body.answer==''){
		//send Mail if answer is empty
		mail_settings.get_mail_settings(function(err, mailSettingsData){
		 var from_email = mailSettingsData.from_email;
		 res.render('theme/email/questionAnswers', {
				 						  layout: 'layout2',
										  'question': req.body.question, 
										  'answerLink': answerLink
										  },  function(err, list){
											//console.log(list);							
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
										        subject: 'Elevate: Answer the Questions',
										        text: 'Elevate: Answer the Questions.\n',
										        html: list
										      };
										      emailResponse = sgMail.send(msg); 
										      res.redirect('/task/?id='+req.body.taskId);
											});
			});
		}else{
			res.redirect('/task/?id='+req.body.taskId);
		}
    });
});


app.post('/task/updatequestions', AuthenteCheck.ensureAuthenticated,  function(req, res){
	var questionId = req.body.questionID;

	var newQuestionAnswerData = {
		question: req.body.question,
		answer: req.body.answer
	};

	question_answer.findOneAndUpdate({_id: questionId}, newQuestionAnswerData, function(err, questionentrydata) {
	  console.log("Question Updated");
	  res.redirect('/');
	});

});



app.get('/workflows', AuthenteCheck.ensureAuthenticated, function(req, res){
	var taskID = req.query.id;
 	
	var tasksContents = fs.readFileSync("data/tasks.json");
	var contactsContents = fs.readFileSync("data/contacts.json");
 	var foldersContents = fs.readFileSync("data/folders.json");
 	var userDetails = req.user;
    /*tasks.getalltasks(function(taskserr, tasksContents){ //Get/Fetch Tasks
		foldersModel.getfolders(function(folderserr, foldersContents){ //Get/Fetch folders
			contacts.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts*/
				functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
						res.render('theme/taskdetails', {
							layout: 'layout2',
							'tasks':  tasksContents,
							'taskID': taskID,
							'contacts':  contactsContents,
							'foldermenu':  foldersHeiraricalData,
							'userDetails': userDetails
						});
				});
			/*}); // End Fetching Contacts
		}); // End Fetching folders
    }); // End Fetching tasks*/
});

app.get('/contacts', AuthenteCheck.ensureAuthenticated, function(req, res){

	//var contactsContents = fs.readFileSync("data/contacts.json");
 	//var foldersContents = fs.readFileSync("data/folders.json");
 	var userDetails = req.user;

 	foldersModel.getfolders(function(folderserr, foldersContents){ //Get/Fetch folders
	 	contacts.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
		 	functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
		 		functions.contactsHTML(contactsContents['contactdata']).then((contactsHTML)=>{
					res.render('theme/contacts', {
						layout: 'layout2',
						'contacts':  contactsContents['contactdata'],
						'contactsHTML': contactsHTML,
						'foldermenu':  foldersHeiraricalData,
						'userDetails': userDetails
					});
				});
			});
		}); // End Fetching Contacts
	}); // End Fetching folders

});


app.get('/kanban', AuthenteCheck.ensureAuthenticated, function(req, res){
	var userDetails = req.user;
	var kanbanHTML = '';
	foldersModel.getfolders(function(folderserr, foldersContents){ //Get/Fetch folders
	 	contacts.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
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
* Email Dashboard
*/
app.get('/emailDashboard', function(req, res){

	// Get content from file
 //var tasksContent = fs.readFileSync("data/tasks.json");
 //var foldersContents = fs.readFileSync("data/folders.json");
 //var workflowsContents = fs.readFileSync("data/workflows.json");
 //var accountsContents = fs.readFileSync("data/accounts.json");
 //var contactsContents = fs.readFileSync("data/contacts.json");
 //var groupsContents = fs.readFileSync("data/groups.json");
 //var invitationsContents = fs.readFileSync("data/invitations.json");
 //var customfieldsContents = fs.readFileSync("data/customfields.json");
 //var commentsContents = fs.readFileSync("data/comments.json");
 //var timelogsContents = fs.readFileSync("data/timelogs.json");
 //var attachmentsContents = fs.readFileSync("data/attachments.json");
 //var userDetails = req.user
	
	mail_settings.get_mail_settings(function(err, mailSettingsData){
	 var from_email = mailSettingsData.from_email;
	 tasks.getalltasks(function(taskserr, tasksContents){ //Get/Fetch Tasks
	 	foldersModel.getfolders(function(folderserr, foldersContents){ //Get/Fetch folders
	 		contacts.getcontacts(function(contactserr, contactsContents){ //Get/Fetch Contacts
				 functions.tasksEmailContent(moment, foldersContents, tasksContents, contactsContents['contactdata']).then((tasksContentData)=>{
				 	functions.buildMilestonesEmailTable(moment, (foldersContents), (tasksContents), (contactsContents['contactdata']), null).then((MilestonesTableContent)=>{
				 	res.render('theme/email/dashboard', {
			 						  layout: 'layout2',
									  'tasks': tasksContentData, 
									  'MilestonesTableContent': MilestonesTableContent,
									  },  function(err, list){
										//console.log(list);							
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
									        subject: 'Elevate Weekly Dashboard',
									        text: 'Elevate Weekly Dashboard.\n',
									        html: list
									      };
									      emailResponse = sgMail.send(msg); 
									     // console.log(userDetails.email)
									      res.send('list')

										});
				 		});
			 		});
				});
	 		});
	 	});
	});
});
	


/**
Mail Cron Schedular
**/
mail_settings.get_mail_settings(function(err, mailSettingsData){
	console.log('Cron Started');
	console.log(mailSettingsData);
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
		console.log('The answer to life, the universe, and everything!');

		var request = require('request');
		request('http://localhost:3000/emailDashboard', function (error, response, body) {
		  console.log('error:', error); // Print the error if one occurred
		  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
		  console.log('body:', body); // Print the HTML for the Google homepage.
		});

	});
//console.log('The answer to life, the universe, and everything!');
});


// Set Port
app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});
