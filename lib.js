var User=require("./db/user");
var crypto=require('crypto');
const { v4: uuidv4 } = require('uuid');

var create_crypto=(value,secret)=>{
	let str=crypto.createHmac('sha256',secret).update(value).digest('hex');
	return str;
}

exports.login=async(name,pwd)=>{
	let msg=new Object();
	let user=await User.findOne({account: name});
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
	let user=await User.findOne({account: name});
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
		msg.code=200;
		//create user
	}
	return msg;
}
