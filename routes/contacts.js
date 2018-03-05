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
var tasks = require('../models/tasks');
var functions = require('../resources/functions.js');
var logs = require('../models/logs');
var AuthenteCheck = require('../routes/index');

require('dotenv').config();

router.get('/register', function(req, res){
	res.render('register');
});

router.get('/list', AuthenteCheck.ensureAuthenticated, function(req, res){
   
	var userDetails = req.user;
	foldersModel.getfolders(function(folderserr, foldersContents){
		userModel.getAllUser(userDetails._id, function(contactserr, userdata){
			
			functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
				functions.getcontacts(userdata).then((contactsHTML)=>{
					console.log("=======Line No 32=========",userdata)
					res.render('theme/contacts/list', {
						layout: 'layout2',
						//'contacts':  contactsContents['contactdata'],
						'contactsHTML': contactsHTML,
						'foldermenu':  foldersHeiraricalData,
						'userDetails': userDetails,
					});
				});
			});
		}); // End Fetching Contacts
	}); // End Fetching folders
});



router.get('/add', AuthenteCheck.ensureAuthenticated, function(req, res){
	var userDetails = req.user;
	roles.getallroles(function(roleErr, rolesDetails){
	res.render('theme/contacts/contactregister', {
     layout: 'layout2',
	'roles': rolesDetails,
	'userDetails': userDetails, 
});
	});
});

router.get('/edit', AuthenteCheck.ensureAuthenticated, function(req, res){
	var UserId = req.query.id;
	var userDetails = req.user;
	
	foldersModel.getfolders(function(folderserr, foldersContents){
	roles.getallroles(function(roleErr, rolesDetails){
    userModel.getUserById(UserId, function(err,alluserdetails){ //Get/Fetch folders
		var checkhtml='';
		
		noemailhtml = '<input type="checkbox"  name="no_email">'
      if(alluserdetails.noemail == false){
         //console.log("-------line no 69");
			noemailhtml = '<input type="checkbox"  name="no_email" checked>';
			
		}
		var rolesID = alluserdetails.roles;
		//console.log("--", rolesID);
        for (var rolesdata in  rolesDetails){
			checkhtml += '<span><input type="checkbox" value="'+rolesDetails[rolesdata]['_id']+'" name="roles"';
			for(var roleItem in rolesID){	
				if(typeof rolesID[roleItem]._id !== "undefined"){
					if(rolesID[roleItem].roles.indexOf(rolesDetails[rolesdata]['_id']) != -1){
						checkhtml += "checked";
					}
				}
			}
				checkhtml += '>'+rolesDetails[rolesdata]['title']+'</span></br>';
			//}
		}
functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
			res.render('theme/contacts/updatecontact', {
				layout: 'layout2',
				'foldermenu':  foldersHeiraricalData,
				'alluserdetails': alluserdetails,
                'userDetails': userDetails,   
				'roles': checkhtml,
				'noemailhtml': noemailhtml,
			
			});
		
	});
   

 });

});
});
});
router.post('/register', function(req, res){
	//console.log("------line no 106-----",req.body.no_email);
	var noemail = true;
	if(req.body.no_email == 'on'){
		var noemail = false;
	}
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var roles = req.body.roles;
  var avatarUrl = req.body.avtarurl;
  var phone = req.body.phone;
	var email = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;
    req.checkBody('firstname', 'First Name is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
    var errors = req.validationErrors();
    console.log("errors",errors);
    if(errors){
		res.render('theme/contacts/list',{
			errors:errors
		});
	} else {
		var newUser = new userModel({


	  firstname: firstname,
      lastname: lastname,
      phone: phone,
      type: 'person',
      roles: [roles],
      deleted: false,
	  email:email,
	  avatarUrl: avatarUrl,
	  password: password,
	  noemail : noemail
		});

		userModel.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'You are registered Successfully');

		res.redirect('/contact/list');
	}
});

router.post('/edit', AuthenteCheck.ensureAuthenticated, function(req, res){
	//console.log("------narendra---",req.body.no_email);
	var noemail = true;
	if(req.body.no_email == 'on'){
		noemail = false;
	}

	var userID = req.query.id;
	var email = req.body.email;
	var fname = req.body.firstname;
	var lname = req.body.lastname;
	
	var email = req.body.email;
	var phone = req.body.phone;
	var roles = req.body.roles;
	//console.log("======Line Of 170 ======",typeof roles);
	if(typeof roles == "string"){
		var roles = [roles]
	}
	var updateData = {
		'firstname': fname,
		'lastname': lname,
		
		'email': email,
		'phone': phone,
		'roles': roles,
		'noemail': noemail
	}
	userModel.findOneAndUpdate({_id: userID}, updateData, function(err, userData) {
	  //console.log("User Updated: ",userID, updateData, userData);
	  res.redirect('/contact/list')
	});
});


router.get('/delete', AuthenteCheck.ensureAuthenticated, function(req, res){
	var contactID = req.query.id;
	var userDetails = req.user;
	foldersModel.getprojects(function(folderserr, foldersData){
		
async.forEachSeries(foldersData, function(value, callback){
	console.log("-------Line No 100--------",contactID,value );
      if(value['projectManager'] == contactID || value['buildingManager'] == contactID || value['clientprojectManager'] == contactID || value['clientlaunchManager'] == contactID || value['uiManager'] == contactID || value['securityManager'] == contactID || value['securityintegratorManager'] == contactID || value['conceirageManager'] == contactID || value['communicationManager'] == contactID || value['eventsManager'] == contactID || value['foodandbeverageManager'] == contactID || value['facilityManager'] == contactID){
         req.flash('success_msg', 'Contact Already used in Project');
      	//res.send('<script>alert("")</script>')
      	res.redirect('/contact/list');
      } 
	 
	   else{
	   	userModel.getUserID(contactID, function(err, ContactData){
	var newLogs = new logs({
		    log_type: 'Contact',
	        log_content: '',
			action: 'Delete',
			old_data: '',
			new_data: "Contact has been Delete by user "+ userDetails.firstname+" "+userDetails.lastname+".",
	    	created_at: moment().format('MM/DD/YY'),
	        log_type_id: contactID,
	        log: '',
	        user_id: userDetails	      
	    });

	    logs.createLogs(newLogs, function(err, logs){
	    	if(err) throw err;
	      console.log(logs);
	    });
	});
		userModel.deletecontact(contactID, function(taskserr, contactdetails){ //Get/Fetch Tasks
		res.redirect('/contact/list');
       });
	
	 }
	}); // End Fetching contact
});
});
router.post('/api/edit/emailsetting',function(req, res){
console.log("Narendra",req.body.email_setting)
	var contactId = req.body.id
	
	if(contactId != null){
		var myquery = { _id: contactId };
		var newvalues = {
			'email_setting' : req.body.email_setting,
			
		};
userModel.updatecontact(myquery, newvalues, function(err, data){
		  	////console.log(data);
		  	res.send('/email/settings');			
		  });
	}else{
		res.send(null);
	}
});

module.exports = router;