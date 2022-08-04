//var socket_controller=require('./socket_controller');
var User = require("./db/user");
var lib = require('./lib');
const { v4: uuidv4 } = require('uuid');

module.exports = (io) => {
	return (req, res, next) => {
		io.on("connection", async (socket) => {
			let name = socket.handshake.query.name;
			let room = socket.handshake.query.room;
			let user = await User.findOne({ name: name });
			console.log("connected");
			console.log({ name, room });
			if (user) {
				socket.join(user.rooms);
				console.log("hi")
			}
			socket.emit("jizz")
			socket.on("jizz", () => {
				console.log("jizz")
				// socket.emit("jizz")
			});
			socket.on("send_msg", async (content) => {
				console.log("received");
				let msg = await lib.save_msg(content, name, room);
				io.to(room).emit("receive_send", msg);
			});
			socket.on("load_msg", async (msg_num) => {
				let msg = await lib.load_msg(room, msg_num);
				socket.emit("receive_data", msg);
			});
			//member(array)
			socket.on("create_room", async (member) => {
				let data = await lib.append_room(member);
				io.emit("append_room", data);
			});

		});
		next()
	}
}