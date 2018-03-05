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



router.get('/', AuthenteCheck.ensureAuthenticated, function(req, res){
	 var accountsContents = fs.readFileSync("data/accounts.json");
	 var userDetails = req.user;
      foldersModel.getfolders(function(folderserr, foldersContents){ //Get/Fetch folders
 		logs.getalllogs(function(logserr,logsData){
 			
 			functions.foldersHeierarcy((foldersContents)).then((foldersHeiraricalData)=>{
 				functions.getLogsData((logsData)).then((LogsTableHTML)=>{
 					foldersModel.getprojects(function(folderserr, projectContents){ 
 					//console.log("========404 line No ========",logsData)
				 	res.render('theme/logs/logslist', {
				 		layout: 'layout2',
				 		'logs' : JSON.stringify(logsData),
 						'projects': JSON.stringify(projectContents),
 						'folders': JSON.stringify(foldersContents),
                        'LogsTableHTML': LogsTableHTML,
				 		'folders': foldersContents,
				 		'foldermenu':  foldersHeiraricalData,
				 		'userDetails': userDetails,
				 		'logsTab': true
				 	})
				 });
 			});
		}); // End Fetching Contacts
 	}); // End Fetching folders
});

});


module.exports = router;