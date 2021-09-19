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