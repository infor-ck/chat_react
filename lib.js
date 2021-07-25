var User=require("./db/user");
var Room = require("./db/room");
var Msg=require("./db/msg");
var crypto=require('crypto');
const { v4: uuidv4 } = require('uuid');

/*
ref:
	login
		-create_crypto
	register
		-create_crypto
		-create_user
			-create_room
				-set_name
				-init_msg
	init_data
		-check_status
		-load_room
		-load_friends
		-load_messages
	append_room
		-create_room
			-set_name
			-init_msg
	save_msg
	load_msg
		-load_messages
*/

exports.login=async(name,pwd)=>{
	let msg=new Object();
	let user=await User.findOne({name: name});
	let res_pwd=create_crypto(pwd,"secret_key");
	if(name===""||pwd===""){
		msg.code=204;
		msg.con="name or password empty at login";
	}
	else if(!user){
		msg.code=404;
		msg.con="user not exists";
	}
	else if(res_pwd!=user.pwd){
		msg.code=406;
		msg.con="password not correct";
	}
	else{
		msg.code=200;
		msg.num=user.rooms[0];
	}
	return msg;
}

var create_crypto=(value,secret)=>{
	let str=crypto.createHmac('sha256',secret).update(value).digest('hex');
	return str;
}

exports.register=async(name,pwd,passwd)=>{
	let msg=new Object();
	let user=await User.findOne({name: name});
	let res_pwd=create_crypto(pwd,"secret_key");
	if(name===""||pwd===""||passwd===""){
		msg.code=204;
		msg.con="blank can't be empty";
	}
	else if(pwd!=passwd){
		msg.code=406;
		msg.con="fail to confirm password";
	}
	else if(user){
		msg.code=302;
		msg.con="user already exists";
	}
	else{
		msg=await create_user(name,res_pwd);
	}
	return msg;
}

var create_user=async(name,pwd)=>{
	let msg=await create_room([name]);
	if(msg.code===200){
		let new_user=new User({
			name: name,
			pwd: pwd,
			rooms: [msg.num],
			friends: []
		});
		await new_user.save((err)=>{
			if(err){
				msg.code=500;
				console.log("can't save new_user at create_user");
			}
		});
	}
	return msg;		
}

var create_room=async(member)=>{
	let num=uuidv4();
	let name=set_name(member);
	let msg=new Object();
	let new_room=new Room({
		num: num,
		name: name,
		last_msg: Date.now(),
		member: member
	});
	if(member.length==0){
		msg.code=204;
		msg.con="can't create room with zero members";
	}
	else if(name===""){
		msg.code=500;
		console.log("no name at createroom");
	}
	else{
		await new_room.save((err)=>{
			if(err){
				console.log("can't save Room at create room");
			}
		});
		msg.code=200;
		msg.num=num;
	}	
	await init_msg(member,num);
	return msg;
}

var set_name=(member)=>{
	let name=member[0];
	for(let i=1;i<member.length;i++){
		name+=",";
		name+=member[i];
	}
	return name;
}

var init_msg=async(member,num)=>{
	let sender="system";
	let msg_base=" has attended the room";
	for(let i=0;i<member.length;i++){
		let content=member[i]+msg_base;
		let new_msg=new Msg({
			name: sender,
			content: content,
			room: num,
			createdate: Date.now(),
		});
		await new_msg.save((err)=>{
			if(err){
				console.log(`can't save ${member[i]} msg at init_msg`);
			}
		})
	}
}

exports.init_data=async(name,room)=>{
	let data=new Object();
	data.status=await check_status(name,room);
	if(data.status.code===200){
		let rooms=await load_room(name);
		let friends=await load_friends(name);
		let messages=await load_messages(room,0);
		data.rooms=rooms;
		data.friends=friends;
		data.messages=messages;		
	}	
	return data; 
}

var check_status=async(name,room)=>{
	let status=new Object();
	let user=await User.findOne({name: name});
	if(!user){
		status.code=404;
		status.con="user not exist at init_data";
	}
	else if(!room){
		status.code=204;
		status.con="no room at init_data"
	}
	else if(!user.rooms.includes(room)){
		status.code=404;
		status.con="room not include in user's list at init_data";
	}
	else{
		status.code=200;
	}
	return status;
}

var load_room=async(name)=>{
	let rooms=await Room.find({member:name});
	let result=[];
	for(let i=0;i<rooms.length;++i){
		let attr={name: rooms[i].name,num: rooms[i].num};
		result.push(attr);
	}
	return result;
}

var load_friends=async(name)=>{
	let user=await User.findOne({name: name});
	let friends=user.friends;
	return friends;
}

var load_messages=async(room,start_point)=>{
	let messages=await Msg.find({room: room},null,{sort: {createdate:'desc'}});
	let msg=messages.slice(start_point,start_point+30);
	return msg;
}

exports.append_room=async(member)=>{
	let msg=await create_room(member);
	if(msg.code===200){
		for(let i=0;i<member.length;i++){
			User.updateOne({name: member[i]},{$push: {rooms: msg.num}},(err)=>{
				if(err){
					console.log(`${member[i]} err at appendroom`);
				}
			})
		}
	}
	return msg;	
}

exports.save_msg=async(content,name,room)=>{
	let new_msg=new Msg({
		name: name,
		content: content,
		room: room,
		createdate: Date.now()
	});
	await new_msg.save((err)=>{
		if(err){
			console.log("save msg error at save_msg");
		}
	});
	return [new_msg];
}

exports.load_msg=async(room,msg_num)=>{
	let msg=await load_messages(room,msg_num);
	return msg;
}



