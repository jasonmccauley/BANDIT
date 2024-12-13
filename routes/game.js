import { Router } from "express";
import { dictionaries } from "../config/mongoCollections.js";
import { letterDecks } from "../game/letterDeck.js";

const router = Router();

router.route("/").get(async (req, res) => {
  try {
    const dictCollection = await dictionaries();
    const dictList = await dictCollection.find({}).toArray();
    const dictionaryNames = dictList.map((dict) => dict.name);
    res.render("game/makeRoom", { user: req.session.user, game: true, dictionaries: dictionaryNames, letterDecks: letterDecks.map((deck)=>deck.name)});
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

router.route("/:gameId").get(async (req, res) => {
  try {
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
