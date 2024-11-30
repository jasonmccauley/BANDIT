const socket = io();
let connected = false;
let gameId = document.getElementById("gameId");
let connection = document.getElementById("connected");
if (!connected) {
  socket.emit("resyncRoom", gameId);
}
socket.on("resyncRoom", (game) => {
  console.log("reconnected!");
  connected = true;
  connection.innerHTML = "You are connected";
});
