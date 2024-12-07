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
import { SingleGamestate } from "./game/gamestateModel.js";
import { games } from './routes/game.js'

// stores each socket id (user) and which room they are part of. 
// This makes it easier to remove a player from a lobby if they disconnect
const socketRooms = {};

io.on("connection", (socket) => {
    // this runs when client-side js does "socket.emit("joinRoom")
    socket.on("joinRoom", (response) => {
        const { passcode, username } = response;

        console.log("data received:" + [passcode, username]);

        socket.join(passcode);

        if (!games[passcode]) {
            games[passcode] = {
                players: Array.from(io.sockets.adapter.rooms.get(passcode)),
                roomSize: 5,
                canJoin: true,
                passcode: passcode,
            };
        } else {
            games[passcode]["players"] = Array.from(
                io.sockets.adapter.rooms.get(passcode)
            );
        }

        const game = games[passcode];
        socketRooms[socket.id] = passcode;

        // for room "passcode" only, send "game" to the client-side js
        io.to(passcode).emit("joinRoom", game);
    });

    // when the game is started, everyone in the lobby navigates to /game/:gameId
    //TODO: uses both "players" in gamestate and outside (Should standardize)
    socket.on("startGame", (passcode) => {
        games[passcode] = {
            gamestate: new SingleGamestate(
                games[passcode]["players"],
                "Scrabble"
            ),
            players: games[passcode]["players"]
        };

        io.to(passcode).emit("navigateToGame", passcode);
    });

    // navigates all players to new page
    socket.on("navigateToGame", (passcode) => {
        if (games.hasOwnProperty(passcode)) {
            io.to(passcode).emit("navigateToGame", passcode);
        }
    });

    // needed to resync players after something like a page change
    socket.on("resync", (passcode) => {
        console.log("attempting a resync");

        if (games.hasOwnProperty(passcode)) {
            // after page navigation, the room is deleted from the socket and needs to be recreated
            socket.join(passcode);
            io.to(passcode).emit("resync");
        }
    });

    socket.on("draw", (passcode) => {
        games[passcode].gamestate.draw();
        io.to(passcode).emit("updateGamestate", games[passcode].gamestate);
    })

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
