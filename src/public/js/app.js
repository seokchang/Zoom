// Front Socket Object
const socket = io();
// Enter Room Form
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");
// NickName Form
const nickname = document.getElementById("nickname");
const nicknameForm = nickname.querySelector("form");
// Message Form
const message = document.getElementById("message");
const messageForm = message.querySelector("form");
let roomName;

nickname.hidden = true;
message.hidden = true; // room 입장 전에는 Message form을 숨김

// Set NickName
function handleNickNameSubmit(event) {
	event.preventDefault();
	const input = nicknameForm.querySelector("input");

	socket.emit("nickname", input.value, roomName, showRoomTitle);
	nickname.hidden = true;
	message.hidden = false;
}

// Send Message
function handleMessageSubmit(event) {
	event.preventDefault();
	const input = messageForm.querySelector("input");
	const message = input.value;
	/**
	 * @param arg1 : event
	 * @param arg2 : room
	 * @param arg3 : msg
	 * @param LastArg : callback function
	 */
	socket.emit("new_message", roomName, input.value, () => {
		addMessage(`You : ${message}`);
	});
	input.value = "";
}

// Open NickName Form
function openNickNameForm() {
	welcome.hidden = true;
	nickname.hidden = false;
}

// Set Room Title
function showRoomTitle() {
	const h3 = message.querySelector("h3");
	h3.innerText = `Room ${roomName}`;
}

// Send Message
function addMessage(msg) {
	const ul = message.querySelector("ul");
	const li = document.createElement("li");

	li.innerText = msg;
	ul.appendChild(li);
}

welcomeForm.addEventListener("submit", (event) => {
	event.preventDefault();
	const input = welcomeForm.querySelector("input");
	/**
	 * socket.emit()
	 * @param arg1 : event name
	 * @param arg2 : send data
	 * @param LastParam : callback function
	 */
	socket.emit("enter_room", input.value, openNickNameForm);
	roomName = input.value;
	input.value = "";
});

nicknameForm.addEventListener("submit", handleNickNameSubmit);
messageForm.addEventListener("submit", handleMessageSubmit);

socket.on("welcome", (user) => {
	addMessage(`${user} joined!!`);
});

socket.on("bye", (user) => {
	addMessage(`${user} left!!`);
});

socket.on("new_message", addMessage);