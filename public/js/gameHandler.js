let draw_button = document.getElementById("drawTileButton");
let table_tiles = document.getElementById("tableTiles");
let words_in_play = document.getElementById("wordsInPlay");
let guess_form = document.getElementById("guessForm");
let current_player = document.getElementById("currentPlayer");
let updateRibbon = document.getElementById("updateRibbon");
let gameIdDisplay = document.getElementById("gameIdDisplay");
let connectedDisplay = document.getElementById("connected");

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
  gameIdDisplay.hidden = true;
  connectedDisplay.hidden = true;

  let gamestate = state.gamestate;
  console.log(state);
  console.log(gamestate);
  if (gamestate.winner === null) {
    let active_player_name = gamestate.active_player.name;

    current_player.innerHTML = active_player_name;
    updateRibbon.innerHTML = gamestate.gameLog[gamestate.gameLog.length - 1];

    draw_button.disabled = !(this_user === gamestate.active_player.name);
    draw_button.innerHTML =
      gamestate.deck.length === 0
        ? "END GAME!"
        : this_user === gamestate.active_player.name
        ? "Draw"
        : "Waiting...";

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
      <h5>The winner is: <span>${gamestate.winner.name}</span></h5>
      <button id="disbandRoom"> Go back to lobby select</button>
      `;
    document.getElementById("disbandRoom").addEventListener("click", () => {
      window.location.href = "/game";
    });
  }
});

// displays socket error
socket.on("error", (message) => {
  $("#gameDiv").attr("hidden", true);
  $("#roomFormError").html(`Error: ${message}`);
  $("#roomFormError").attr("hidden", false);
});

// ends the game, has only 1 player send the end of game request
socket.on("endGame", (state) => {
  let gamestate = state.gamestate;

  let requestConfig = {
    method: "POST",
    url: `${window.location.protocol}//${window.location.host}/api/updateStats`,
    data: { gameId: gameId },
    headers: {
      ajax: "true",
    },
  };
  $.ajax(requestConfig).then(function (responseMessage) {
    socket.emit("endGame", gameId);
  });
});
