const socket = io();
let connected = false;
let gameId = document.getElementById("gameId").value;
let connection = document.getElementById("connected");

if (!connected) {
  socket.emit("resync", gameId);
  console.log("not connected");
}
socket.on("resync", (passcode) => {
  console.log("reconnected!");
  socket.emit("updateGamestate", passcode)
  connected = true;
  connection.innerHTML = "You are connected";
  window.isConnected = true;
});
