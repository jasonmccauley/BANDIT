let button = document.getElementById("drawTileButton")

button.addEventListener("click", () => {
    socket.emit("draw", gameId);
});