import express from "express";
import configRoutes from "./routes/index.js";
import exphbs from "express-handlebars";
import session from "express-session";
import http from "http";
import { Server } from "socket.io";

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
    cookie: { maxAge: 60000 },
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

// stores game state for all games
const games = {};

io.on("connection", (socket) => {
  // this runs when client-side js does "socket.emit("joinRoom")
  socket.on("joinRoom", (response) => {
    const { passcode, roomSize, username } = response;

    console.log("data received:" + [passcode, roomSize, username]);

    // socket.join acts as a socket room
    socket.join(passcode);

    if (!games[passcode]) {
      games[passcode] = {
        tiles: [],
        words: [],
        players: [],
        roomSize: roomSize,
        currentPlayer: 0,
        canJoin: true,
      };
    }
    const game = games[passcode];
    game["players"].push(username);

    // for room "passcode" only, send "game" to the client-side js
    io.to(passcode).emit("joinRoom", game);
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
