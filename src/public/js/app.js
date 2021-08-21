const messageList = document.querySelector("ul");
const nicknameForm = document.querySelector("#nick-name");
const messageForm = document.querySelector("#message");
const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", () => {
	console.log("Connected to Server ✅");
});

socket.addEventListener("message", (message) => {
	const li = document.createElement("li");

	li.innerText = message.data;
	messageList.append(li);
});

socket.addEventListener("close", () => {
	console.log("Disconnected from Server ❌")
});

function makeMessage(type, payload) {
	const msg = { type, payload };
	return JSON.stringify(msg);
}

// NickName Form Event
nicknameForm.addEventListener("submit", (event) => {
	event.preventDefault();
	const input = document.querySelector("input");
	socket.send(makeMessage("nickname", input.value));
});
// Message Form Event
messageForm.addEventListener("submit", (event) => {
	event.preventDefault();
	const input = messageForm.querySelector("input");
	socket.send(makeMessage("new_message", input.value));
	input.value = "";
});