let draw_button = document.getElementById("drawTileButton");
let table_tiles = document.getElementById("tableTiles");
let guess_form = document.getElementById("guessForm");
let current_player = document.getElementById("currentPlayer");
let current_player_id = document.getElementById("currentPlayerId");

draw_button.addEventListener("click", () => {
    socket.emit("draw", gameId);
});

guess_form.addEventListener("submit", (event) => {
    event.preventDefault();

    socket.emit("guess", { 
        guess: document.getElementById("guessWord").value,
        passcode: gameId
    });
});

socket.on("updateGamestate", (state) => {
    let gamestate = state.gamestate;
    let roomstate = state.roomstate;

    let active_player_name = gamestate.active_player.name;

    current_player.innerHTML = active_player_name;
    table_tiles.innerHTML = gamestate.table_tiles;
})