// How to name import: import nameRoutes from "./name.js";
import { static as staticDir } from "express";
import mainRoutes from "./mainRoutes.js";

const constructorMethod = (app) => {
  app.use("/", mainRoutes);
  app.use("/public", staticDir("public"));
  app.use("*", (req, res) => {
    // change this to redirect or a new "404" page not found screen
    return res.status(404).json({ error: "Not found" });
  });
};

export default constructorMethod;
