const socket = io();
let connected = false;
let gameId = document.getElementById("gameId").value;
let connection = document.getElementById("connected");

if (!connected) {
  socket.emit("resync", gameId);
  console.log("not connected");
}
socket.on("resync", (game) => {
  console.log("reconnected!");
  connected = true;
  connection.innerHTML = "You are connected";
  window.isConnected = true;
});
