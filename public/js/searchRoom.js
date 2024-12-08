// this is client-side code to join a room to play the game
const socket = io();

let passcode, username, roomForm, startButton;
let room_state;

roomForm = document.getElementById("roomForm");
startButton = document.getElementById("startButton");

// checks if the roomForm is submitted
roomForm.addEventListener("submit", (event) => {
  event.preventDefault();

  // currently this is the info we want to store
  passcode = document.getElementById("passcode").value;
  username = document.getElementById("username").value;

  console.log(passcode + " " + username);

  // send data to the backend
  socket.emit("joinRoom", {
    passcode: passcode,
    username: username,
  });
});

// navigates all players at the same time to the game screen
startButton.addEventListener("click", () => {
  if (Object.keys(room_state.connection_map).length < 2) {
    alert("Not enough players");
  } else {
    // 1 player emits this to server, then server emits it back to every player
    socket.emit("startGame", room_state["passcode"]);
  }
});

// this is triggered when app.js does io.to(passcode).emit("joinRoom", someData)
socket.on("joinRoom", (response) => {
  const { game, username } = response;
  if (game) {
    console.log(game);

    if (Object.keys(game.connection_map).length < game["room_size"]) {
      room_state = game;
      let roomStatus = document.getElementById("roomStatus");
      roomStatus.style.display = "block";
      roomStatus.innerHTML = `Room capacity: ${Object.keys(room_state.connection_map).length}/${game["room_size"]}`;

      let playerNumber = document.getElementById("playerNumber");
      playerNumber.style.display = "block";
      playerNumber.innerHTML = `You are player number ${
        game.connection_map[username].player_number
      }`;

      if (game.connection_map[username].player_number === 1) {
        startButton.style.display = "block";
        startButton.href = `/game/${game["passcode"]}`;
      } else {
        document.getElementById("waitForHost").style.display = "block";
      }

      roomForm.style.display = "none";

      window.isConnected = true;
    } else {
      alert("Room is full, please enter another code");
      roomForm.reset();
    }
  } else {
    console.log("error, socket did not send correct value");
  }
});

// window.location.href is used to navigate via client side js
socket.on("navigateToGame", (passcode) => {
  console.log("game started");
  if (passcode) {
    // prevents page transition from being paused by warning
    window.isConnected = false;
    window.location.href = `/game/${passcode}`;
  }
});

// updates player count if someone disconnects
socket.on("refreshPlayerCount", (game) => {
  room_state = game;
  let roomStatus = document.getElementById("roomStatus");
  roomStatus.innerHTML = `Room capacity: ${game["players"].length}/${game["room_size"]}`;

  let playerNumber = document.getElementById("playerNumber");
  playerNumber.innerHTML = `You are player number ${
    game["players"].indexOf(socket.id) + 1
  }`;
  console.log(game);
});
