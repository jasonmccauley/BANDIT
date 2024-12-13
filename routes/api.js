import { Router } from "express";
import { games } from "../app.js";
import { usersData } from "../data/index.js";
import { checkMessage } from "../validation.js";

import xss from "xss";

const router = Router();

router.route("/rooms").get(async (req, res) => {
  try {
    let gamesArray = [];

    Object.values(games).forEach((game) => {
      console.log(game);
      if (
        !game.hasOwnProperty("gamestate") &&
        !game.hasOwnProperty("roomstate")
      ) {
        gamesArray.push({
          passcode: game.get_passcode(),
          playerCount: game.get_player_count(),
        });
      }
    });
    res.json(gamesArray);
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

router.route("/updateStats").post(async (req, res) => {
  try {
    // sanitize req.body
    for (let field in req.query) {
      req.body[field] = xss(req.body[field]);
    }

    games[req.body.gameId].gamestate.updatedPlayers = true;
    console.log(req.body.gameId);
    let players = games[req.body.gameId].gamestate.get_all_players();
    console.log(players);
    players.forEach((player) => {
      usersData.updateGamesPlayed(player);

      if (player === xss(games[req.body.gameId].gamestate.winner.name)) {
        usersData.updateGamesWon(player);
      }
    });

    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

router.route("/chat").post(async (req, res) => {
  try {
    // sanitize req.body
    for (let field in req.body) {
      req.body[field] = xss(req.body[field]);
    }
    let { message } = req.body;
    message = checkMessage(message);
  } catch (e) {
    return res.status(400).json({ error: e.toString() });
  }

  res.status(200).json({ success: true, message: "Message validated" });
});

export default router;
