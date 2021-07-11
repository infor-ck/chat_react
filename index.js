var express=require('express');
var app=express();
var path=require('path');
const server=require("http").Server(app);
var io=require("socket.io")(server,{
	path:"/chat"
});


//other files 
var lib=require("./lib");

var fs = require('fs');
app.engine('jizz', function (filePath, options, callback) { // define the template engine
  fs.readFile(filePath, function (err, content) {
    if (err) return callback(new Error(err));
    // this is an extremely simple template engine
    var rendered = content.toString().replace('#name#', ''+ options.name +'')
    .replace('#room#', ''+ options.room +'').replace('#msg_num#',''+options.msg_num+'');
    return callback(null, rendered);
  });
});
app.set('views', './views'); // specify the views directory
app.set('view engine', 'jizz'); // register the template engine


//socket.io
var socket_connection=require("./socket");
socket_connection(io);

//connect to db
var mongoose=require('mongoose');
mongoose.connect( "mongodb://127.0.0.1:27017/project",{ useNewUrlParser: true,useUnifiedTopology: true,useCreateIndex: true },()=>{
  console.log('connected to mongodb');
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


app.get("/",(req,res,next)=>{
	res.sendFile(__dirname+"/login.html");
})

//api
app.post("/login",async(req,res,next)=>{
	//get input
	let result=await lib.login(req.body.name,req.body.pwd);
	res.send(result);
})

app.post("/register",async(req,res,next)=>{
	//get input
	let result=await lib.register()
	res.send(result);
})

server.listen(8080,()=>{
  console.log("listening...");
});
