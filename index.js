var express=require('express');
var app=express();
var path=require('path');
const http = require("http");
const server=http.createServer(app);
const { Server } = require("socket.io");
var cors=require("cors");


//other files 
var lib=require("./lib");


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


//socket.io
const io = new Server(server);
var socket_connection=require("./socket");
socket_connection(io);

//connect to db
var mongoose=require('mongoose');
mongoose.connect( "mongodb://127.0.0.1:27017/chat_react",{ useNewUrlParser: true,useUnifiedTopology: true,useCreateIndex: true },()=>{
  console.log('connected to mongodb');
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.get("/",(req,res,next)=>{
	res.sendFile(__dirname+"/login.html");
});
app.get("/register",(req,res,next)=>{
	res.sendFile(__dirname+"/register.html");
});

//api
app.post("/login",async(req,res,next)=>{
	let result=await lib.login(req.body.name,req.body.pwd);
	if(result.code===200){
		result.data=await lib.init_data(req.body.name,result.num);
	}
	res.send(result);
	console.log(result);
});

app.post("/register",async(req,res,next)=>{
	let result=await lib.register(req.body.name,req.body.pwd,req.body.passwd);
	res.send(result);
	console.log(result);
});

server.listen(8080,()=>{
  console.log("listening...");
});
