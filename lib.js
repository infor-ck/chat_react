var User=require("./db/user");
var Room = require("./db/room");
var crypto=require('crypto');
const { v4: uuidv4 } = require('uuid');

var create_crypto=(value,secret)=>{
	let str=crypto.createHmac('sha256',secret).update(value).digest('hex');
	return str;
}

var set_name=(member)=>{
	let name=member[0];
	for(let i=1;i<member.length;i++){
		name+=",";
		name+=member[i];
	}
	return name;
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
	//await init_msg(member,num); //not ready
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
	}
	return msg;
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

