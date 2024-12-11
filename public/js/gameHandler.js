let draw_button = document.getElementById("drawTileButton");
let table_tiles = document.getElementById("tableTiles");
let words_in_play = document.getElementById("wordsInPlay");
let guess_form = document.getElementById("guessForm");
let current_player = document.getElementById("currentPlayer");
const this_user = document.getElementById("username").value;

draw_button.addEventListener("click", () => {
    socket.emit("draw", gameId);
});

guess_form.addEventListener("submit", (event) => {
    event.preventDefault();

    socket.emit("guess", {
        guess: document.getElementById("guessWord").value,
        passcode: gameId,
    });

    document.getElementById("guessWord").value = "";
});

socket.on("updateGamestate", (state) => {
    let gamestate = state.gamestate;

    if (gamestate.ongoing) {
        let active_player_name = gamestate.active_player.name;

        current_player.innerHTML = active_player_name;

        draw_button.disabled = !(this_user === gamestate.active_player.name);

        let tiles = [];
        for (const tile of gamestate.table_tiles) {
            tiles.push(`
            <p class="tile">${tile.toUpperCase()}</p>
            `);
        }

        table_tiles.innerHTML = tiles.join("");

        let player_words_str = "";

        const colors = [
            "lightblue",
            "lightgreen",
            "lightsalmon",
            "lavender",
            "navajowhite",
            "mediumaquamarine",
            "tomato",
        ];

        let i = 0;
        for (let player in gamestate.players) {
            let word_list = [];
            for (const word of gamestate.players[player].words) {
                let this_word = [];
                for (const letter of word) {
                    this_word.push(
                        `<p class="tile" style="background-color: ${
                            colors[i]
                        }">${letter.toUpperCase()}</p>`
                    );
                }
                word_list.push(`
                <div class="word">${this_word.join("")}</div>
            `);
            }
            player_words_str += `<span class="username_header">${
                gamestate.players[player].name
            }</span>:<br>
        ${word_list.join("")}
        <br><br>`;
            i++;
        }

        words_in_play.innerHTML = player_words_str;
    } else {
        document.getElementById("gameDiv").innerHTML = `
        <h4>GAME CONCLUDED!</h4>
        <h5>The winner is: <span>${
            gamestate.players.reduce((max, current) => {
                return current.score() > max.score() ? current : max;
            }, gamestate.players[0]).name
        }</span></h5>
        `;
    }
});
