const socket = io();
let connected = false;
let gameId = document.getElementById("gameId").value;
let connection = document.getElementById("connected");
let gameState;

if (!connected) {
  socket.emit("resync", gameId);
  console.log("not connected");
}
socket.on("resync", (game) => {
  console.log("reconnected!");
  gameState = game;
  console.log(game);
  connected = true;
  connection.innerHTML = "You are connected";
});
