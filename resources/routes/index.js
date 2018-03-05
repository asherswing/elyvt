var express = require('express');
var router = express.Router();

module.exports.ensureAuthenticated = function ensureAuthenticated(req, res, callback){
	if(req.isAuthenticated()){
		//return next();
		callback(null)
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}
