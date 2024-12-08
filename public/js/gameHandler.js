let draw_button = document.getElementById("drawTileButton");
let table_tiles = document.getElementById("tableTiles");
let guess_form = document.getElementById("guessForm");

draw_button.addEventListener("click", () => {
    socket.emit("draw", gameId);
});

guess_form.addEventListener("submit", (event) => {
    event.preventDefault();
});

socket.on("updateGamestate", (gamestate) => {
    table_tiles.innerHTML = gamestate.table_tiles;
})