import { Router } from "express";
import { usersData } from "../data/index.js";

const router = Router();

router
  .route("/login")
  .get(async (req, res) => {
    try {
      res.render("authentication/login", {});
    } catch (e) {
      res.status(500).json({ error: e });
    }
  })
  .post(async (req, res) => {
    try {
      const { usernameInput, passwordInput } = req.body;

      let validCredentials = await usersData.isPasswordCorrect(
        usernameInput,
        passwordInput
      );

      if (validCredentials) {
        let currentUser = usersData.getUserByUsername(usernameInput);
        req.session.user = {
          username: currentUser["username"],
          id: currentUser["_id"],
        };
        res.redirect("/");
      } else {
        throw new Error("Invalid Credentials");
      }
    } catch (e) {
      res
        .status(404)
        .render("authentication/login", { error: "Invalid Credentials" });
    }
  });

router.get("/logout", async (req, res) => {
  req.session.destroy();
  res.send("Logged out");
});

router
  .route("/signup")
  .get(async (req, res) => {
    try {
      res.render("authentication/signup", {});
    } catch (e) {
      res.status(500).render("authentication/error");
    }
  })
  .post(async (req, res) => {
    try {
      const { usernameInput, passwordInput } = req.body;

      let createdUser = await usersData.createUser(
        usernameInput,
        passwordInput
      );
      req.session.user = {
        username: createdUser["username"],
        id: createdUser["_id"],
      };
      res.redirect("/");
    } catch (e) {
      res.status(400).render("authentication/signup", { error: e.message });
    }
  });

export default router;
