var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var Message=new Schema({
	name: String,
	content: {type: String,text: true},
	room: String,
	createdate: Date
});

module.exports=mongoose.model('Message',Message);