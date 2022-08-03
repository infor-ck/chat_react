//var socket_controller=require('./socket_controller');
var User=require("./db/user");
var lib=require('./lib');
const { v4: uuidv4 } = require('uuid');

module.exports=(io)=>{
	io.on("connection",async(socket)=>{
		console.log("jizz connected");
		let name=await socket.handshake.query.name;
		let room=await socket.handshake.query.room;
		let user=await User.findOne({name: name});
		if(user){
			await socket.join(user.rooms);
		}
		socket.on("send_msg",async(content)=>{
			let msg=await lib.save_msg(content,name,room);
			io.to(room).emit("receive_data",msg);
		});
		socket.on("load_msg",async(msg_num)=>{
			let msg=await lib.load_msg(room,msg_num);
			socket.emit("receive_data",msg);
		});
		//member(array)
		socket.on("create_room",async(member)=>{
			let data=await lib.append_room(member);			
			io.emit("append_room",data);
		});

	});
}