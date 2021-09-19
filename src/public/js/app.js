/**
 * WebSocket(Chatting)
 */
// Front Socket Object
const socket = io();
// Room List
const roomList = document.getElementById("roomList");
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
function showRoomTitle(userCount) {
	const h3 = message.querySelector("h3");
	if (userCount === undefined) {
		h3.innerText = `Room ${roomName}`;
		return;
	}
	h3.innerText = `Room ${roomName} (${userCount})`;
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

// Enter Room
socket.on("welcome", (user, userCount) => {
	addMessage(`${user} joined!!`);
	showRoomTitle(userCount);
});
// Left Room
socket.on("bye", (user, userCount) => {
	addMessage(`${user} left!!`);
	showRoomTitle(userCount);
});
// Update Room List
socket.on("room_change", (rooms) => {
	const list = roomList.querySelector("ul");
	list.innerHTML = "";
	if (rooms.length === 0) {
		return;
	}
	rooms.forEach((room) => {
		const li = document.createElement("li");
		li.innerText = room;
		list.append(li);
	});
});
// Send Message
socket.on("new_message", addMessage);

/**
 * WebRTC(Video)
 */
const videoArea = document.getElementById("videoArea");
const videoAreaForm = videoArea.querySelector("form");
const videoCall = document.getElementById("videoCall");

const video = document.getElementById("myVideo");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const selectCameras = document.getElementById("cameras");

// Stream(Video + Audio)
let stream;
let isMuted = false;
let isCameraOff = false;
let videoRoomName;

videoCall.hidden = true;

function startMedia() {
	videoArea.hidden = true;
	videoCall.hidden = false;
	getMedia();
}

videoAreaForm.addEventListener("submit", (event) => {
	event.preventDefault();
	const input = videoAreaForm.querySelector("input");

	socket.emit("enter_video_room", input.value, startMedia);
	videoRoomName = input.value;
	input.value = "";
});

socket.on("join_video_room", () => {
	console.log("Someone join room");
});

async function getCameras() {
	try {
		const devices = await navigator.mediaDevices.enumerateDevices();
		const cameras = devices.filter((device) => (device.kind === "videoinput"));
		const currentCamera = stream.getVideoTracks()[0];

		cameras.forEach((camera) => {
			const option = document.createElement("option");

			option.value = camera.deviceId;
			option.innerText = camera.label;
			if (currentCamera.label === camera.label) {
				option.selected = true;
			}
			selectCameras.appendChild(option);
		});
	} catch (error) {
		console.log(error);
	}
}

async function getMedia(deviceId) {
	const initialConstraints = {
		audio: true,
		video: { facingMode: "user" }
	};
	const cameraConstraints = {
		audio: true,
		video: { deviceId: { exact: deviceId } },
	};
	try {
		stream = await navigator.mediaDevices.getUserMedia(
			deviceId ? cameraConstraints : initialConstraints
		);
		video.srcObject = stream;
		if (!deviceId) {
			await getCameras();
		}
	} catch (error) {
		console.log(error);
	}
}

// Audio
function handleMuteBtnClick() {
	stream.getAudioTracks().forEach((track) => {
		track.enabled = !track.enabled;
	});
	isMuted = !isMuted;
	muteBtn.innerText = (isMuted) ? "UnMuted" : "Muted";
}
// Video(Camera)
function handleCameraBtnClick() {
	stream.getVideoTracks().forEach((track) => {
		track.enabled = !track.enabled;
	});
	isCameraOff = !isCameraOff;
	cameraBtn.innerText = (isCameraOff) ? "Turn Camera On" : "Turn Camera Off";
}

async function handleCameraChange() {
	await getMedia(selectCameras.value);
}

muteBtn.addEventListener("click", handleMuteBtnClick);
cameraBtn.addEventListener("click", handleCameraBtnClick);
selectCameras.addEventListener("input", handleCameraChange);