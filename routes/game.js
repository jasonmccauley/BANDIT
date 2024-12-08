import { Router } from "express";

const router = Router();

router.route("/").get(async (req, res) => {
  try {
    res.render("game/makeRoom", { user: req.session.user, game: true });
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
