import http from "http";
import SocketIO from "socket.io";
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
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
	socket.onAny((event) => {
		console.log(`Socket Event : ${event}`);
	});
	socket.on("enter_room", (roomName, callback) => {
		socket.join(roomName);
		callback();
		socket.to(roomName).emit("welcome");
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