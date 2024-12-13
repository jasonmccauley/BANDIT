import { Router } from "express";
import { usersData } from "../data/index.js";
import * as validation from "../validation.js";
import xss from "xss";

const router = Router();

router
  .route("/login")
  .get(async (req, res) => {
    try {
      res.render("authentication/login", { account: true });
    } catch (e) {
      res.status(500).json({ error: e });
    }
  })
  .post(async (req, res) => {
    try {
      // sanitize req.body
      for (let field in req.body) {
        req.body[field] = xss(req.body[field]);
      }

      validation.doesExist(req.body.usernameInput);
      validation.doesExist(req.body.passwordInput);

      req.body.usernameInput = validation.isProperString(
        req.body.usernameInput
      );
      req.body.passwordInput = validation.isProperString(
        req.body.passwordInput
      );

      const { usernameInput, passwordInput } = req.body;

      let validCredentials = await usersData.isPasswordCorrect(
        usernameInput,
        passwordInput
      );

      if (validCredentials) {
        let currentUser = await usersData.getUserByUsername(usernameInput);
        req.session.user = {
          username: currentUser["username"],
          id: currentUser["_id"],
        };
        res.redirect("/");
      } else {
        throw new Error("Invalid Credentials");
      }
    } catch (e) {
      res.status(404).render("authentication/login", {
        error: "Invalid Credentials",
        account: true,
      });
    }
  });

router.get("/logout", async (req, res) => {
  req.session.destroy();
  res.redirect("/"); // Redirect to the homepage after logout
});

router
  .route("/signup")
  .get(async (req, res) => {
    try {
      res.render("authentication/signup", { account: true });
    } catch (e) {
      res.status(500).render("authentication/error", { account: true });
    }
  })
  .post(async (req, res) => {
    try {
      validation.doesExist(req.body);

      // sanitize req.body
      for (let field in req.body) {
        req.body[field] = xss(req.body[field]);
      }

      validation.doesExist(req.body.usernameInput);
      validation.doesExist(req.body.passwordInput);
      validation.doesExist(req.body.reenterPasswordInput);
      validation.doesExist(req.body.birthdayInput);

      req.body.usernameInput = validation.isProperString(
        req.body.usernameInput
      );
      req.body.passwordInput = validation.isProperString(
        req.body.passwordInput
      );
      req.body.reenterPasswordInput = validation.isProperString(
        req.body.reenterPasswordInput
      );
      req.body.birthdayInput = validation.isProperString(
        req.body.birthdayInput
      );

      let age = validation.isValidDate(req.body.birthdayInput);

      if (age < 13) {
        throw new Error(
          "Children younger than 13 are not allowed due to COPPA"
        );
      }
      if (req.body.passwordInput !== req.body.reenterPasswordInput) {
        throw new Error("Passwords do not match");
      }

      const { usernameInput, passwordInput, birthdayInput } = req.body;
      //console.log("Birthday input before calling on data functions: " + birthdayInput);

      let createdUser = await usersData.createUser(
        usernameInput,
        passwordInput,
        birthdayInput
      );
      req.session.user = {
        username: createdUser["username"],
        id: createdUser["_id"],
      };
      res.redirect("/");
    } catch (e) {
      res
        .status(400)
        .render("authentication/signup", { error: e.message, account: true });
    }
  });

router
  .route("/:userId")
  .get(async (req, res) => {
    try {
      /*
      // Ensure user is logged in
      if (!req.session.user) {
        return res.redirect("/users/login"); // Redirect to login if not authenticated
      }

      // Restrict access to the user who owns the profile
      if (req.session.user.id !== req.params.userId) {
        return res.status(403).render("authentication/error", {
          user: req.session.user,
          error: "You are not authorized to view this profile.",
        });
      }
      */
      let user = await usersData.getUserById(req.params.userId);
      delete user.password;

      res.render("profile", { foundUser: user, user: req.session.user });
    } catch (e) {
      res.status(404).render("authentication/error", {
        user: req.session.user,
        error: e.message,
      });
    }
  }) //updating of profile done as a post request instead of a patch as HTML does not support patch requests
  .post(async (req, res) => {
    try {
      // sanitize req.body
      for (let field in req.body) {
        req.body[field] = xss(req.body[field]);
      }
      const userId = xss(req.params.userId);
      const { newBio } = req.body;
      const updatedUser = await usersData.updateUserProfile(userId, newBio);
      res.redirect(`/users/${userId}`); //reroute back to the users profile after sucessfully updating
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });
export default router;
