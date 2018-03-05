var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

var User = require('./user.js')

var mail_settingsSchema = new Schema({
	user: [
      {type: Schema.Types.ObjectId, ref: 'User'}
    ],
    from_email: { type: String },
    day_of_week: { type: String },
    hour_of_day: { type: String },
    minute_of_hour: { type: String }
});




var mail_settings = module.exports = mongoose.model('mail_settings', mail_settingsSchema);



module.exports.get_mail_settings = function( callback){
	var query = {};
	mail_settings.findOne(query, callback);
}

