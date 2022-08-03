var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var User=new Schema({
	name: String,
	pwd: String,
	rooms: [String],
	friends: [String]
})

module.exports=mongoose.model('User',User);