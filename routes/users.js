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
    /*get req.body username and password
      const { username, password } = req.body;
      here, you would get the user from the db based on the username, then you would read the hashed pw
      and then compare it to the pw in the req.body
      let match = bcrypt.compare(password, 'HASHED_PW_FROM DB');
      if they match then set req.session.user and then redirect them to the private page
       I will just do that here */
    console.log("im here");
    req.session.user = { firstName: "Patrick", lastName: "Hill", userId: 123 };

    res.redirect("/");
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
      res.status(500).json({ error: e });
    }
  })
  .post(async (req, res) => {
    const { usernameInput, passwordInput } = req.body;
    /*get req.body username and password
      const { username, password } = req.body;
      here, you would get the user from the db based on the username, then you would read the hashed pw
      and then compare it to the pw in the req.body
      let match = bcrypt.compare(password, 'HASHED_PW_FROM DB');
      if they match then set req.session.user and then redirect them to the private page
       I will just do that here */
    console.log("signing up");

    //req.session.user = { firstName: "Patrick", lastName: "Hill", userId: 123 };
    res.json(await usersData.createUser(usernameInput, passwordInput));
  });

export default router;
