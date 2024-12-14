import { Router } from "express";
import { dictionaries } from "../config/mongoCollections.js";
import { letterDecks } from "../game/letterDeck.js";
import xss from "xss";

const router = Router();

router.route("/").get(async (req, res) => {
  try {
    // sanitize req.body
    for (let field in req.body) {
      req.body[field] = xss(req.body[field]);
    }
    const dictionaryNames = ["DWYL", "Scrabble", "antique", "Unix"];
    res.render("game/makeRoom", { user: req.session.user, game: true, dictionaries: dictionaryNames, letterDecks: letterDecks.map((deck)=>deck.name)});
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

router.route("/:gameId").get(async (req, res) => {
  try {
    // sanitize req.body
    for (let field in req.body) {
      req.body[field] = xss(req.body[field]);
    }
    res.render("game/game", {
      user: req.session.user,
      game: true,
      gameId: req.params.gameId
    });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

export default router;
