import { Router } from "express";

const router = Router();

router.route("/").get(async (req, res) => {
  try {
    res.render("game/makeRoom", { user: req.session.user });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

export default router;
