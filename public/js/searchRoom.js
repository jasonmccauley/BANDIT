// this is client-side code to join a room to play the game
const socket = io();

function bindEventsLink(link) {
  link.find("a").on("click", function (event) {
    event.preventDefault();
    username = document.getElementById("username").value;

    let currentLink = $(this);
    let currentId = currentLink.data("id");

    socket.emit("joinRoom", {
      passcode: currentId,
      username: username,
    });
  });
}

function refreshRoomList() {
  $("#refreshStatus").attr("hidden", true);
  $("#roomList").attr("hidden", true);
  $("#roomList").html("");
  let requestConfig = {
    method: "GET",
    url: "http://localhost:3000/api/rooms",
    headers: {
      ajax: "true",
    },
  };
  $.ajax(requestConfig).then(function (responseMessage) {
    if (!Array.isArray(responseMessage) || responseMessage.length === 0) {
      $("#refreshStatus").html("No open lobbies");
      $("#refreshStatus").attr("hidden", false);
    } else {
      responseMessage.forEach((openRoom) => {
        $("#roomList").append(
          `<li class="openRoom">Room: ${openRoom.passcode} Player Count: ${openRoom.playerCount}/5 <a data-id="${openRoom.passcode}" href='javascript:void(0)'>Join</li>`
        );
      });
      bindEventsLink($($("#roomList")[$("#roomList").length - 1]));
      $("#roomList").attr("hidden", false);
    }
  });
}

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

// updates the list of available rooms
refreshRoomList();

$("#refreshRoomList").on("click", (event) => {
  event.preventDefault();
  refreshRoomList();
});

// this is triggered when app.js does io.to(passcode).emit("joinRoom", someData)
socket.on("joinRoom", (response) => {
  const { game, username } = response;
  if (game) {
    console.log(game);

    $("#roomListDiv").attr("hidden", true);
    if (Object.keys(game.connection_map).length < game["room_size"]) {
      room_state = game;
      let roomStatus = document.getElementById("roomStatus");
      roomStatus.hidden = false;
      roomStatus.innerHTML = `Room capacity: ${
        Object.keys(room_state.connection_map).length
      }/${game["room_size"]}`;

      let playerNumber = document.getElementById("playerNumber");
      playerNumber.hidden = false;
      playerNumber.innerHTML = `You are player number ${
        game.connection_map[$("#username").val()].player_number
      }`;

      if (game.connection_map[username].player_number === 1) {
        startButton.hidden = false;
        startButton.href = `/game/${game["passcode"]}`;
      } else if (startButton.hidden) {
        document.getElementById("waitForHost").hidden = false;
      }

      $("#roomFormDiv").attr("hidden", true);

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
    game.connection_map[$("#username").val()].player_number
  }`;
  console.log(game);
});

// displays socket error
socket.on("error", (message) => {
  $("#roomFormError").html(`Error: ${message}`);
  $("#roomFormError").attr("hidden", false);
});
