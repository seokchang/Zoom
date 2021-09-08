// Front Socket Object
const socket = io();
// Enter Room Form
const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
// Message Form
const room = document.getElementById("room");
let roomName;

room.hidden = true; // room 입장 전에는 Message form을 숨김

function showRoom() {
	welcome.hidden = true;
	room.hidden = false;

	const h3 = room.querySelector("h3");
	h3.innerText = `Room ${roomName}`;
}

function addMessage(msg) {
	const ul = room.querySelector("ul");
	const li = document.createElement("li");

	li.innerText = msg;
	ul.appendChild(li);
}

form.addEventListener("submit", (event) => {
	event.preventDefault();
	const input = form.querySelector("input");
	/**
	 * socket.emit()
	 * @param arg1 : event name
	 * @param arg2 : send data
	 * @param LastParam : callback function
	 */
	socket.emit("enter_room", { payload: input.value }, showRoom);
	roomName = input.value;
	input.value = "";
});

socket.on("welcome", () => {
	addMessage("Someone joined!!");
});