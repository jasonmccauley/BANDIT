// this is client-side code to join a room to play the game
const socket = io();

let passcode, roomSize, username, roomForm, startButton;
let gameState;

roomForm = document.getElementById("roomForm");
startButton = document.getElementById("startButton");

// checks if the roomForm is submitted
roomForm.addEventListener("submit", (event) => {
  event.preventDefault();

  // currently this is the info we want to store
  passcode = document.getElementById("passcode").value;
  roomSize = document.getElementById("roomSize").value;
  username = document.getElementById("username").value;

  console.log(passcode + " " + roomSize + " " + username);

  // send data to the backend
  socket.emit("joinRoom", {
    passcode: passcode,
    roomSize: roomSize,
    username: username,
  });
});

// navigates all players at the same time to the game screen
startButton.addEventListener("click", () => {
  if (gameState["players"].length < 2) {
    alert("Not enough players");
  } else {
    // 1 player emits this to server, then server emits it back to every player
    socket.emit("navigateToGame", gameState["passcode"]);
  }
});

// this is triggered when app.js does io.to(passcode).emit("joinRoom", someData)
socket.on("joinRoom", (game) => {
  if (game) {
    console.log(game);
    gameState = game;
    let roomStatus = document.getElementById("roomStatus");
    roomStatus.style.display = "block";
    roomStatus.innerHTML = `Room capacity: ${game["players"].length}/${game["roomSize"]}`;

    let playerNumber = document.getElementById("playerNumber");
    playerNumber.style.display = "block";
    playerNumber.innerHTML = `You are player number ${
      game["players"].indexOf(username) + 1
    }`;

    startButton.style.display = "block";
    startButton.href = `/game/${game["passcode"]}`;
    roomForm.style.display = "none";
  } else {
    console.log("error, socket did not send correct value");
  }
});

// window.location.href is used to navigate via client side js
socket.on("navigateToGame", (passcode) => {
  console.log("game started");
  if (passcode) {
    window.location.href = `/game/${passcode}`;
  }
});
