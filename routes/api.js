import { Router } from "express";
import { games } from "../app.js";

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

export default router;
