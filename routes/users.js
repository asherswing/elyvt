var express = require('express');
var router = express.Router();
var cookieParser = require('cookie-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt-nodejs');
var async = require('async');
var crypto = require('crypto');
var base64 = require('base-64');

var User = require('../models/user');
require('dotenv').config()

// Register
router.get('/register', function(req, res){
	res.render('register');
});
router.get('/userregister',function(req, res){
  res.render('userregister');
});
router.get('/userrprojectegister',function(req, res){
  res.render('userrprojectegister');
});
// Login
router.get('/login', function(req, res){
  redirectURL = '/';
  if(req.query.redirect){
    redirectURL = req.query.redirect;
  }
	res.render('login', {'redirectURL':redirectURL});
});

// Register User
router.post('/register', function(req, res){
	var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var title = req.body.title;
  var roles = req.body.roles;
  var avatarUrl = req.body.avatarUrl;
  var phone = req.body.phone;
	var email = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validation
	req.checkBody('firstname', 'First Name is required').notEmpty();
  req.checkBody('lastname', 'Last Name is required').notEmpty();
  req.checkBody('title', 'Title field is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
		res.render('register',{
			errors:errors
		});
	} else {
		var newUser = new User({
			firstname: firstname,
      lastname: lastname,
      title: title,
      phone: phone,

      type: 'person',
      roles: roles,
      deleted: false,
			email:email,
			username: email,
			password: password
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'You are registered and can now login');

		res.redirect('/users/login');
	}
});

router.post('/userrprojectegister', function(req, res){
  //var projectid =req.body.projectID;
  //cookies store
  var projectManager = req.body.projectManager;
  var ClientManager = req.body.ClientManager;
  var BuildingManager = req.body.BuildingManager;
  var UIManager = req.body.UIManager;
  var SecurityManager = req.body.SecurityManager;
  var SecurituintegrityManager = req.body.SecurituintegrityManager;
  var ConceirageManager = req.body.ConceirageManager;
  var CommunticationManager = req.body.CommunticationManager;
  var EventsManager = req.body.EventsManager;
  var FacilityManager = req.body.FacilityManager;
  var FoodvebrageManager = req.body.FoodvebrageManager;
  var clientlauncherManager = req.body.clientlauncherManager;
  

  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var title = req.body.title;
  var email = req.body.email;
  var password = req.body.password;
  var password2 = req.body.password2;

  // Validation
  req.checkBody('firstname', 'First Name is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);


var errors = req.validationErrors();
if(errors){
    res.redirect('/folders/new-project/?projectManager='+projectManager+'&&Buldingmanager='+BuildingManager+'&&ClientManager='+ClientManager+'&&UIManager='+UIManager+'&&SecurityManager='+SecurityManager+'&&SecurituintegrityManager='+SecurituintegrityManager+'&&ConceirageManager='+ConceirageManager+'&&CommunticationManager='+CommunticationManager+'&&EventsManager='+EventsManager+'&&FacilityManager='+FacilityManager+'&&FoodvebrageManager='+FoodvebrageManager+'&&clientlauncherManager='+clientlauncherManager);
      
    
  } else {
    var newUser = new User({
      firstname: firstname,
      lastname: lastname,
      title: title,
      deleted: false, 
      email:email,
     // username: username,
      password: password
    });

    User.createUser(newUser, function(err, user){
      if(err) throw err;
      console.log(user);
    });
res.redirect('/folders/new-project/?projectManager='+projectManager+'&&Buldingmanager='+BuildingManager+'&&ClientManager='+ClientManager+'&&UIManager='+UIManager+'&&SecurityManager='+SecurityManager+'&&SecurituintegrityManager='+SecurituintegrityManager+'&&ConceirageManager='+ConceirageManager+'&&CommunticationManager='+CommunticationManager+'&&EventsManager='+EventsManager+'&&FacilityManager='+FacilityManager+'&&FoodvebrageManager='+FoodvebrageManager+'&&clientlauncherManager='+clientlauncherManager);
  }
});

router.post('/usertaskregister', function(req, res){
  //cookies store
  var taskId = req.body.taskId;
  var title = base64.encode(req.body.title);
  var description = base64.encode(req.body.description);
  var startDate = base64.encode(req.body.startDate);
  var endDate = base64.encode(req.body.endDate);
  var status = base64.encode(req.body.status);
  
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var title = req.body.title;
  var email = req.body.email;
  //var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

  // Validation
  req.checkBody('firstname', 'First Name is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  //req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);


var errors = req.validationErrors();
if(errors){
    res.redirect('/task/?id='+taskId+'&&title='+title+'&&description='+description+'&&startDate='+startDate+'&&endDate='+endDate+'&&status='+status);
  } else {
    var newUser = new User({
      firstname: firstname,
      lastname: lastname,
      title: title,
      deleted: false, 
      email:email,
      //username: username,
      password: password
    });

    User.createUser(newUser, function(err, user){
      if(err) throw err;
      console.log(user);
    });
    res.redirect('/task/?id='+taskId+'&&title='+title+'&&description='+description+'&&startDate='+startDate+'&&endDate='+endDate+'&&status='+status);
  }
});


router.post('/userFolderRegister', function(req, res){
  //cookies store
  var taskId = req.body.taskId;
  var title = base64.encode(req.body.title);
  var description = base64.encode(req.body.description);
  var startDate = base64.encode(req.body.startDate);
  var endDate = base64.encode(req.body.endDate);
  var status = base64.encode(req.body.status);
  
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var title = req.body.title;
  var email = req.body.email;
  //var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

  // Validation
  req.checkBody('firstname', 'First Name is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  //req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);


var errors = req.validationErrors();
if(errors){
    res.redirect('/edit/folderdata/?id='+taskId+'&&title='+title+'&&description='+description+'&&startDate='+startDate+'&&endDate='+endDate+'&&status='+status);
  } else {
    var newUser = new User({
      firstname: firstname,
      lastname: lastname,
      title: title,
      deleted: false, 
      email:email,
      username: username,
      password: password
    });

    User.createUser(newUser, function(err, user){
      if(err) throw err;
      console.log(user);
    });
    res.redirect('/edit/folderdata/?id='+taskId+'&&title='+title+'&&description='+description+'&&startDate='+startDate+'&&endDate='+endDate+'&&status='+status);
  }
});

router.post('/userregister', function(req, res){
  var projectid =req.body.projectID;
  //cookies store
  var projectManager = req.body.projectManager;
  var ClientManager = req.body.ClientManager;
  var BuildingManager = req.body.BuildingManager;
  var UIManager = req.body.UIManager;
  var SecurityManager = req.body.SecurityManager;
  var SecurituintegrityManager = req.body.SecurituintegrityManager;
  var ConceirageManager = req.body.ConceirageManager;
  var CommunticationManager = req.body.CommunticationManager;
  var EventsManager = req.body.EventsManager;
  var FacilityManager = req.body.FacilityManager;
  var FoodvebrageManager = req.body.FoodvebrageManager;
  var clientlauncherManager = req.body.clientlauncherManager;
  

  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var title = req.body.title;
  var email = req.body.email;
  var password = req.body.password;
  var password2 = req.body.password2;

  // Validation
  req.checkBody('firstname', 'First Name is required').notEmpty();
  req.checkBody('lastname', 'Last Name is required').notEmpty();
  req.checkBody('title', 'Title field is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);


var errors = req.validationErrors();
if(errors){
    res.redirect('/edit/project/?id='+projectid+'&&projectManager='+projectManager+'&&Buldingmanager='+BuildingManager+'&&ClientManager='+ClientManager+'&&UIManager='+UIManager+'&&SecurityManager='+SecurityManager+'&&SecurituintegrityManager='+SecurituintegrityManager+'&&ConceirageManager='+ConceirageManager+'&&CommunticationManager='+CommunticationManager+'&&EventsManager='+EventsManager+'&&FacilityManager='+FacilityManager+'&&FoodvebrageManager='+FoodvebrageManager+'&&clientlauncherManager='+clientlauncherManager);
      
    
  } else {
    var newUser = new User({
      firstname: firstname,
      lastname: lastname,
      title: title,
      deleted: false, 
      email:email,
      password: password
    });

    User.createUser(newUser, function(err, user){
      if(err) throw err;
      console.log(user);
    });
res.redirect('/edit/project/?id='+projectid+'&&projectManager='+projectManager+'&&Buldingmanager='+BuildingManager+'&&ClientManager='+ClientManager+'&&UIManager='+UIManager+'&&SecurityManager='+SecurityManager+'&&SecurituintegrityManager='+SecurituintegrityManager+'&&ConceirageManager='+ConceirageManager+'&&CommunticationManager='+CommunticationManager+'&&EventsManager='+EventsManager+'&&FacilityManager='+FacilityManager+'&&FoodvebrageManager='+FoodvebrageManager+'&&clientlauncherManager='+clientlauncherManager);
  }
});
router.get('/forgot', function(req, res) {
  res.render('forgot', {
    user: req.user
  });
});

passport.use('local-one', new LocalStrategy(
  function(username, password, done) {
   User.getUserByEmail(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.use('local-two', new LocalStrategy({ // or whatever you want to use
    usernameField: 'username', 
    passwordField: 'username'  
  },  
  function(username, username, done) {
   User.getUserByUsername(username, function(err, user){
    if(err) throw err;
    if(!user){
      return done(null, false, {message: 'Unknown User'});
    }
    else{
      return done(null, user);
    }
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local-one', {failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
    console.log("-------",req.user);
    res.cookie('remember-me' , base64.encode(req.user._id), { expires: new Date(Date.now() + 15778476000), httpOnly: true });
    res.cookie('user' , req.user, { expires: new Date(Date.now() + 900000), httpOnly: true });
    if(req.body.redirectURL != '/'){
      var redirectURL = req.body.redirectURL
      var url = base64.decode(redirectURL);
      console.log("--success--", url);
      res.redirect(url);
    }else{
      res.redirect('/');
    }
    
    
  });

router.get('/logout', function(req, res){
  res.clearCookie("remember-me");
  res.clearCookie("user");
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/users/login');
});


router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {

      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const msg = {
        to: user.email,
        from: 'info@elyvt.com',
        subject: 'Elevate Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/users/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      sgMail.send(msg);      
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/users/forgot');
  });
});


router.get('/reset/:token', function(req, res) {
  console.log("req.params.token", req.params.token);
  console.log("date", Date.now())
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/users/forgot');
    }
    res.render('reset', {
      user: req.user
    });
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        User.updateUser(user, function(err, user){
          if(err) throw err;
          console.log(user);
        });

      });
    },
    function(user, done) {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const msg = {
        to: user.email,
        from: 'info@elevate.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      sgMail.send(msg); 
      
    }
  ], function(err) {
    res.redirect('/users/login');
  });
});


router.get('/emailRedirect',
  passport.authenticate('local-two', {}),
  function(req, res) {
    console.log("=================")
    console.log(req);
    res.cookie('remember-me' , base64.encode(req.user._id));
    if(req.query.taskId){
      req.query.url = req.query.url+'&taskId='+req.query.taskId
    }
    res.redirect(req.query.url);
  });

module.exports = router;



