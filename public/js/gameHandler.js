let button = document.getElementById("drawTileButton")
let table_tiles = document.getElementById("tableTiles")

button.addEventListener("click", () => {
    socket.emit("draw", gameId);
});

socket.on("updateGamestate", (gamestate) => {
    table_tiles.innerHTML = gamestate.table_tiles;
})