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

router.get('/list', AuthenteCheck.ensureAuthenticated, function(req, res){
	var userDetails = req.user;
	foldersModel.getfolders(function(folderserr, foldersContents){
		roles.getallroles(function(roleserr, rolesdata){
			functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
				functions.getroles(rolesdata).then((rolessHTML)=>{
					res.render('theme/roles/list', {
						layout: 'layout2',
						//'contacts':  contactsContents['contactdata'],
						'rolessHTML': rolessHTML,
						'foldermenu':  foldersHeiraricalData,
						'userDetails': userDetails
					});
				});
			});
		}); // End Fetching Contacts
	}); // End Fetching folders
});

router.get('/add', AuthenteCheck.ensureAuthenticated, function(req, res){
	var userDetails = req.user;
	res.render('theme/roles/add', {
	 layout: 'layout2',
	'userDetails': userDetails, 
});
});

router.post('/add', AuthenteCheck.ensureAuthenticated, function(req, res){
	var title = req.body.rolestitle;
	
	var NewRoles = new roles({ 
		'title': title,
        
	});
	roles.createRoles(NewRoles, function(err, user){
      if(err) throw err;
      //console.log(roles);
    });
    res.redirect('/role/list');
});

router.get('/edit', AuthenteCheck.ensureAuthenticated, function(req, res){
	//console.log("-------narendra yadav------",req.query.id);
	var userDetails = req.user;
	var rolesId = req.query.id;
	foldersModel.getfolders(function(folderserr, foldersContents){
	roles.getrolesbyId(rolesId, function(err,allrolesdetails){ //Get/Fetch folders
		functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
			res.render('theme/roles/edit', {
				layout: 'layout2',
				'foldermenu':  foldersHeiraricalData,
				'allrolesdetails': allrolesdetails,
				'userDetails': userDetails,
			});
		});
	});

 });
});

router.post('/edit/', AuthenteCheck.ensureAuthenticated, function(req, res){
	var RolesID = req.query.id;
	var title =req.body.rolestitle;
	//console.log("I love india", title)
	var updateData = {
		'title' : title
	}
	roles.findOneAndUpdate({_id:RolesID}, updateData, function(err, rolesData){
		res.redirect('/role/list')
	});
});

router.get('/delete', AuthenteCheck.ensureAuthenticated, function(req, res){
	var rolesID = req.query.id;
	var userDetails = req.user;
	roles.getrolesbyId(rolesID, function(err, RolesData){
	var newLogs = new logs({
		    log_type: 'Roles',
	        log_content: RolesData.title,
			action: 'Delete',
			old_data: '',
			new_data: "Roles "+RolesData.title+"  has been Delete by user "+ userDetails.firstname+" "+userDetails.lastname+".",
	    	created_at: moment().format('MM/DD/YY'),
	        log_type_id: rolesID,
	        log: RolesData.title,
	        user_id: userDetails	      
	    });

	    logs.createLogs(newLogs, function(err, logs){
	    	if(err) throw err;
	      console.log(logs);
	    });
	});
	roles.deleteroles(rolesID, function(projecterr, rolesdetails){ //Get/Fetch Tasks
		res.redirect('/role/list');
	}); 

});

module.exports = router;