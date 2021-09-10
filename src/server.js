import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
// app.listen(3000, handleListen);

// HTTP Server
const httpServer = http.createServer(app);
// SocketIO Server
const wsServer = new Server(httpServer, {
	cors: {
		origin: ["https://admin.socket.io"],
		credentials: true
	}
});

instrument(wsServer, {
	auth: false
});

function getPublicRooms() {
	const {
		sockets: {
			adapter: { sids, rooms },
		},
	} = wsServer;
	const publicRooms = [];

	rooms.forEach((_, key) => {
		if (sids.get(key) === undefined) {
			publicRooms.push(key);
		}
	});
	return publicRooms;
}

function getRoomCount(roomName) {
	return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
	socket.onAny((event) => {
		console.log(`Socket Event : ${event}`);
	});
	// Enter Room
	socket.on("enter_room", (roomName, callback) => {
		socket.join(roomName);
		callback();
		wsServer.sockets.emit("room_change", getPublicRooms());
	});
	// Left Room
	socket.on("disconnecting", () => {
		socket.rooms.forEach((room) => socket.to(room).emit("bye", socket.nickname, getRoomCount(room) - 1));
	});
	socket.on("disconnect", () => {
		wsServer.sockets.emit("room_change", getPublicRooms());
	});
	// Set NickName
	socket.on("nickname", (nickname, roomName, callback) => {
		socket["nickname"] = nickname;
		callback();
		socket.to(roomName).emit("welcome", socket.nickname, getRoomCount(roomName));
	});
	// Send Message
	socket.on("new_message", (room, msg, callback) => {
		socket.to(room).emit("new_message", `${socket.nickname} : ${msg}`);
		callback();
	});
});

//#region  WebSocket
// Secure WebSocket Server
// const wss = new WebSocket.Server({ server });
// const sockets = [];

// wss.on("connection", (socket) => {
// 	sockets.push(socket);
// 	socket["nickname"] = "Anonymous";
// 	console.log("Connected to Browser ✅");
// 	// Browser Socket Closed
// 	socket.on("close", () => {
// 		console.log("Disconnected from the Browser ❌");
// 	});
// 	// Get Message From FE
// 	socket.on("message", (message) => {
// 		const msg = JSON.parse(message);
// 		switch (msg.type) {
// 			case "new_message":
// 				sockets.forEach((aSocket) => {
// 					aSocket.send(`${socket.nickname} : ${msg.payload}`);
// 				});
// 				break;
// 			case "nickname":
// 				socket["nickname"] = msg.payload;
// 				break;
// 		}
// 	});
// 	// Post Message to FE
// 	// socket.send("Socket Data!!");
// });
//#endregion
httpServer.listen(3000, handleListen);