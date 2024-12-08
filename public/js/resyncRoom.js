const socket = io();
let connected = false;
let gameId = document.getElementById("gameId").value;
let username = document.getElementById("username").value;
let connection = document.getElementById("connected");

if (!connected) {
  socket.emit("resync", { gameId, username });
  console.log("not connected");
}
socket.on("resync", (passcode) => {
  console.log("reconnected!");
  socket.emit("updateGamestate", passcode);
  connected = true;
  connection.innerHTML = "You are connected";
  window.isConnected = true;
});
