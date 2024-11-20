// this is client-side code to join a room to play the game
const socket = io();

let passcode, roomSize, username, roomForm;

roomForm = document.getElementById("roomForm");
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

// this is triggered when app.js does io.to(passcode).emit("joinRoom", someData)
socket.on("joinRoom", (game) => {
  if (game) {
    console.log(game);
    let roomStatus = document.getElementById("roomStatus");
    roomStatus.style.display = "block";
    roomStatus.innerHTML = `Room capacity: ${game["players"].length}/${game["roomSize"]}`;

    let playerNumber = document.getElementById("playerNumber");
    playerNumber.style.display = "block";
    playerNumber.innerHTML = `You are player number ${
      game["players"].indexOf(username) + 1
    }`;

    if (game["players"].length === 1) {
      let startButton = document.getElementById("startButton");
      startButton.style.display = "block";
      roomForm.style.display = "none";
    }
  } else {
    console.log("error, socket did not send correct value");
  }
});
