var express = require('express');
var base64 = require('base-64');
var router = express.Router();
var cookieParser = require('cookie-parser');

module.exports.ensureAuthenticated = function ensureAuthenticated(req, res, callback){
	console.log("Cookies :  ", req.cookies);
	if(req.cookies.user){
		req.user = req.cookies.user;	
		if(req.isAuthenticated()){
			//return next();
			callback(null)
		} else {
			//req.flash('error_msg','You are not logged in');
			var url = 'http://'+req.headers.host + req.originalUrl;
			console.log("Current URL: ", url);
			var encodedURL = base64.encode(url);
			res.redirect('/users/login?redirect='+encodedURL);
		}
	}else{
		if(req.isAuthenticated()){
			//return next();
			callback(null)
		} else {
			//req.flash('error_msg','You are not logged in');
			var url = 'http://'+req.headers.host + req.originalUrl;
			console.log("Current URL: ", url);
			var encodedURL = base64.encode(url);
			res.redirect('/users/login?redirect='+encodedURL);
		}
	}
}
