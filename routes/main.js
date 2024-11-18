import { Router } from "express";

const router = Router();

router.route("/").get(async (req, res) => {
  try {
    res.render("home", { user: req.session.user });
  } catch (e) {
    res.status(500).json({ error: e });
  }
});

export default router;
