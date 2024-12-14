import express from "express";
import configRoutes from "./routes/index.js";
import exphbs from "express-handlebars";
import session from "express-session";
import http from "http";
import { Server } from "socket.io";
import { dictionaries } from "./config/mongoCollections.js";
import { letterDecks } from "./game/letterDeck.js";

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  // If the user posts to the server with a property called _method, rewrite the request's method
  // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
  // rewritten in this middleware to a PUT route
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }

  // let the next middleware run:
  next();
};

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use("/public", express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);

app.use(
  session({
    name: "BANDIT",
    secret: "super duper secret, change this later",
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 3600000 },
  })
);

app.engine(
  "handlebars",
  exphbs.engine({
    defaultLayout: "main",
    helpers: {
      isValidObject: (input) =>
        typeof input === "object" &&
        !Array.isArray(input) &&
        input !== null &&
        Object.keys(input).length !== 0,
      isEqual: (a, b) => {
        if (a === undefined || b === undefined) {
          return false;
        }
        return a === b;
      },
    },
  })
);
app.set("view engine", "handlebars");

// prevents user from going to login/signup page if they are already logged in
app.use("/users", (req, res, next) => {
  if (req.session.user && (req.path === "/login" || req.path === "/signup")) {
    return res.redirect("/");
  } else {
    next();
  }
});

// prevents user from going to games page if they are not logged in
app.use("/game", (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/users/login");
  } else {
    next();
  }
});

// prevents user from accessing api routes
app.use("/api", (req, res, next) => {
  if (req.headers["ajax"] === "true") {
    next();
  } else {
    return res.redirect("/");
  }
});

// stores game state for all games
import { Gamestate } from "./game/gamestateModel.js";
import { Roomstate } from "./game/roomstate.js";
import xss from "xss";

export const games = {};

// stores each socket id (user) and which room they are part of.
// This makes it easier to remove a player from a lobby if they disconnect
const socketRooms = {};

io.on("connection", (socket) => {
  // this runs when client-side js does "socket.emit("joinRoom")
  socket.on("joinRoom", (response) => {
    let { passcode, username } = response;
    passcode = xss(passcode);
    username = xss(username);
    passcode = passcode.toString();

    console.log("data received:" + [passcode, username]);

    if (!games[passcode]) {
      if (passcode.trim() === "") {
        let roomCode = Math.floor(Math.random() * 1000000);
        roomCode = roomCode.toString().padStart(7, "0");

        while (games.hasOwnProperty(roomCode)) {
          roomCode = Math.floor(Math.random() * 1000000);
          roomCode = roomCode.toString().padStart(7, "0");
        }
        passcode = roomCode;
      }
      games[passcode] = new Roomstate(passcode);
    } else if (!io.sockets.adapter.rooms.get(passcode)) {
      games[passcode] = new Roomstate(passcode);
    }
    if (
      games[passcode].hasOwnProperty("gamestate") &&
      games[passcode].hasOwnProperty("roomstate")
    ) {
      socket.emit(
        "error",
        "Game has already started, please enter a different code"
      );
    } else if (games[passcode].is_full()) {
      socket.emit("error", "The game is full, please enter a different code");
    } else if (games[passcode].get_player_by_name(username)) {
      socket.emit(
        "error",
        "You're already in this game, you can't play against yourself"
      );
    } else {
      socket.join(passcode);
      games[passcode].add_player(username, socket.id);

      const game = games[passcode];
      socketRooms[socket.id] = passcode;

      // for room "passcode" only, send "game" to the client-side js
      io.to(passcode).emit("joinRoom", {
        game: game,
        username: username,
      });
    }
  });

  // when the game is started, everyone in the lobby navigates to /game/:gameId
  //TODO: uses both "players" in gamestate and outside (Should standardize)
  socket.on("startGame", async ({ passcode, dictionary, letterDeck }) => {
    const dictCollection = await dictionaries();
    const thisDict = await dictCollection.findOne({ name: dictionary });
    const selectedDeck = letterDecks.find((deck) => deck.name === letterDeck);
    if (!thisDict) {
      console.log("Dictionary not found: ", dictionary);
      console.log("Emitting to socket ID:", socket.id);
      socket.emit("gameError", "Selected dictionary not found.");
    } else if (!selectedDeck) {
      console.log("Letter deck not found: ", letterDeck);
      socket.emit("gameError", "Selected letter deck not found.");
    } else {
      games[passcode] = {
        gamestate: new Gamestate(
          Object.keys(games[passcode].connection_map),
          thisDict.name,
          selectedDeck.deck
        ),
        roomstate: games[passcode],
      };
      io.to(passcode).emit("navigateToGame", passcode);
    }
  });

  // navigates all players to new page
  socket.on("navigateToGame", (passcode) => {
    passcode = xss(passcode);

    if (games.hasOwnProperty(passcode)) {
      io.to(passcode).emit("navigateToGame", passcode);
    }
  });

  // needed to resync players after something like a page change
  socket.on("resync", (response) => {
    let { passcode, username } = response;
    passcode = xss(passcode);
    username = xss(username);

    console.log("attempting a resync");

    if (games.hasOwnProperty(passcode)) {
      // check if user is part of this game
      if (!games[passcode].roomstate.get_player_by_name(username)) {
        socket.emit("error", "You aren't part of this game");
      } else {
        // after page navigation, the room is deleted from the socket and needs to be recreated
        socket.join(passcode);
        socketRooms[socket.id] = passcode;
        games[passcode].roomstate.connection_map[username].id = socket.id;
        io.to(passcode).emit("resync", passcode);
        io.to(passcode).emit("updateGamestate", games[passcode]);
      }
    } else {
      socket.emit("error", "Game does not exist");
    }
  });

  socket.on("draw", (passcode) => {
    passcode = xss(passcode);

    const game = games[passcode];

    // check to see if it's your turn
    if (
      socket.id !==
      game.roomstate.connection_map[game.gamestate.active_player.name].id
    )
      return;

    game.gamestate.draw();
    game.gamestate.pass();

    if (game.gamestate.winner === null) {
      io.to(passcode).emit("updateGamestate", game);
    } else {
      socket.emit("endGame", game);
    }
  });

  socket.on("guess", async (response) => {
    let { guess, passcode } = response;
    guess = xss(guess);
    passcode = xss(passcode);
    const game = games[passcode];

    let this_room_player = game.roomstate.get_player_by_id(socket.id);
    let this_player = game.gamestate.get_player_by_name(this_room_player.name);

    // todo: get index of player by their roomstate player representation
    await game.gamestate.guess(
      game.gamestate.get_player_index(this_player),
      guess
    );
    console.log(game.gamestate);

    io.to(passcode).emit("updateGamestate", { gamestate: game.gamestate });
  });

  socket.on("sendChatMessage", (chatMessage) => {
    let { gameId, username, message } = chatMessage;
    gameId = xss(gameId);
    username = xss(username);
    message = xss(message);

    io.to(gameId).emit("newChatMessage", {
      username: username,
      message: message,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("endGame", (passcode) => {
    passcode = xss(passcode);

    const game = games[passcode];
    io.to(passcode).emit("updateGamestate", game);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);

    if (Object.keys(games).length > 0) {
      if (io.sockets.adapter.rooms.get(socketRooms[socket.id])) {
        games[socketRooms[socket.id]]["players"] = Array.from(
          io.sockets.adapter.rooms.get(socketRooms[socket.id])
        );
        io.to(socketRooms[socket.id]).emit(
          "refreshPlayerCount",
          games[socketRooms[socket.id]]
        );
      }
      delete socketRooms[socket.id];
    }
  });
});

configRoutes(app);

// remove this block in the future
/*import { dbConnection, closeConnection } from "./config/mongoConnection.js";
import { tests } from "./config/mongoCollections.js";
const db = await dbConnection();
const testCollection = await tests();
const insertInfo = await testCollection.insertOne({ test: 2 });
await closeConnection();*/

server.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
