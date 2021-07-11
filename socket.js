//var socket_controller=require('./socket_controller');
var lib=require('./lib');
const { v4: uuidv4 } = require('uuid');

module.exports=(io)=>{
	io.on("connection",async(socket)=>{
		let name=await socket.handshake.query.name;
		let room=await socket.handshake.query.room;
		let user=await User.findOne({account: name});
		if(user){
			await socket.join(user.rooms);
		}
	});
}