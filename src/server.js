import http from "http";
import WebSocket from "ws";
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
const server = http.createServer(app);
// Secure WebSocket Server
const wss = new WebSocket.Server({ server });
const sockets = [];

wss.on("connection", (socket) => {
	sockets.push(socket);
	console.log("Connected to Browser ✅");
	// Browser Socket Closed
	socket.on("close", () => {
		console.log("Disconnected from the Browser ❌");
	});
	// Get Message From FE
	socket.on("message", (message) => {
		// console.log(message.toString('utf-8'));
		sockets.forEach(aSocket => { aSocket.send(message.toString()) });
	});
	// Post Message to FE
	// socket.send("Socket Data!!");
});
server.listen(3000, handleListen);